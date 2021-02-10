import { ServerRequest } from "http/server.ts";
import * as log from "log/mod.ts";
import { updatePath, updateSearch } from "/internal/app/moviematch/util/url.ts";

class AuthenticationError extends Error {}

export const proxy = async (
  req: ServerRequest,
  from: string,
  to: URL,
  params: Record<string, string> = {},
) => {
  const url = updateSearch(updatePath(to, from), params);
  log.debug(`Proxying ${from} to ${url}`);
  try {
    const proxyReq = await fetch(url);

    if (!proxyReq.ok) {
      if (proxyReq.status === 401) {
        throw new AuthenticationError(`Authentication error: ${req.url}`);
      } else {
        throw new Error(
          `${proxyReq.url} returned ${proxyReq.status}: ${await proxyReq
            .text()}`,
        );
      }
    }

    req.respond({
      status: 200,
      body: new Uint8Array(await proxyReq.arrayBuffer()),
      headers: proxyReq.headers,
    });
  } catch (err) {
    log.error(`Failed to load ${url}. ${err}`);
  }
};
