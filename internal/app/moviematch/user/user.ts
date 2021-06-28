import {
  AnonymousLogin,
  Config,
  Login,
  Permission,
  PlexLogin,
  User,
} from "/types/moviematch.ts";
import { MovieMatchError } from "/internal/app/moviematch/util/assert.ts";
import { MovieMatchProvider } from "/internal/app/moviematch/providers/provider.ts";
import { log } from "/deps.ts";

export interface UserState {
  user: User;
  connected?: boolean;
}

const userStates = new Map<string, UserState>();

export const getUser = (loginRequest: LoginRequest): User => {
  const loginType = "plexToken" in loginRequest.login ? "plex" : "anonymous";

  if (
    loginType === "anonymous" &&
    loginRequest.config.permittedAuthTypes?.anonymous?.length === 0
  ) {
    throw new AnonymousLoginNotPermittedError(
      `There are no permitted auth types for anonymous logins`,
    );
  }

  const userId =
    `${loginType}-${(loginRequest.login as AnonymousLogin).userName ??
      (loginRequest.login as PlexLogin).plexClientId}`.toLocaleLowerCase();

  const existingUserState = userStates.get(userId);

  if (existingUserState) {
    if (existingUserState.connected) {
      throw new AlreadyConnectedError(
        "This user is already connected. A user can only be connected on one device at a time.",
      );
    } else {
      return existingUserState.user;
    }
  }

  // check if Plex login is in Plex Friends.

  const userState = {
    user: {
      id: userId,
      userName: (loginRequest.login as AnonymousLogin).userName,
      permissions: (
        loginRequest.config.permittedAuthTypes as Record<string, Permission[]>
      )[loginType] ?? [],
    },
  };

  userStates.set(userId, userState);

  return userState.user;
};

export const setUserConnectedStatus = (userId: string, status: boolean) => {
  log.info(`User ${userId} was ${status ? `connected` : `disconnected`}`);
  const userState = userStates.get(userId);
  if (!userState) {
    throw new Error(`No user found with this id`);
  }

  userState.connected = status;

  return userState.connected;
};

class AnonymousLoginNotPermittedError extends MovieMatchError {}
// class PlexLoginNotPermittedError extends MovieMatchError {}
class AlreadyConnectedError extends MovieMatchError {}

interface LoginRequest {
  login: Login;
  config: Config;
  providers: MovieMatchProvider[];
}
