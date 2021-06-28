## MovieMatch project scripts

version := `cat VERSION`
build_dir := justfile_directory() + "/build"
ui_dir := justfile_directory() + "/web/app"
ui_build_dir := ui_dir + "/build"
deno_options := "-A --unstable --import-map=./configs/import_map.json"
deno_compile_options := "--unstable --allow-read --allow-write --allow-env --allow-net"
deno_fmt_ignore := build_dir + "," + ui_dir + "/node_modules" + "," + ui_build_dir
default_target := os() + "-" + arch()

default:
  @just --list

start: install
  #!/bin/bash
  just start-server &
  DENO_PID="$!"
  just start-ui &
  NPM_PID="$!"

  function cleanup() {
    kill $DENO_PID $NPM_PID
    echo "Exited!"
  }

  trap cleanup EXIT
  while true; do sleep 60; done

start-server:
  denon -c configs/denon.config.json run --inspect {{ deno_options }} ./cmd/moviematch/main.ts

start-ui:
  rm -rf {{ui_build_dir}}
  cd {{ui_dir}} && npx snowpack dev

build-ui: install-node-modules
  cd {{ui_dir}} && VERSION={{version}} npx snowpack build

build-bundle: clean build-ui
  mkdir -p {{build_dir}}
  deno run {{ deno_options }} ./cmd/moviematch/pkger.ts {{ui_build_dir}} web/template/index.html configs/localization VERSION > {{build_dir}}/pkg.ts
  sed 's/pkger.ts/pkger_release.ts/' < configs/import_map.json > {{build_dir}}/import_map.json
  deno bundle --unstable --lock deps.lock --import-map=build/import_map.json ./cmd/moviematch/main.ts > {{build_dir}}/moviematch.js

build-binary target=default_target: build-bundle
  #!/usr/bin/env bash

  # Names are from https://github.com/BretFisher/multi-platform-docker-build#the-problem-with-downloading-binaries-in-dockerfiles
  case "{{target}}" in
    all | linux-amd64 | linux-x86_64)
      just compile x86_64-unknown-linux-gnu linux-amd64;;&
    all | linux-arm64 | linux-aarch64)
      just compile aarch64-unknown-linux-gnu linux-arm64;;&
    all | macos-amd64 | macos-x86_64)
      just compile x86_64-apple-darwin macos-amd64;;&
    all | macos-arm64 | macos-aarch64)
      just compile aarch64-apple-darwin macos-arm64;;&
    all | windows-amd64 | window-x86_64)
      just compile x86_64-pc-windows-msvc windows-amd64;;
  esac

  rm -f {{build_dir}}/pkg.ts
  rm -f {{build_dir}}/import_map.json

compile rust_target target:
  #!/usr/bin/env bash
  mkdir -p {{build_dir}}/{{target}}
  if [ "{{rust_target}}" == "aarch64-unknown-linux-gnu" ]; then
    docker run --rm --platform linux/arm64 -v {{build_dir}}:{{build_dir}} lukechannings/deno compile {{deno_compile_options}} --output {{build_dir}}/{{target}}/moviematch {{build_dir}}/moviematch.js
  else
    deno compile {{deno_compile_options}} --target {{rust_target}} --output {{build_dir}}/{{target}}/moviematch {{build_dir}}/moviematch.js
  fi

test:
  deno test {{ deno_options }} internal

test-e2e:
  #!/bin/bash
  rm -f screenshots/e2e_*
  deno test {{ deno_options }} tests/websocket

start-binary target:
  #!/bin/bash
  export PORT="${PORT:-8765}"
  export MOVIEMATCH_URL="http://localhost:$PORT"

  chmod +x ./build/{{target}}/moviematch*
  2>/dev/null 1>/dev/null ./build/{{target}}/moviematch* &
  MM_PID="$!"

  while true ; do
    curl -sfo /dev/null "${MOVIEMATCH_URL}/health" && break
    sleep 1
  done
  echo "$MM_PID"

lint:
  deno fmt --check --ignore={{deno_fmt_ignore}}
  deno lint --ignore={{build_dir}},{{ui_dir}}
  cd {{ui_dir}} && npx tsc

install: install-node-modules install-deno-dependencies

install-node-modules:
  cd {{ui_dir}} && npm install

install-deno-dependencies:
  deno install --unstable -qAf https://deno.land/x/denon@2.4.7/denon.ts
  PUPPETEER_PRODUCT=chrome deno run --unstable -A https://deno.land/x/puppeteer@9.0.0/install.ts

clean: clean-ui clean-server

clean-ui:
  rm -rf {{ui_build_dir}} {{ui_dir}}/node_modules

clean-server:
  rm -rf {{build_dir}}

clean-deno-cache:
  rm -rf $(deno info --json | jq .denoDir)

alias fmt := format

format:
  deno fmt --ignore={{deno_fmt_ignore}}

update-lockfile:
  deno cache --reload --unstable --lock deps.lock --lock-write --import-map=./configs/import_map.json ./cmd/moviematch/main.ts

install-githooks:
  #!/bin/bash
  echo -e "#!/bin/bash\njust lint" > .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo -e "#!/bin/bash\njust lint test test-e2e" > .git/hooks/pre-push
  chmod +x .git/hooks/pre-push
