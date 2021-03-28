#!/usr/bin/env bash

set -eo pipefail

cd "$(pwd)"

deno run -A --unstable --import-map=./configs/import_map.json ./cmd/moviematch/main.ts --dev &
DENO_PID="$!"

cd web/app
  npm start &
  NPM_PID="$!"
cd -

function cleanup()
{
  kill $DENO_PID $NPM_PID
  echo "Exited!"
}

trap cleanup EXIT
while true; do
  sleep 60
done