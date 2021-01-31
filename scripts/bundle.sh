#!/usr/bin/env bash

set -eo pipefail

esbuild web/app/src/main.tsx --bundle --minify --outdir=web/app/dist --format=esm --sourcemap=external --target=es2019
deno run --unstable --allow-all ./cmd/moviematch/pkger.ts web/static web/template web/app/dist configs/localization VERSION
deno bundle --unstable --lock-write --lock sum.lock --import-map=configs/import_map_release.json ./cmd/moviematch/main.ts > moviematch.js

deno compile --unstable --allow-read --allow-env --allow-net ./moviematch.js
rm moviematch.js