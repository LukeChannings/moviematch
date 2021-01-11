#!/usr/bin/env bash

esbuild web/app/src/main.tsx --bundle --minify --outdir=web/app/dist --format=esm --sourcemap=external --target=es2019
deno run --unstable --allow-all ./cmd/moviematch/pkger.ts web/static web/template web/app/dist configs/localization VERSION
deno bundle --unstable --lock-write --lock sum.lock --import-map=configs/import-map-release.json ./cmd/moviematch/main.ts > moviematch.js

# See https://github.com/denoland/deno/issues/9080
if ! grep __throws "$(deno info --json --unstable | jq -r .modulesCache)/https/deno.land/1577336274658427026b26929397ab8e473848bd13a884c4f0b67194a3326f36"; then
  sed -i.bak 's/throws/__throws/g' "$(deno info --json --unstable | jq -r .modulesCache)/https/deno.land/1577336274658427026b26929397ab8e473848bd13a884c4f0b67194a3326f36"
fi

rm -f moviematch.js.bak
deno compile --unstable --allow-read --allow-env --allow-net ./moviematch.js
rm moviematch.js