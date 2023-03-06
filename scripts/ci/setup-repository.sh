#!/usr/bin/env bash

repo="${REPOSITORY}"
# shellcheck disable=SC2153
gist_token="${GIST_TOKEN}"
# shellcheck disable=SC2153
debug="$DEBUG"
if [ "$DEBUG" = "1" ]; then
	set -x
fi

set -euo pipefail

./scripts/ci/setup-cloudflare-single.sh "$repo" "Unit Test" "Report"
./scripts/ci/setup-cloudflare-single.sh "$repo" "Unit Test" "Coverage"
./scripts/ci/setup-cloudflare-single.sh "$repo" "Int Test" "Report"
./scripts/ci/setup-cloudflare-single.sh "$repo" "Int Test" "Coverage"

prefix_repo=$(echo "$repo" | tr '[:upper:]' '[:lower:]' | sed 's/\//-/g' | tr -cd '[:alnum:] _-' | sed 's/ /-/g')
prefix_repo="$prefix_repo-"

# generate GIST
resp=$(
	curl --request POST \
		--url https://api.github.com/gists \
		--fail-with-body \
		-H 'Accept: application/vnd.github+json' \
		-H "Authorization: Bearer ${gist_token}" \
		-H 'Content-Type: application/json' \
		-H 'X-GitHub-Api-Version: 2022-11-28' \
		-d '{
  "description": "Datastore for CI",
  "public": false,
  "files": {
    "README.json": {
      "content": "{}"
    }
  }
 }'
)
if [ "$debug" = "1" ]; then
	echo "$resp"
fi
gist_id="$(echo "$resp" | jq -r '.id')"
{
	echo "prefix: $prefix_repo"
	echo "gist_id: $gist_id"
} >>"repo.yaml"
gomplate -d config=./repo.yaml -f ./cicd.yml --left-delim "{{{" --right-delim "}}}" -o ./.github/workflows/cicd.yml

# clean up
rm repo.yaml
rm cicd.yml
rm ./.github/workflows/setup.yml
rm ./.github/workflows/unsetup.yml
rm ./scripts/ci/setup-cloudflare-single.sh
rm ./scripts/ci/setup-repository.sh
rm ./scripts/ci/delete-cloudflare-single.sh
rm ./scripts/ci/unsetup-repository.sh
