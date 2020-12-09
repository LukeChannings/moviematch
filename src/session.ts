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
    roomCode: string
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
  users: Map<User, WebSocket | null> = new Map()
  roomCode: string
  movieList: Movie[] = []
  likedMovies: Map<Movie, User[]> = new Map()

  constructor(roomCode: string) {
    this.roomCode = roomCode
  }

  add = (user: User, ws: WebSocket) => {
    this.users.set(user, ws)

    ws.addListener('message', msg => this.handleMessage(user, msg))
    ws.addListener('close', () => this.remove(user, ws))
  }

  remove = (user: User, ws: WebSocket) => {
    log.debug(`User ${user?.name} was removed`)
    ws.removeAllListeners()
    this.users.delete(user)

    if (this.users.size === 0) {
      this.destroy()
    }
  }

  handleMessage = async (user: User, msg: string) => {
    try {
      const decodedMessage: WebSocketMessage = JSON.parse(msg)
      switch (decodedMessage.type) {
        case 'nextBatch': {
          log.debug(`${user.name} asked for the next batch of movies`)
          await this.sendNextBatch()
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
          } else {
            log.debug(
              `${user.name} ${
                wantsToWatch ? 'wants to watch' : 'does not want to watch'
              } ${decodedMessage.payload.guid}`
            )
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
      log.error(err, JSON.stringify(msg))
    }
  }

  async sendNextBatch() {
    const batch = (
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

    this.movieList.push(...batch)

    for (const [user, ws] of this.users.entries()) {
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

  destroy() {
    log.info(`Session ${this.roomCode} has no users and has been removed.`)
    activeSessions.delete(this.roomCode)
  }
}

let activeSessions: Map<string, Session> = new Map()

export const getSession = (roomCode: string, ws: WebSocket): Session => {
  if (activeSessions.has(roomCode)) {
    return activeSessions.get(roomCode)!
  }

  const session = new Session(roomCode)

  activeSessions.set(roomCode, session)

  log.debug(
    `New session created. Active session ids are: ${[
      ...activeSessions.keys(),
    ].join(', ')}`
  )

  return session
}

export const handleLogin = (ws: WebSocket): Promise<User> => {
  return new Promise(resolve => {
    const handler = (msg: string) => {
      const data: WebSocketMessage = JSON.parse(msg)

      if (data.type === 'login') {
        log.info(`Got a login: ${JSON.stringify(data.payload)}`)
        const session = getSession(data.payload.roomCode, ws)

        const existingUser = [...session.users.keys()].find(
          ({ name }) => name === data.payload.name
        )

        if (
          existingUser &&
          session.users.get(existingUser) &&
          !session.users.get(existingUser)?.isClosed
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
        }

        log.debug(
          `${existingUser ? 'Existing user' : 'New user'} ${
            user.name
          } logged in`
        )

        ws.removeListener('message', handler)
        session.add(user, ws)

        const response: WebSocketLoginResponseMessage = {
          type: 'loginResponse',
          payload: {
            success: true,
            matches: session.getExistingMatches(user),
            movies: session.movieList.filter(
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
