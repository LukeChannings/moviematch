# Release Notes

## v2.0.0-alpha.1

### New features

- Provide standalone binaries for Linux, macOS, and Windows. (No need to install Docker or Deno)
- Support configuring MovieMatch in the application, providing a more user-friendly setup experience.
- Allow configuration via environment variables and a more structured (and safe) YAML format for more advanced use cases
- Implement a new User Interface
- Support sharing the room URL more easily (#7)
- Support for logging out or leaving a room by tapping on your user name
- Show media details in the card (#9)
- Allow users to sign on with Plex (#14)
- Add an option that restricts login only to users signed in with Plex
- Allow filtering when creating rooms (#21)

### Bug fixes

- The UI is now compiled with [`esbuild`](https://esbuild.github.io), which provides improved support for older browsers. (#28)
- Improved logging throughout
- The logger will automatically redact any Plex URL or Token, making it safer for sharing logs when reporting issues

### Known issues

- The UI for filtering is unstyled
- The UI for configuration is quite ugly
- Card details cannot be scrolled
- Card details does not include useful metadata like rating, genre, actors, etc.
- Swiping the card stack can sometimes be laggy or get stuck

## v1.10.0

- Update Deno to v1.7.5
- Don't crash if the `PLEX_URL` is passed with a trailing `/` (Fixes #52)

## v1.9.0

- Add French translations (Thanks @EVOTk)

## v1.8.0

- Add collection filter (Thanks @BobWithHair!)

## v1.7.0

- Update nl translations (Thanks @jasperstrijp)
- Publish ARM64 Docker image (#27)

## v1.6.0

- [Bugfix] Environment variables exported to deno were not trimmed of whitespace, whereas values specified in an `.env` file were. This release ensures environment variables passed using both methods are trimmed. (#36)

## v1.5.0

- Fix for #31
- Possible fix for #33
- Debugging for #26

## v1.4.0

- Fix for #29

## v1.3.0

- Add config to allow opening match links on plex.tv #23 (Thanks @vjFaLk)
- Improved German translations #25 (Thanks @therealshark)

## v1.2.0

- [Bugfix] Fix too eager checking of the PLEX_TOKEN validity
- [Bugfix] In some cases items were skipped because their poster metadata was irregular
- [Bugfix] Handle the eventuality of a user getting to the end of the card stack
- [Bugfix] Handle the case where the batch size is bigger than the library size (#3)
- [Bugfix] Support for setting a custom root path
- [Bugfix] Handle SIGINT correctly
- [Bugfix] Don't display the year for non-Movies
- [Feature] Show the version in the footer
- [Feature] Animate the Login screen
- [Feature] Support keyboard left and right arrows
- [Bugfix] Fix an issue where the match screen loads scrolled-down on iOS

## v1.1.0

- Added an example .env file
- Improved documentation for running with Deno
- [Bugfix] Card animation played from the beginning when the cursor was released outside of the viewport
- [Bugfix] The WebSocket URL is incorrect when MovieMatch is hosted under a sub-path
- [Bugfix] No warning is given when a malformed Plex Token is passed
- [Bugfix] Explicitly log when the Plex API request failed due to an authorisation error
- [Bugfix] Fetching random movies was unaware of previously fetched movies and would return the same random movie more than once
- Improves issue templates (Thanks @flying-sausages)

## v1.0.2

- Fix WebSocket URL when connecting from an HTTPS connection (Thanks @PTRFRLL)
- Rename `SECTION_TYPE_FILTER` to `DEFAULT_SECTION_TYPE_FILTER`
- Add a `LIBRARY_FILTER` variable to allow selection of libraries to be included

## v1.0.1

- Fix a crash when the director isn't available on movie metadata

## v1.0.0

Initial release
