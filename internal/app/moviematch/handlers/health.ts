import { RouteHandler } from "/internal/app/moviematch/types.ts";

export const handler: RouteHandler = () => {
  return {
    status: 200,
    body: "MovieMatch is a live",
  };
};
