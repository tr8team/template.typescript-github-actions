#!/usr/bin/env bash

set -eou pipefail

PATH="$(pwd)/node_modules/.bin:$PATH"
pnpm install
vitest run --config ./config/vitest.unit.report.config.ts --coverage || true
find test-results/unit/html \( ! -regex '.*/\..*' \) -type f -exec sed -i 's/__vitest__\///g' {} +
