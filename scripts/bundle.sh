#!/usr/bin/env bash

set -eo pipefail

while getopts e option
do
case "${option}"
in
e) EXIT_EARLY=1;;
*) ;;
esac
done

rm -rf ./build ./web/app/{node_modules,dist,build}

export VERSION="$(cat VERSION)"

cd web/app
  npm install
  npm run build
cd -

deno run --unstable -A ./cmd/moviematch/pkger.ts web/app/build web/template/index.html configs/localization VERSION

rm -rf build
mkdir -p build

sed 's/pkger.ts/pkger_release.ts/' < configs/import_map.json > build/import_map.json

deno bundle --unstable --import-map=build/import_map.json ./cmd/moviematch/main.ts > build/moviematch.bundle.js

if [[ "$EXIT_EARLY" == "1" ]]; then
  exit 0
fi

TARGETS=("x86_64-unknown-linux-gnu" "x86_64-pc-windows-msvc" "x86_64-apple-darwin" "aarch64-apple-darwin")

pushd build

for TARGET in "${TARGETS[@]}"; do
  mkdir -p "$TARGET"
  pushd "$TARGET"
  deno compile --unstable --lite --allow-read --allow-write --allow-env --allow-net --target "$TARGET" --output ./moviematch ../moviematch.bundle.js
  zip -r -j "../$TARGET.zip" ./*
  popd
done

rm import_map.json

popd
