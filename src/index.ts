import { serve } from 'https://deno.land/std@0.79.0/http/server.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { PORT } from './config.ts'
import { handler } from './moviematch/handler.ts'
import { serveFile } from './util/staticFileServer.ts'
import { WebSocketServer } from './util/websocketServer.ts'

const server = serve({ port: Number(PORT) })

const wss = new WebSocketServer({
  onConnection: handler,
  onError: err => log.error(err),
})

log.info(`Listening on port ${PORT}`)

for await (const req of server) {
  req.url === '/ws' ? wss.connect(req) : serveFile(req, '/public')
}
