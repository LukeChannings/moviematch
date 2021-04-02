## MovieMatch project scripts

version := `cat VERSION`
build_dir := justfile_directory() + "/build"
ui_dir := justfile_directory() + "/web/app"
ui_build_dir := ui_dir + "/build"
deno_options := "-A --unstable --import-map=./configs/import_map.json"
deno_compile_options := "--allow-read --allow-write --allow-env --allow-net --lite --unstable"
deno_fmt_ignore := build_dir + "," + ui_dir + "/node_modules" + "," + ui_build_dir

default:
  @just --list

start: install
  #!/usr/bin/env bash
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
  denon run {{ deno_options }} ./cmd/moviematch/main.ts

start-ui:
  cd {{ui_dir}} && npx snowpack dev

build-ui: install-node-modules
  cd {{ui_dir}} && npx snowpack build

build: clean build-ui
  mkdir -p {{build_dir}}
  deno run {{ deno_options }} ./cmd/moviematch/pkger.ts {{ui_build_dir}}/dist/main.* {{ui_build_dir}}/icons {{ui_build_dir}}/manifest.webmanifest web/template/index.html configs/localization VERSION > {{build_dir}}/pkg.ts
  sed 's/pkger.ts/pkger_release.ts/' < configs/import_map.json > {{build_dir}}/import_map.json
  deno bundle --lock deps.lock --unstable --import-map=build/import_map.json ./cmd/moviematch/main.ts > {{build_dir}}/moviematch.js 

build-prod: build compile-all
  rm {{build_dir}}/pkg.ts {{build_dir}}/import_map.json

compile-all: (compile "x86_64-unknown-linux-gnu") (compile "x86_64-pc-windows-msvc") (compile "x86_64-apple-darwin") (compile "aarch64-apple-darwin")

compile target:
  mkdir -p {{build_dir}}/{{target}}
  deno compile {{deno_compile_options}} --target {{target}} --output {{build_dir}}/{{target}}/moviematch {{build_dir}}/moviematch.js
  cd {{build_dir}}/{{target}} && zip -r -j "../{{target}}.zip" ./*

test:
  # https://github.com/denoland/deno/issues/9284
  deno test {{ deno_options }} internal

lint:
  deno fmt --check --ignore={{deno_fmt_ignore}}
  deno lint --unstable --ignore={{build_dir}},{{ui_dir}}

install: install-node-modules install-deno-dependencies

install-node-modules:
  cd {{ui_dir}} && npm install

install-deno-dependencies:
  deno install -qAf --unstable https://deno.land/x/denon/denon.ts

clean: clean-ui clean-server

clean-ui:
  rm -rf {{ui_build_dir}} {{ui_dir}}/node_modules

clean-server:
  rm -rf $(deno info --json --unstable | jq -r .modulesCache)
  rm -rf {{build_dir}}

format:
  deno fmt --ignore={{deno_fmt_ignore}}