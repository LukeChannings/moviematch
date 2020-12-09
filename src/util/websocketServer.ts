import { EventEmitter } from 'https://deno.land/std@0.79.0/node/events.ts'
import { ServerRequest } from 'https://deno.land/std@0.79.0/http/server.ts'
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
  isWebSocketPongEvent,
} from 'https://deno.land/std@0.79.0/ws/mod.ts'

import type { WebSocket as STDWebSocket } from 'https://deno.land/std@0.79.0/ws/mod.ts'

export class WebSocketError extends Error {}

export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

interface Options {
  onConnection: (ws: WebSocket) => void
  onError: (error: Error) => void
}

export class WebSocketServer {
  clients: Set<WebSocket> = new Set<WebSocket>()
  options: Options

  constructor(options: Options) {
    this.options = options
  }

  async connect(req: ServerRequest) {
    const { conn, r: bufReader, w: bufWriter, headers } = req

    try {
      const sock = await acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      })
      const ws: WebSocket = new WebSocket()
      ws.open(sock)
      this.clients.add(ws)
      this.options.onConnection(ws)
    } catch (err) {
      this.options.onError(err)
      await req.respond({ status: 400 })
    }
  }

  close() {
    this.clients.clear()
  }
}

export class WebSocket extends EventEmitter {
  webSocket?: STDWebSocket
  state: WebSocketState = WebSocketState.CONNECTING

  async open(sock: STDWebSocket) {
    this.webSocket = sock
    this.state = WebSocketState.OPEN
    this.emit('open')
    this.heartbeat()
    try {
      for await (const ev of sock) {
        if (typeof ev === 'string') {
          // text message
          this.emit('message', ev)
        } else if (ev instanceof Uint8Array) {
          // binary message
          this.emit('message', ev)
        } else if (isWebSocketPingEvent(ev)) {
          const [, body] = ev
          // ping
          this.emit('ping', body)
        } else if (isWebSocketPongEvent(ev)) {
          const [, body] = ev
          // pong
          this.emit('pong', body)
        } else if (isWebSocketCloseEvent(ev)) {
          // close
          const { code, reason } = ev
          this.state = WebSocketState.CLOSED
          this.emit('close', code)
        }
      }
    } catch (err) {
      this.emit('close', err)
      if (!sock.isClosed) {
        await sock.close(1000).catch(e => {
          throw new WebSocketError(e)
        })
      }
    }
  }

  async heartbeat() {
    while (this.state === WebSocketState.OPEN) {
      if (this.isClosed) {
        this.emit('close', 1001)
        break
      }

      await new Promise(resolve => setTimeout(() => resolve, 2_000))
    }
  }

  ping(message?: string | Uint8Array) {
    if (this.state === WebSocketState.CONNECTING) {
      throw new WebSocketError('WebSocket is not open: state 0 (CONNECTING)')
    }
    return this.webSocket!.ping(message)
  }

  send(message: string | Uint8Array) {
    if (this.state === WebSocketState.CONNECTING) {
      throw new WebSocketError('WebSocket is not open: state 0 (CONNECTING)')
    }
    return this.webSocket!.send(message)
  }

  close(code = 1000, reason?: string): Promise<void> {
    if (
      this.state === WebSocketState.CLOSING ||
      this.state === WebSocketState.CLOSED
    ) {
      return Promise.resolve()
    }

    this.state = WebSocketState.CLOSING
    return this.webSocket!.close(code, reason!)
  }

  closeForce() {
    if (
      this.state === WebSocketState.CLOSING ||
      this.state === WebSocketState.CLOSED
    ) {
      return
    }
    this.state = WebSocketState.CLOSING
    return this.webSocket!.closeForce()
  }

  get isClosed(): boolean | undefined {
    return this.webSocket!.isClosed
  }
}
