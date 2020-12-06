export class MovieMatchAPI extends EventTarget {
  constructor(user) {
    super()
    this.user = user
    this.socket = new WebSocket(`ws://${location.host}/ws`)
    this.socket.addEventListener('open', () => this.handleOpen())
    this.socket.addEventListener('message', e => this.handleMessage(e))

    this._movieList = []

    window.addEventListener('beforeunload', () => {
      this.socket.close()
    })
  }

  handleOpen() {
    this.socket.send(
      JSON.stringify({
        type: 'login',
        payload: {
          name: this.user,
        },
      })
    )
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
    }
  }

  respond(movie, wantsToWatch) {
    this.socket.send(
      JSON.stringify({
        type: 'response',
        payload: {
          guid: movie.guid,
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
            if (
              api._movieList.length === 0 ||
              api._movieList.length < this.i + 1
            ) {
              await api.requestNextBatch()
            }

            const movie = api._movieList.slice(this.i, this.i + 2)
            this.i += 1
            return {
              value: movie,
              done: false,
            }
          },
        }
      },
    }
  }
}
