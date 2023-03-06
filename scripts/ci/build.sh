#!/usr/bin/env bash

set -eou pipefail

PATH="$(pwd)/node_modules/.bin:$PATH"
rm -rf ./dist
rm -rf ./lib
pnpm install
tsc
ncc build --source-map --license licenses.txt
