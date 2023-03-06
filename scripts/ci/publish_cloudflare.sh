#!/usr/bin/env bash

[ "$CLOUDFLARE_API_TOKEN" = '' ] && echo "CLOUDFLARE_API_TOKEN required" && exit 1
[ "$CLOUDFLARE_ACCOUNT_ID" = '' ] && echo "CLOUDFLARE_ACCOUNT_ID required" && exit 1
[ "$DIRECTORY" = '' ] && echo "DIRECTORY required" && exit 1
[ "$PROJECT_NAME" = '' ] && echo "PROJECT_NAME required" && exit 1

set -eou pipefail

wrangler pages publish "${DIRECTORY}" --project-name="${PROJECT_NAME}" --commit-dirty=true

resp=$(curl "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments" \
	-H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}")

id=$(echo "$resp" | jq -r '.result[0].id')
url=$(echo "$resp" | jq -r '.result[0].url')
environment=$(echo "$resp" | jq -r '.result[0].environment')

# Write to Github Action output
{
	echo "id=${id}"
	echo "url=${url}"
	echo "environment=${environment}"
} >>"$GITHUB_OUTPUT"
