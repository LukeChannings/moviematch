#!/usr/bin/env bash

set -eo pipefail

cd "$(pwd)"

deno run -A --unstable --import-map=./configs/import_map.json ./cmd/moviematch/main.ts --dev