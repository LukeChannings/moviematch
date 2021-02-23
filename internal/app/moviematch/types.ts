import { Response, ServerRequest } from "http/server.ts";
import { Config } from "/types/moviematch.ts";
import { MovieMatchProvider } from "/internal/app/moviematch/providers/types.ts";

export interface AppContext {
  config: Config;
  providers: MovieMatchProvider[];
}

export type RouteHandler = (
  req: ServerRequest,
  ctx: AppContext,
) => (Promise<Response | void> | Response | void);
