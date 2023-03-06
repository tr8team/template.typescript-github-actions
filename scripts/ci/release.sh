#!/bin/bash

set -eou pipefail

rm -rf node_modules
rm package.json
sg release
