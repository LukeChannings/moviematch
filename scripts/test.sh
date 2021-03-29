#!/usr/bin/env bash

set -eo pipefail

deno fmt --check --ignore=build,web/app/node_modules,web/app/dist,web/app/build
deno lint --unstable --ignore=web,build

# https://github.com/denoland/deno/issues/9284
deno test -A --unstable --import-map=./configs/import_map.json internal