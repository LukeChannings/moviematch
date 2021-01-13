import type { ServerRequest } from "https://deno.land/std@0.83.0/http/server.ts";
import { getServerId } from "/internal/app/plex/api.ts";
import type { Config } from "/internal/app/moviematch/config.ts";

const MATCHER = /^\/movie\/(?<key>.+)$/;

const isUASupportedForAppLink = (ua: string) => /(iPhone|iPad)/.test(ua);

const handleMovieLink = async (req: ServerRequest, config: Config) => {
  const key = req.url.match(MATCHER)?.groups?.key;
  const serverId = await getServerId(config.plexUrl);

  if (!key) {
    return req.respond({ status: 404 });
  }

  const movieLinkType = config.movieLinkType === "plexApp" &&
      !isUASupportedForAppLink(req.headers.get("user-agent")!)
    ? "plexLocal"
    : config.movieLinkType;

  let location: string;

  if (movieLinkType === "plexApp") {
    location = `plex://preplay/?metadataKey=${
      encodeURIComponent(
        key,
      )
    }&metadataType=1&server=${serverId}`;
  } else if (movieLinkType == "plexTv") {
    location = `https://app.plex.tv/desktop#!/server/${serverId}/details?key=${
      encodeURIComponent(
        key,
      )
    }`;
  } else {
    location =
      `${config.plexUrl.origin}/web/index.html#!/server/${serverId}/details?key=${
        encodeURIComponent(
          key,
        )
      }`;
  }

  await req.respond({
    status: 302,
    headers: new Headers({
      Location: location,
    }),
  });
};

export const route = [MATCHER, handleMovieLink] as const;
