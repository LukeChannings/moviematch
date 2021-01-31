#!/usr/bin/env bash

set -eo pipefail

deno fmt --check
deno lint --unstable internal cmd

# https://github.com/denoland/deno/issues/9284
# deno test -A --unstable --import-map=./configs/import_map.json