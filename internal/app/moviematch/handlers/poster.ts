import { ServerRequest } from "http/server.ts";
import { readerFromStreamReader } from "io/streams.ts";
import * as log from "log/mod.ts";
import { urlFromReqUrl } from "/internal/app/moviematch/util/url.ts";
import { RouteContext, RouteHandler } from "/internal/app/moviematch/types.ts";

interface PosterParams {
  providerIndex: string;
  key: string;
}

export const handler: RouteHandler = async (
  req: ServerRequest,
  ctx: RouteContext,
) => {
  if (!ctx.params) {
    log.warning(`poster handler called without params`);
    return;
  }
  const { providerIndex, key } = ctx.params as unknown as PosterParams;
  const provider = ctx.providers[+providerIndex];

  if (!provider) {
    log.warning(`poster handler called with an invalid provider index`);
    return;
  }

  const search = urlFromReqUrl(req.url).searchParams;

  const [readableStream, headers] = await provider.getArtwork(
    key,
    search.get("width") ? Number(search.get("width")) : 600,
  );

  return {
    status: 200,
    headers,
    body: readerFromStreamReader(readableStream.getReader()),
  };
};
