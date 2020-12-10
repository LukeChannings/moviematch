import { serve } from 'https://deno.land/std@0.79.0/http/server.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { getServerId, proxyPoster } from './api/plex.ts'
import { PLEX_URL, PORT } from './config.ts'
import { getLinkTypeForRequest } from './i18n.ts'
import { handleLogin } from './session.ts'
import { serveFile } from './util/staticFileServer.ts'
import { WebSocketServer } from './util/websocketServer.ts'

const server = serve({ port: Number(PORT) })

const wss = new WebSocketServer({
  onConnection: handleLogin,
  onError: err => log.error(err),
})

Deno.signal(Deno.Signal.SIGINT).then(() => {
  log.info('Shutting down')
  server.close()
  Deno.exit(0)
})

log.info(`Listening on port ${PORT}`)

for await (const req of server) {
  if (req.url === '/ws') {
    wss.connect(req)
  } else if (req.url.startsWith('/movie/')) {
    const serverId = await getServerId()
    const key = req.url.replace('/movie', '')

    let location: string

    if (getLinkTypeForRequest(req.headers) === 'app') {
      location = `plex://preplay/?metadataKey=${encodeURIComponent(
        key
      )}&metadataType=1&server=${serverId}`
    } else {
      location = `${PLEX_URL}/web/index.html#!/server/${serverId}/details?key=${encodeURIComponent(
        key
      )}`
    }

    req.respond({
      status: 302,
      headers: new Headers({
        Location: location,
      }),
    })
  } else if (req.url.startsWith('/poster/')) {
    const [, key] =
      req.url.match(/\/poster\/([0-9]+\/(art|thumb)\/[0-9]+)/) ?? []

    if (!key) {
      req.respond({ status: 404 })
    } else {
      await proxyPoster(req, key)
    }
  } else {
    serveFile(req, '/public')
  }
}
