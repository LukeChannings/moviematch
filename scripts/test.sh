#!/usr/bin/env bash

set -eo pipefail

deno fmt --check --ignore=build,web/app/dist,internal/pkg.ts
deno lint --unstable --ignore=web

# https://github.com/denoland/deno/issues/9284
deno test -A --unstable --import-map=./configs/import_map.json