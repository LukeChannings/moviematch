import { ServerRequest } from 'https://deno.land/std@0.79.0/http/server.ts'
import {
  join,
  extname,
  normalize,
} from 'https://deno.land/std@0.79.0/path/posix.ts'
import * as log from 'https://deno.land/std@0.79.0/log/mod.ts'
import { Accepts } from 'https://deno.land/x/accepts@2.1.0/mod.ts'
import { translateHTML } from '../i18n.ts'

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

    let body: Uint8Array | string = await Deno.readFile(normalizedPath)

    if (extname(normalizedPath) === '.html') {
      const accept = new Accepts(req.headers)
      const lang = accept.languages(['en', 'de'])
      body = await translateHTML(body, lang)
    }

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
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.js': 'application/javascript',
  }

  return MIME_MAP[extname(path)] ?? 'text/plain'
}
