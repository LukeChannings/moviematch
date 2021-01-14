import type { ServerRequest } from "https://deno.land/std@0.83.0/http/server.ts";
import type { Config } from "/internal/app/moviematch/config.ts";
import { proxy } from "/internal/util/proxy.ts";
import { urlFromReqUrl } from "/internal/util/url.ts";

export const MATCH = /^\/api\/poster$/;

export const handler = async (req: ServerRequest, config: Config) => {
  const { searchParams } = urlFromReqUrl(req.url);
  const key = searchParams.get("key");
  const width = searchParams.has("w") ? searchParams.get("w")! : "500";
  if (!key) {
    req.respond({ status: 404 });
  } else {
    const height = String(Number(width) * 1.5);

    await proxy(req, "/photo/:/transcode", config.plexUrl, {
      width,
      height,
      minSize: "1",
      upscale: "1",
      url: key,
    });
  }
};

export const route = [MATCH, handler] as const;
