#!/usr/bin/env bash

noninteractive="${NON_INTERACTIVE}"
# shellcheck disable=SC2153
domain="${DOMAIN}"
sub="${CF_SUB}"
bearer="${CF_TOKEN}"
account="${CF_ACCOUNT_ID}"
zone="${CF_ZONE}"
warp="${CF_WARP_ID}"
okta="${CF_OKTA_ID}"
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
	echo "  Warp Device ID:      $warp"
	echo "  Okta IDP ID:         $okta"
fi

if [ "${noninteractive}" != "1" ]; then
	read -rn 1 -p "❓ The above values looks valid (y/n): " answer
	echo ""
	if [ "$answer" != 'y' ]; then
		echo "⚠️ Incorrect values, aborting..."
		exit 1
	fi
fi

echo "✅ Values detected assumed to be correct, generating pages..."

echo "📃 Generating Cloudflare Pages..."
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOF
{
  "build_config": {
    "build_command": "npm run build",
    "destination_dir": "build",
    "root_dir": "/"
  },
  "canonical_deployment": null,
  "deployment_configs": null,
  "latest_deployment": null,
  "name": "$project",
  "production_branch": "main"
}
EOF
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Cloudflare pages generated!"
else
	echo "❌ Failed to generate Cloudflare pages!"
	echo "$resp"
	exit 1
fi

echo "🔗 Adding custom domain to CloudFlare pages..."
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}/domains" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOF
{
	"name" : "${fqdn}"
}
EOF
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Cloudflare pages registered custom domain name!"
else
	echo "❌ Failed to register custom domain with Cloudflare pages"
	echo "$resp"
	exit 1
fi

echo "🔗 Adding custom domain to DNS as CNAME..."
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/zones/${zone}/dns_records" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOF
{
	"type": "CNAME",
  "content": "${project}.pages.dev",
  "name": "${subdomain}.${sub}",
  "priority": 10,
  "proxied": true,
  "tags": [],
  "comment": "Automatically generated from CyanPrint",
  "ttl": 1
}
EOF
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Custom domain added as CNAME!"
else
	echo "❌ Failed to add custom domain as CNAME"
	echo "$resp"
	exit 1
fi

echo "📱 Registering original domain '${project}.pages.dev' as App..."
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOF
{
	"type": "self_hosted",
	"name": "${display}",
	"domain": "${project}.pages.dev",
	"app_launcher_visible": false,
	"session_duration": "24h",
	"allowed_idps": [
		"${okta}"
	],
	"auto_redirect_to_identity": true,
	"enable_binding_cookie": false,
	"http_only_cookie_attribute": false
}
EOF
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Registered original domain '${project}.pages.dev' as App"
else
	echo "❌ Failed to register original domain '${project}.pages.dev' as App"
	echo "$resp"
	exit 1
fi

echo "🔐 Restricting original domain '${project}.pages.dev' behind VPN to engineers only..."
app_id=$(echo "$resp" | jq -r '.result.uid')
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps/${app_id}/policies" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOL
{
  "precedence": 1,
  "decision": "allow",
  "name": "Engineers",
  "include": [
    {
      "device_posture": {
        "integration_uid": "${warp}"
      }
    }
  ],
  "require": [
    {
      "okta": {
        "name": "Engineering",
        "identity_provider_id": "${okta}"
      }
    }
  ],
  "exclude": []
}
EOL
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Restricted original domain '${project}.pages.dev' behind VPN"
else
	echo "❌ Failed to restrict original domain '${project}.pages.dev' behind VPN"
	echo "$resp"
	exit 1
fi

echo "📱 Registering wildcard of original domain '*.${project}.pages.dev' as App..."
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOF
{
	"type": "self_hosted",
	"name": "${display}",
	"domain": "*.${project}.pages.dev",
	"app_launcher_visible": false,
	"session_duration": "24h",
	"allowed_idps": [
		"${okta}"
	],
	"auto_redirect_to_identity": true,
	"enable_binding_cookie": false,
	"http_only_cookie_attribute": false
}
EOF
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Registered original domain '*.${project}.pages.dev' as App"
else
	echo "❌ Failed to register original domain '*.${project}.pages.dev' as App"
	echo "$resp"
	exit 1
fi

echo "🔐 Restricting original domain '*.${project}.pages.dev' behind VPN to engineers only..."
app_id=$(echo "$resp" | jq -r '.result.uid')
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps/${app_id}/policies" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOL
{
  "precedence": 1,
  "decision": "allow",
  "name": "Engineers",
  "include": [
    {
      "device_posture": {
        "integration_uid": "${warp}"
      }
    }
  ],
  "require": [
    {
      "okta": {
        "name": "Engineering",
        "identity_provider_id": "${okta}"
      }
    }
  ],
  "exclude": []
}
EOL
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Restricted wildcard of original domain '*.${project}.pages.dev' behind VPN"
else
	echo "❌ Failed to restrict wildcard of original domain '*.${project}.pages.dev' behind VPN"
	echo "$resp"
	exit 1
fi

echo "📱 Registering custom domain '${fqdn}' as App..."
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOF
{
	"type": "self_hosted",
	"name": "${display}",
	"domain": "${fqdn}",
	"app_launcher_visible": false,
	"session_duration": "24h",
	"allowed_idps": [
		"${okta}"
	],
	"auto_redirect_to_identity": true,
	"enable_binding_cookie": false,
	"http_only_cookie_attribute": false
}
EOF
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Registered custom domain '${fqdn}' as App"
else
	echo "❌ Failed to register custom domain '${fqdn}' as App"
	echo "$resp"
	exit 1
fi

echo "🔐 Restricting custom domain '${fqdn}' behind VPN to engineers only..."
app_id=$(echo "$resp" | jq -r '.result.uid')
resp=$(
	curl --request POST \
		--url "https://api.cloudflare.com/client/v4/accounts/${account}/access/apps/${app_id}/policies" \
		-H "Authorization: Bearer ${bearer}" \
		-H 'Content-Type: application/json' \
		-d @- <<EOL
{
  "precedence": 1,
  "decision": "allow",
  "name": "Engineers",
  "include": [
    {
      "device_posture": {
        "integration_uid": "${warp}"
      }
    }
  ],
  "require": [
    {
      "okta": {
        "name": "Engineering",
        "identity_provider_id": "${okta}"
      }
    }
  ],
  "exclude": []
}
EOL
)
if [ "${debug}" = "1" ]; then
	echo "$resp"
	exit 1
fi
if [ "$(echo "$resp" | jq '.success')" = "true" ]; then
	echo "✅ Restricted custom domain '${fqdn}' behind VPN"
else
	echo "❌ Failed to restricted custom domain '${fqdn}' behind VPN"
	echo "$resp"
	exit 1
fi

echo "✍️ Update documentation..."
key=$(echo "$name-$type" | sed 's/-/_/g')
echo "$key: $project" >>"repo.yaml"
echo "✅ Updated"
