import { ServerRequest } from "http/server.ts";
import { BasicAuth } from "/internal/app/moviematch/config.ts";

export const isAuthorized = (
  basicAuth: BasicAuth,
  req: ServerRequest,
): boolean => {
  const auth = req.headers.get("Authorization");
  const { userName, password } = basicAuth;

  if (auth === `Basic ${btoa(`${userName}:${password}`)}`) {
    return true;
  }

  return false;
};

export const respondRequiringAuth = (req: ServerRequest) => {
  req.respond({
    headers: new Headers([
      ["WWW-Authenticate", 'Basic realm="MovieMatch", charset="UTF-8"'],
    ]),
    status: 401,
  });
};
