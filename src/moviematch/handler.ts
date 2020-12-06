import { WebSocket } from '../util/websocketServer.ts'
import { defaultSession } from './session.ts'

export const handler = async (ws: WebSocket) => {
  defaultSession.add(ws)

  ws.addListener('close', () => {
    defaultSession.remove(ws)
  })
}
