#!/usr/bin/env bash

set -eo pipefail

cd "$(pwd)"

env DEV_MODE=1 deno run -A --unstable --import-map=./configs/import_map.json ./cmd/moviematch/main.ts --dev