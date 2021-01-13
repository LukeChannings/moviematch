#!/usr/bin/env bash

set -eo pipefail

cd "$(pwd)"

deno run --allow-all --unstable --import-map=./configs/import_map.json ./cmd/moviematch/main.ts