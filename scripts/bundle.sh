#!/usr/bin/env bash

set -eo pipefail

esbuild web/app/src/main.tsx --bundle --minify --outdir=web/app/dist --format=esm --sourcemap=external --target=es2019
deno run --unstable -A ./cmd/moviematch/pkger.ts web/static web/template web/app/dist configs/localization VERSION

rm -rf build
mkdir -p build

cat configs/import_map.json | sed 's/pkger.ts/pkger_release.ts/' > build/import_map.json

deno bundle --unstable --import-map=build/import_map.json ./cmd/moviematch/main.ts > build/moviematch.js

TARGETS=("x86_64-unknown-linux-gnu" "x86_64-pc-windows-msvc" "x86_64-apple-darwin" "aarch64-apple-darwin")

pushd build

for TARGET in "${TARGETS[@]}"; do
  mkdir -p "$TARGET"
  pushd "$TARGET"
  deno compile --unstable --lite --allow-read --allow-write --allow-env --allow-net --target "$TARGET" ../moviematch.js
  if [ "$TARGET" == "x86_64-pc-windows-msvc" ]; then
    mv ./moviematch ./moviematch.exe
  fi
  popd
done

rm moviematch.js import_map.json

popd
