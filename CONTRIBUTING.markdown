# Contributing

## Code

The entire codebase is written in TypeScript, and common types are defined in [types/moviematch.ts](types/moviematch.ts).

### Dependencies

To get started, you'll need to have these dependencies installed,

- [Deno](https://deno.land)
- [esbuild](https://esbuild.github.io)

### Structure

Deno is a JavaScript framework (like Node.js) heavily inspired by the simplicity and convenience of the [Go](http://golang.org) programming language and toolchain. I thought I'd embrace that in this project, and the folder structure follows the popular [project-layout](https://github.com/golang-standards/project-layout) conventions from Go.

### Front-end

The Front-end toolchain is deliberately as simple as possible, as I wanted to avoid `node_modules` and the NPM ecosystem entirely.