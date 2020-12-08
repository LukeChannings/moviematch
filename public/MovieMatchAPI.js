export class MovieMatchAPI extends EventTarget {
  constructor() {
    super()
    this.socket = new WebSocket(`ws://${location.host}/ws`)
    this.socket.addEventListener('message', e => this.handleMessage(e))

    this._movieList = []

    window.addEventListener('beforeunload', () => {
      this.socket.close()
    })
  }

  async login(user) {
    this.socket.send(
      JSON.stringify({
        type: 'login',
        payload: {
          name: user,
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
      this.addEventListener('batch', resolve, { once: true })
    )
  }

  getMovie(guid) {
    return this._movieList.find(_ => _.guid === guid)
  }

  getMovieListIterable = () => {
    const api = this
    return {
      [Symbol.asyncIterator]() {
        return {
          i: 0,
          async next() {
            if (!api._movieList[this.i]) {
              await api.requestNextBatch()
            }

            const value = [api._movieList[this.i], this.i]
            this.i += 1
            return {
              value,
              done: false,
            }
          },
        }
      },
    }
  }
}
