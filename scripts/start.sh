#!/usr/bin/env bash

set -eo pipefail

cd "$(pwd)"

env LOG_LEVEL=DEBUG deno run -A --unstable --import-map=./configs/import_map.json ./cmd/moviematch/main.ts --dev