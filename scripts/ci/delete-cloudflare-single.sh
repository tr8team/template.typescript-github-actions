#!/usr/bin/env bash

noninteractive="${NON_INTERACTIVE}"
# shellcheck disable=SC2153
domain="${DOMAIN}"
sub="${CF_SUB}"
bearer="${CF_TOKEN}"
account="${CF_ACCOUNT_ID}"
zone="${CF_ZONE}"
# shellcheck disable=SC2153
debug="${DEBUG}"

set -euo pipefail

if [ "${debug}" = "1" ]; then
	set -x
fi

r_repo="$1"
r_name="$2"
r_type="$3"

repo=$(echo "$r_repo" | tr '[:upper:]' '[:lower:]' | sed 's/\//-/g' | tr -cd '[:alnum:] _-' | sed 's/ /-/g')
name=$(echo "$r_name" | tr '[:upper:]' '[:lower:]' | sed 's/\//-/g' | tr -cd '[:alnum:] _-' | sed 's/ /-/g')
type=$(echo "$r_type" | tr '[:upper:]' '[:lower:]' | sed 's/\//-/g' | tr -cd '[:alnum:] _-' | sed 's/ /-/g')

project="$type-$name-$repo"
subdomain="$type.$name.$repo"
display="$r_repo $r_name $r_type"
fqdn="$subdomain.$sub.$domain"

echo "🔎 Detected Values:"
echo "  Repository:          $repo"
echo "  Name:                $name"
echo "  Type:                $type"
echo "  Project:             $project"
echo "  Base Zone Domain:    $domain"
echo "  Delimiter Subdomain: $sub"
echo "  FQDN:                $subdomain.$sub.$domain"
echo "  Display Name:        $display"
if [ "${debug}" = "1" ]; then
	echo "  Cloudflare Acc ID:   $account"
	echo "  Cloudflare Zone ID:  $zone"
fi

if [ "${noninteractive}" != "1" ]; then
	read -rn 1 -p "❓ The above values looks valid (y/n): " answer
	echo ""
	if [ "$answer" != 'y' ]; then
		echo "⚠️ Incorrect values, aborting..."
		exit 1
	fi
fi

echo "📥 Retrieving custom applications..."
resp=$(curl "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps" \
	-H "Authorization: Bearer ${bearer}")

if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Retrieved custom applications"
	echo "$resp" | jq -rc --arg DISPLAY "$display" '.result[] | select(.name | contains($DISPLAY)) | .id' | while read -r i; do
		echo "🗑 Deleting custom app '$i'..."
		resp=$(curl --request DELETE \
			--url "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps/${i}" \
			-H "Authorization: Bearer ${bearer}")
		if [ "${debug}" = "1" ]; then
			echo "$resp"
		fi
		if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
			echo "✅ Deleted custom app '$i'"
		else
			echo "❌ Failed to delete custom app '$i'"
			echo "$resp"
		fi
	done
else
	echo "❌ Failed to retrieve custom applications"
	echo "$resp"
fi

echo "🔗 Deleting custom domain from CloudFlare pages..."
resp=$(
	curl --request DELETE \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/domains/${fqdn}" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json'
)

if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Deleted domain from CloudFlare Pages!"
else
	echo "❌ Failed to delete custom domain from Cloudflare pages"
	echo "$resp"
fi

echo "📃 Deleting Cloudflare Pages..."
resp=$(
	curl --request DELETE \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json'
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Cloudflare pages generated!"
else
	echo "❌ Failed to generate Cloudflare pages!"
	echo "$resp"
fi
