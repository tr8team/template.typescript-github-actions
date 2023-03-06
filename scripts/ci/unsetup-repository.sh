#!/usr/bin/env bash

repo="${REPOSITORY}"

if [ "$DEBUG" = "1" ]; then
	set -x
fi

set -euo pipefail

./scripts/ci/delete-cloudflare-single.sh "$repo" "Unit Test" "Report"
./scripts/ci/delete-cloudflare-single.sh "$repo" "Unit Test" "Coverage"
./scripts/ci/delete-cloudflare-single.sh "$repo" "Int Test" "Report"
./scripts/ci/delete-cloudflare-single.sh "$repo" "Int Test" "Coverage"
