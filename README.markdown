# <img src="public/logo.svg" height="40px" />

## What is this?

Have you ever spent longer deciding on a movie than it'd take to just watch a random movie? This is an app that helps you and your friends pick a movie to watch from a [Plex](https://www.plex.tv) server.

## How it works

MovieMatch connects to your Plex server and gets a list of movies (from any libraries marked as a movie library).

As many people as you want connect to your MovieMatch server and get a list of shuffled movies. Swipe right to 👍, swipe left to 👎.

If two (or more) people swipe right on the same movie, it'll show up in everyone's matches. The movies that the most people swiped right on will show up first.

## Getting started

### With Docker

`docker run -it -e PLEX_URL=https://plex.example.com -e PLEX_TOKEN=<YOUR_TOKEN> -e TMDB_API_KEY=<YOUR_API_KEY> -p 8000:8000 lukechannings/moviematch`

### Running manually

- Install [Deno](https://deno.land)
- Set up a `.env` file (or set env vars directly by prefixing `env PLEX_URL=...` to the following command)
- Run `deno run --allow-net --allow-read --allow-env src/index.ts`
