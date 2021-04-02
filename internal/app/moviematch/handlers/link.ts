import { ServerRequest } from "/deps.ts";
import { RouteContext, RouteHandler } from "/internal/app/moviematch/types.ts";

export const handler: RouteHandler = async (
  req: ServerRequest,
  ctx: RouteContext,
) => {
  const { providerIndex, key } = ctx.params ?? {};
  if (!key || !providerIndex) {
    return;
  }

  const provider = ctx.providers[+providerIndex];
  if (!providerIndex) {
    return;
  }

  const url = await provider.getCanonicalUrl(
    key,
    { userAgent: req.headers.get("user-agent") },
  );

  return {
    status: 302,
    headers: new Headers([["location", url]]),
    body: url,
  };
};
