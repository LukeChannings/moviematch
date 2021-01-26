#!/usr/bin/env bash

deno fmt --check
deno lint --unstable internal cmd
deno test -A --unstable --import-map=./configs/import_map.json