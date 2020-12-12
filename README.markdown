# <img src="public/assets/logo.svg" height="40px" alt="MovieMatch" />

<div>
  <a href="screenshots/join.png"><img src="screenshots/join.png" alt="Join a room" width="25%" /></a>
  <a href="screenshots/rate.png"><img src="screenshots/rate.png" alt="Swipe on the movie" width="25%" /></a>
  <a href="screenshots/match.png"><img src="screenshots/match.png" alt="Look at what you agree on" width="25%" /></a>
</div>

## What is this?

Have you ever spent longer deciding on a movie than it'd take to just watch a random movie? This is an app that helps you and your friends pick a movie to watch from a [Plex](https://www.plex.tv) server.

## How it works

MovieMatch connects to your Plex server and gets a list of movies (from any libraries marked as a movie library).

As many people as you want connect to your MovieMatch server and get a list of shuffled movies. Swipe right to 👍, swipe left to 👎.

If two (or more) people swipe right on the same movie, it'll show up in everyone's matches. The movies that the most people swiped right on will show up first.

## Getting started

### With Docker

`docker run -it -e PLEX_URL=<Plex URL> -e PLEX_TOKEN=<Your Token> -p 8000:8000 lukechannings/moviematch`

### With Deno

- Install [Deno](https://deno.land/manual/getting_started/installation)
- Create a `.env` file (see [.env-template](./.env-template) for an example)
- Run `deno run --allow-net --allow-read --allow-env --unstable https://raw.githubusercontent.com/lukechannings/moviematch/main/src/index.ts` in your favourite terminal

Open [localhost:8000](http://localhost:8000)

## Configuration

The following variables are supported via a `.env` file or environment variables.

| Name                        | Description                                                                                                                                                           | Required | Default                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| PLEX_URL                    | A URL for the Plex server, e.g. `https://plex.example.com:32400`                                                                                                      | Yes      | null                                                                               |
| PLEX_TOKEN                  | An authorization token for access to the Plex API. [How to find yours](https://support.plex.tv/articles/204059436-finding-an-authentication-token-x-plex-token/)      | Yes      | null                                                                               |
| PORT                        | The port the server will run on                                                                                                                                       | No       | 8000                                                                               |
| ROOT_PATH                   | The root path to use when loading resources. For example, if MovieMatch is on a sub-path, the `ROOT_PATH` should be set to that sub-path (_without a trailing slash_) | No       | ''                                                                                 |
| LIBRARY_FILTER              | A list of libraries to be included in the cards, comma delimited. e.g. `Films`, or `Films,Television`, or `Films,Workout Videos`                                      | No       | The first library that has the type of `DEFAULT_SECTION_TYPE_FILTER`               |
| DEFAULT_SECTION_TYPE_FILTER | The first library with this type will be chosen as a default library                                                                                                  | No       | `movie`, (can be `movie`, `artist`, `photo`, or `show`)                            |
| LINK_TYPE                   | The method to use for opening match links                                                                                                                             | No       | `app` (`app` or `http`)                                                            |
| LOG_LEVEL                   | How much the server should log                                                                                                                                        | No       | `INFO` (supported options are `DEBUG`, `INFO`, `WARNING`, `ERROR`, and `CRITICAL`) |
| MOVIE_BATCH_SIZE            | How many movies to get from the server initially. Unless you're running out of cards really quickly you should leave this alone.                                      | No       | 25                                                                                 |

## FAQ

### Can a user get my Plex Token?

No. The client never talks directly to the Plex server and any requests that need the token (e.g. querying movies, getting poster art) are made by the server.

Furthermore, only a subset of the Plex response is given to the client to minimise the chance of sensitive information leaking out.

### Can it do TV shows too?

Yes, you can include a TV library in your `LIBRARY_FILTER` list.

### Do you gather any data?

No. The server is entirely local to you and will work offline.

### Do you support languages other than English?

Yes. The server will use your browser's preferred language by default if it's supported. Otherwise it'll fall back to English.

The translations can be found [in the i18n folder](./i18n).

The file names follow [BCP47](https://tools.ietf.org/html/bcp47) naming. Feel free to submit a Pull Request if you'd like your language to be supported.

### Can I run MovieMatch behind a reverse proxy?

Yes, you can read some documentation [here](./docs/reverse-proxy.markdown)
