import { ServerRequest } from "http/server.ts";
import { RouteHandler } from "/internal/app/moviematch/types.ts";

export const handler: RouteHandler = (req: ServerRequest) => {
  return {
    status: 200,
    body: "MovieMatch is a live",
  };
};
