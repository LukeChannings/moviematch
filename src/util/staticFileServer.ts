import { ServerRequest } from 'https://deno.land/std@0.79.0/http/server.ts'
import {
  join,
  extname,
  normalize,
} from 'https://deno.land/std@0.79.0/path/posix.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'

function normalizeURL(url: string): string {
  let normalizedUrl = url
  try {
    normalizedUrl = decodeURI(normalizedUrl)
  } catch (e) {
    if (!(e instanceof URIError)) {
      throw e
    }
  }
  normalizedUrl = normalize(normalizedUrl)
  const startOfParams = normalizedUrl.indexOf('?')
  return startOfParams > -1
    ? normalizedUrl.slice(0, startOfParams)
    : normalizedUrl
}

export const serveFile = async (req: ServerRequest, basePath = '/public') => {
  const normalizedPath = join(
    Deno.cwd(),
    basePath,
    req.url === '/' ? '/index.html' : normalizeURL(req.url)
  )

  log.debug(`serveFile(${normalizedPath})`)

  try {
    const stat = await Deno.stat(normalizedPath)
    if (!stat.isFile) {
      throw new Error(`Only file serving is enabled.`)
    }

    const body = await Deno.readFile(normalizedPath)
    return req.respond({
      body,
      headers: new Headers({
        'content-type': getContentType(normalizedPath),
      }),
    })
  } catch (_) {
    return req.respond({ status: 404, body: 'Not Found' })
  }
}

const getContentType = (path: string): string => {
  const MIME_MAP: Record<string, string> = {
    '.html': 'text/html',
    '.json': 'application/json',
    '.css': 'text/css',
    '.svg': 'image/xml+svg',
    '.png': 'image/png',
    '.js': 'application/javascript',
  }

  return MIME_MAP[extname(path)] ?? 'text/plain'
}
