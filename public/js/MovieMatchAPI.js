// deno-lint-ignore-file

export class MovieMatchAPI extends EventTarget {
  constructor() {
    super()
    const basePath = location.pathname.replace(/\/(index\.html)?$/, '')

    this.socket = new WebSocket(
      `${location.protocol === 'https:' ? 'wss' : 'ws'}://${
        location.host
      }${basePath}/ws`
    )

    this.socket.addEventListener('message', e => this.handleMessage(e))

    this._movieList = []

    window.addEventListener('beforeunload', () => {
      this.socket.close()
    })
  }

  async login(user, roomCode) {
    this.socket.send(
      JSON.stringify({
        type: 'login',
        payload: {
          name: user,
          roomCode,
        },
      })
    )

    return new Promise((resolve, reject) => {
      this.addEventListener(
        'loginResponse',
        e => {
          if (e.data.success) {
            resolve(e.data)
          } else {
            reject(new Error(`${user} is already logged in.`))
          }
        },
        { once: true }
      )
    })
  }

  handleMessage(e) {
    const data = JSON.parse(e.data)

    switch (data.type) {
      case 'batch': {
        this.dispatchEvent(new MessageEvent('batch', { data: data.payload }))
        this._movieList.push(...data.payload)
        break
      }
      case 'match': {
        return this.dispatchEvent(
          new MessageEvent('match', { data: data.payload })
        )
      }
      case 'loginResponse': {
        this._movieList = data.payload.movies ?? []
        this.dispatchEvent(
          new MessageEvent('loginResponse', { data: data.payload })
        )
      }
    }
  }

  respond({ guid, wantsToWatch }) {
    this.socket.send(
      JSON.stringify({
        type: 'response',
        payload: {
          guid,
          wantsToWatch,
        },
      })
    )
  }

  async requestNextBatch() {
    if (this.socket.readyState !== WebSocket.OPEN) {
      await new Promise(resolve =>
        this.socket.addEventListener('open', resolve, { once: true })
      )
    }

    this.socket.send(
      JSON.stringify({
        type: 'nextBatch',
      })
    )
    return new Promise(resolve =>
      this.addEventListener('batch', e => resolve(e.data), { once: true })
    )
  }

  getMovie(guid) {
    return this._movieList.find(_ => _.guid === guid)
  }

  [Symbol.asyncIterator]() {
    this.movieListIndex = 0
    return {
      next: async () => {
        if (!this._movieList[this.movieListIndex]) {
          const batch = await this.requestNextBatch()
          if (batch.length === 0) {
            return { done: true }
          }
        }

        const value = [
          this._movieList[this.movieListIndex],
          this.movieListIndex,
        ]
        this.movieListIndex += 1
        return {
          value,
          done: false,
        }
      },
    }
  }
}
