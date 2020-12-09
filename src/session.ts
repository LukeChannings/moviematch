import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { assert } from 'https://deno.land/std@0.79.0/_util/assert.ts'
import { getRandomMovie } from './api/plex.ts'
import { MOVIE_BATCH_SIZE } from './config.ts'
import { WebSocket } from './util/websocketServer.ts'

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

interface WebSocketMatchMessage {
  type: 'match'
  payload: {
    movie: Movie
    users: string[]
  }
}

interface WebSocketLoginResponseMessage {
  type: 'loginResponse'
  payload:
    | { success: false }
    | {
        success: true
        matches: Array<WebSocketMatchMessage['payload']>
        movies: Movie[]
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

  handleLogin(ws: WebSocket): Promise<User> {
    return new Promise(resolve => {
      const handler = (msg: string) => {
        const data: WebSocketMessage = JSON.parse(msg)

        if (data.type === 'login') {
          const existingUser = [...this.users.keys()].find(
            ({ name }) => name === data.payload.name
          )

          if (
            existingUser &&
            this.users.get(existingUser) &&
            !this.users.get(existingUser)?.isClosed
          ) {
            log.info(
              `${existingUser.name} is already logged in. Try another name!`
            )
            const response: WebSocketLoginResponseMessage = {
              type: 'loginResponse',
              payload: {
                success: false,
              },
            }
            ws.send(JSON.stringify(response))
            return
          }

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

          const response: WebSocketLoginResponseMessage = {
            type: 'loginResponse',
            payload: {
              success: true,
              matches: this.getExistingMatches(user),
              movies: this.movieList.filter(
                movie => !user.responses.map(_ => _.guid).includes(movie.guid)
              ),
            },
          }
          ws.send(JSON.stringify(response))

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
          assert(
            typeof guid === 'string' && typeof wantsToWatch === 'boolean',
            'Response message was empty'
          )
          const alreadyResponded = !!user.responses.find(
            _ => _.guid === decodedMessage.payload.guid
          )
          if (alreadyResponded) {
            log.warning(
              `User ${user.name} tried to respond to ${decodedMessage.payload.guid} twice!`
            )
            return
          }
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
          break
        }
      }
    } catch (err) {
      log.error(err, msg)
    }
  }

  sendBatch({ user, batch }: { user?: User; batch: Movie[] }) {
    // if user is omitted, broadcast the new batch to all users.
    const wss = !user
      ? this.users.entries()
      : [[user, this.users.get(user)] as const]

    for (const [user, ws] of wss) {
      if (ws && !ws.isClosed) {
        ws.send(
          JSON.stringify({
            type: 'batch',
            payload: batch.filter(
              movie => !user.responses.map(_ => _.guid).includes(movie.guid)
            ),
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
            const [, , , sectionId, , artId] = plexMovie.art.split('/')
            const movie: Movie = {
              title: plexMovie.title,
              art: `/poster/${sectionId}/${artId}`,
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

  handleMatch(movie: Movie, users: User[]) {
    for (const ws of this.users.values()) {
      const match: WebSocketMatchMessage = {
        type: 'match',
        payload: {
          movie,
          users: users.map(_ => _.name),
        },
      }

      if (ws && !ws.isClosed) {
        ws.send(JSON.stringify(match))
      }
    }
  }

  getExistingMatches(user: User) {
    return [...this.likedMovies.entries()]
      .filter(([, users]) => users.includes(user) && users.length > 1)
      .map(([movie, users]) => ({ movie, users: users.map(_ => _.name) }))
  }
}

export const defaultSession = new Session()
