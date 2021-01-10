#!/usr/bin/env bash

set -eo pipefail

cd "$(pwd)"

deno run --allow-all --unstable --import-map=./configs/import-map.json ./cmd/moviematch/main.ts