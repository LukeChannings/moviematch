# Contributing

## Code

The entire codebase is written in TypeScript, and common types are defined in [types/moviematch.ts](types/moviematch.ts).

### Dependencies

To get started, you'll need to have these dependencies installed,

- [Deno](https://deno.land)
- [Node.js + NPM](https://nodejs.org/en/)

### Project layout

MovieMatch tries to follow [Golang's unofficial project layout](https://github.com/golang-standards/project-layout).

```
.
├── .github
│   └── workflows # GitHub Actions config
├── cmd
│   └── moviematch # The entrypoint into the application
├── configs
│   └── localization
├── docs
├── internal
│   └── app # Back-end Deno code
│       ├── moviematch
│       └── plex
├── screenshots
├── scripts # Scripts for starting, bundling, and testing the entire codebase.
├── types # Shared application-level types
└── web # Front-end code
    ├── app
    │   ├── src
    │   ├── static
    │   └── types
    ├── design
    └── template
```

## CI

MovieMatch uses [GitHub Actions](https://github.com/features/actions).

There is a workflow that runs the test suite (`scripts/test.sh`) for every commit.

### Release process

1. Ensure that the `VERSION` file reflects the version that is to be released
2. Finalise the [`RELEASE_NOTES`](./RELEASE_NOTES.markdown) for the release
3. Trigger a new [release](https://github.com/LukeChannings/moviematch/actions/workflows/release.yaml) with **Run workflow**, entering the version to be released.

The workflow will automatically create a GitHub release and publish a Docker image.
