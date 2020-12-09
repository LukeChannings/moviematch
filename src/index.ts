import { serve } from 'https://deno.land/std@0.79.0/http/server.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { getServerId, proxyPoster } from './api/plex.ts'
import { PLEX_URL, PORT } from './config.ts'
import { getLinkTypeForRequest } from './i18n.ts'
import { defaultSession } from './session.ts'
import { serveFile } from './util/staticFileServer.ts'
import { WebSocketServer, WebSocket } from './util/websocketServer.ts'

const server = serve({ port: Number(PORT) })

const wss = new WebSocketServer({
  onConnection: (ws: WebSocket) => {
    defaultSession.add(ws)

    ws.addListener('close', () => {
      defaultSession.remove(ws)
    })
  },
  onError: err => log.error(err),
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
    const [, , sectionId, artId] = req.url.split('/')

    if (/^[0-9]$/.test(sectionId + artId)) {
      req.respond({ status: 404 })
    } else {
      await proxyPoster(req, sectionId, artId)
    }
  } else {
    serveFile(req, '/public')
  }
}
