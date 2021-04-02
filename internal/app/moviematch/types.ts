import { Response, ServerRequest } from "/deps.ts";
import { Config } from "/types/moviematch.ts";
import { MovieMatchProvider } from "/internal/app/moviematch/providers/types.ts";

export interface RouteContext {
  config: Config;
  providers: MovieMatchProvider[];

  path: string | RegExp;
  params?: Record<string, string>;
}

export type RouteHandler = (
  req: ServerRequest,
  ctx: RouteContext,
) => (Promise<Response | void> | Response | void);
