import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { getRandomMovie } from '../api/plex.ts'
import { getPosterUrl } from '../api/tmdb.ts'
import { MOVIE_BATCH_SIZE } from '../config.ts'
import { WebSocket } from '../util/websocketServer.ts'

interface Response {
  guid: string
  wantsToWatch: boolean
}

interface User {
  name: string
  responses: Response[]
  // tracks the position the user is in the session's movie list
  movieIndex: number
}

interface Movie {
  guid: string
  title: string
  summary: string
  year: string
  art: string
  director: string
  rating: string
  key: string
}

interface WebSocketLoginMessage {
  type: 'login'
  payload: {
    name: string
  }
}

interface WebSocketResponseMessage {
  type: 'response'
  payload: Response
}

interface WebSocketNextBatchMessage {
  type: 'nextBatch'
}

type WebSocketMessage =
  | WebSocketLoginMessage
  | WebSocketResponseMessage
  | WebSocketNextBatchMessage

class Session {
  private users: Map<User, WebSocket | null> = new Map()
  private movieList: Movie[] = []
  private likedMovies: Map<Movie, User[]> = new Map()

  async add(ws: WebSocket) {
    const user: User = await this.handleLogin(ws)

    this.users.set(user, ws)

    ws.addListener('message', (msg: string) => this.handleMessage(user, msg))

    if (this.movieList.length === 0) {
      const batch = await this.fetchBatch()
      this.movieList.push(...batch)
    }

    const ratedGuids = user.responses.map(_ => _.guid)

    this.sendBatch({
      user,
      batch: this.movieList.filter(movie => !ratedGuids.includes(movie.guid)),
    })
  }

  remove(ws: WebSocket) {
    const [user] = [...this.users.entries()].find(([, _ws]) => ws === _ws) ?? []
    if (user) {
      log.debug(`User ${user?.name} was removed`)
      ws.removeAllListeners()
      this.users.set(user, null)
    } else {
      log.debug(`An unregistered user was disconnected`)
    }
  }

  async handleLogin(ws: WebSocket): Promise<User> {
    return new Promise(resolve => {
      const handler = (msg: string) => {
        const data: WebSocketMessage = JSON.parse(msg)

        if (data.type === 'login') {
          const existingUser = [...this.users.keys()].find(
            ({ name }) => name === data.payload.name
          )
          const user: User = existingUser ?? {
            name: data.payload.name,
            responses: [],
            movieIndex: 0,
          }
          log.debug(
            `${existingUser ? 'Existing user' : 'New user'} ${
              user.name
            } logged in`
          )
          ws.removeListener('message', handler)
          return resolve(user)
        }
      }
      ws.addListener('message', handler)
    })
  }

  async handleMessage(user: User, msg: string) {
    try {
      const decodedMessage: WebSocketMessage = JSON.parse(msg)
      switch (decodedMessage.type) {
        case 'nextBatch': {
          const batch = await this.fetchBatch()
          this.movieList.push(...batch)
          await this.sendBatch({ batch })
          break
        }
        case 'response': {
          const { guid, wantsToWatch } = decodedMessage.payload
          user.responses.push(decodedMessage.payload)
          if (wantsToWatch) {
            const movie = this.movieList.find(_ => _.guid === guid)
            if (!movie) {
              log.error(
                `${user.name} tried to rate a movie that doesn't exist: ${guid}`
              )
              break
            }
            if (this.likedMovies.has(movie)) {
              const users = this.likedMovies.get(movie)!
              this.likedMovies.set(movie, [...users, user])
              this.handleMatch(movie, [...users, user])
            } else {
              this.likedMovies.set(movie, [user])
            }
          }
          log.debug(
            `${user.name} rated ${JSON.stringify(decodedMessage.payload)}`
          )
          break
        }
      }
    } catch (err) {
      log.error(err, msg)
    }
  }

  async sendBatch({ user, batch }: { user?: User; batch?: Movie[] }) {
    // if user is omitted, broadcast the new batch to all users.
    const wss = !user ? this.users.values() : [this.users.get(user)]

    for (const ws of wss) {
      if (ws && !ws.isClosed) {
        ws.send(
          JSON.stringify({
            type: 'batch',
            payload: batch,
          })
        )
      }
    }
  }

  async fetchBatch() {
    return (
      await Promise.all(
        Array.from({ length: Number(MOVIE_BATCH_SIZE) }).map(async () => {
          try {
            const plexMovie = await getRandomMovie()
            const posterUrl = await getPosterUrl(plexMovie.guid)
            const movie: Movie = {
              title: plexMovie.title,
              art: posterUrl,
              guid: plexMovie.guid,
              key: plexMovie.key,
              summary: plexMovie.summary,
              year: plexMovie.year,
              director: plexMovie.Director[0].tag,
              rating: plexMovie.rating,
            }
            return movie
          } catch (err) {
            log.error(err)
            return []
          }
        })
      )
    ).flat()
  }

  async handleMatch(movie: Movie, users: User[]) {
    for (const ws of this.users.values()) {
      if (ws && !ws.isClosed) {
        ws.send(
          JSON.stringify({
            type: 'match',
            payload: { movie, users: users.map(_ => _.name) },
          })
        )
      }
    }
  }
}

export const defaultSession = new Session()
