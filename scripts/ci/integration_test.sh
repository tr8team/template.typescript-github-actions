#!/usr/bin/env bash

set -eou pipefail

PATH="$(pwd)/node_modules/.bin:$PATH"
gattai run out secrets_ci config/GattaiFile.yaml
pnpm install
vitest run --config ./config/vitest.int.report.config.ts --coverage || true
find test-results/int/html \( ! -regex '.*/\..*' \) -type f -exec sed -i 's/__vitest__\///g' {} +
