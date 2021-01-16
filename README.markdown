# <img src="web/static/icons/icon-192.png" alt="MovieMatch" style="border-radius: 5px; height: 20px" /> MovieMatch

![Tests](https://github.com/LukeChannings/moviematch/workflows/Tests/badge.svg?branch=dev)

Have you ever spent longer deciding on a movie than it'd take to just watch a random movie? This is an app that helps you and your friends pick a movie to watch from a [Plex](https://www.plex.tv) server.

## How it works

MovieMatch connects to your Plex server and gets a list of movies (from any libraries marked as a movie library).

As many people as you want connect to your MovieMatch server and get a list of shuffled movies. Swipe right to 👍, swipe left to 👎.

If two (or more) people swipe right on the same movie, it'll show up in everyone's matches. The movies that the most people swiped right on will show up first.

## Getting started

`docker run -it -e PLEX_URL=<Plex URL> -e PLEX_TOKEN=<Your Token> -p 8000:8000 lukechannings/moviematch`

**Note**: There is also documentation for **docker-compose** over [here](./docs/docker-compose.markdown) 👈

## Configuration

The following variables are supported via a `.env` file or environment variables.

| Name                 | Description                                                                                                                                                           | Required | Default                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| HOST                 | The host interface the server will listen on                                                                                                                          | No       | 127.0.0.1                                                                                                            |
| PORT                 | The port the server will run on                                                                                                                                       | No       | 8000                                                                                                                 |
| PLEX_URL             | A URL for the Plex server, e.g. `https://plex.example.com:32400`                                                                                                      | Yes      | null                                                                                                                 |
| PLEX_TOKEN           | An authorization token for access to the Plex API. [How to find yours](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)      | Yes      | null                                                                                                                 |
| AUTH_USER            | Basic Authentication User Name                                                                                                                                        | No       | null                                                                                                                 |
| AUTH_PASS            | Basic Authentication Password                                                                                                                                         | No       | null                                                                                                                 |
| REQUIRE_PLEX_LOGIN   | Require that all users log in with Plex as opposed to the anonymous login                                                                                             | No       | Both Plex and Anonymous logins are permitted                                                                         |
| ROOT_PATH            | The root path to use when loading resources. For example, if MovieMatch is on a sub-path, the `ROOT_PATH` should be set to that sub-path (_without a trailing slash_) | No       | ''                                                                                                                   |
| LIBRARY_TITLE_FILTER | A list of libraries to be included in the cards, comma-separated. e.g. `Films`, or `Films,Television`, or `Films,Workout Videos`                                      | No       | null                                                                                                                 |
| LIBRARY_TYPE_FILTER  | Only libraries of these types will be used                                                                                                                            | No       | `movie`, (can be `movie`, `artist`, `photo`, or `show`). Multiple options must be comma-separated, e.g. `movie,show` |
| LINK_TYPE            | The method to use for opening match links                                                                                                                             | No       | `app` (`app` or `http`)                                                                                              |
| LOG_LEVEL            | How much the server should log                                                                                                                                        | No       | `INFO` (supported options are `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `CRITICAL`)                                   |

## FAQ

### Can a user get my Plex Token?

No. The client never talks directly to the Plex server and any requests that need the token (e.g. querying movies, getting poster art) are made by the server.

Only a subset of the Plex response is given to the client to minimise the chance of sensitive information leaking out.
All server logs have both `PLEX_URL` and `PLEX_TOKEN` replaced with `****` to prevent accidental disclosure.

### Can it do TV shows too?

Yes, you can include a TV library in your `LIBRARY_TITLE_FILTER` list.

### Do you gather any data?

No. The server is entirely local to you and will work offline.

### Do you support languages other than English?

Yes. The server will use your browser's preferred language by default if it's supported. Otherwise it'll fall back to English.

The translations can be found in [configs/localization](./configs/localization).

The file names follow [BCP47](https://tools.ietf.org/html/bcp47) naming. Feel free to submit a Pull Request if you'd like your language to be supported.

### Can I run MovieMatch behind a reverse proxy?

Yes, you can read some documentation [here](./docs/reverse-proxy.markdown)
