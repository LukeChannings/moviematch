import { Config, Login } from "/types/moviematch.ts";
import { MovieMatchError } from "/internal/app/moviematch/util/assert.ts";
import { MovieMatchProvider } from "/internal/app/moviematch/providers/provider.ts";

export class AnonymousLoginNotAllowedError extends MovieMatchError {}

interface LoginRequest {
  login: Login;
  config: Config;
  providers: MovieMatchProvider[];
}

export const getUser = (loginRequest: LoginRequest) => {
  const loginType = "plexToken" in loginRequest.login ? "plex" : "anonymous";

  if (
    loginType === "anonymous" &&
    loginRequest.config.permittedAuthTypes?.anonymous?.length === 0
  ) {
    throw new AnonymousLoginNotAllowedError(`Anonymous logins are disabled.`);
  }

  // check if Plex login is in Plex Friends.
};
