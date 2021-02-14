import { ServerRequest } from "http/server.ts";

export const handler = (req: ServerRequest) => {
  return {
    status: 200,
    body: "MovieMatch is a live",
  };
};
