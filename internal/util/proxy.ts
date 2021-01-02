import { ServerRequest } from "https://deno.land/std@0.83.0/http/server.ts";
import { getLogger } from "https://deno.land/std@0.79.0/log/mod.ts";
import { updatePath, updateSearch } from "/internal/util/url.ts";

class AuthenticationError extends Error {}

export const proxy = async (
  req: ServerRequest,
  from: string,
  to: URL,
  params: Record<string, string> = {}
) => {
  const url = updateSearch(updatePath(to, from), params);
  getLogger().debug(`Proxying ${from} to ${url}`);
  try {
    const proxyReq = await fetch(url);

    if (!proxyReq.ok) {
      if (proxyReq.status === 401) {
        throw new AuthenticationError(`Authentication error: ${req.url}`);
      } else {
        throw new Error(
          `${proxyReq.url} returned ${
            proxyReq.status
          }: ${await proxyReq.text()}`
        );
      }
    }

    req.respond({
      status: 200,
      body: new Uint8Array(await proxyReq.arrayBuffer()),
      headers: new Headers({ "content-type": "image/jpeg" }),
    });
  } catch (err) {
    getLogger().error(`Failed to load ${url}. ${err}`);
  }
};
