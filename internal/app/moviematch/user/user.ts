import {
  AnonymousLogin,
  Config,
  Login,
  PlexLogin,
  User,
} from "/types/moviematch.ts";
import { MovieMatchError } from "/internal/app/moviematch/util/assert.ts";
import { MovieMatchProvider } from "/internal/app/moviematch/providers/provider.ts";
import { log } from "/deps.ts";
import * as plexTv from "/internal/app/plex/plex_tv.ts";

export interface UserState {
  user: User;
  connected?: boolean;
}

const userStates = new Map<string, UserState>();

export const getUser = async (loginRequest: LoginRequest): Promise<User> => {
  const loginType = "plexToken" in loginRequest.login ? "plex" : "anonymous";
  const { permittedAuthTypes = {} } = loginRequest.config;
  let plexUser: plexTv.PlexUser | undefined;

  if (loginType === "plex") {
    try {
      plexUser = await plexTv.getUser(loginRequest.login as PlexLogin);
    } catch {
      throw new PlexUserUnknownError("Could not validate user with plex.tv");
    }
  }

  const userId =
    `${loginType}-${(loginRequest.login as AnonymousLogin).userName ??
      plexUser?.uuid}`.toLocaleLowerCase();

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

  let user: User;

  switch (loginType) {
    case "anonymous": {
      if (permittedAuthTypes.anonymous?.length === 0) {
        throw new AnonymousLoginNotPermittedError(
          "There are no permitted auth types for anonymous logins",
        );
      }

      user = {
        id: userId,
        userName: (loginRequest.login as AnonymousLogin).userName,
        permissions: permittedAuthTypes.anonymous ?? [],
      };

      break;
    }
    case "plex": {
      if (!plexUser) {
        throw new PlexUserUnknownError();
      }

      let authProviders = loginRequest.providers.filter(
        (_) => _.options?.useForAuth,
      );
      if (authProviders.length === 0) {
        authProviders = [loginRequest.providers[0]];
      }

      const authTypes = await Promise.all(
        authProviders.map((provider) => provider.getUserAuthType(plexUser)),
      );

      const authTypesSort = {
        anonymous: 0,
        plex: 1,
        plexFriends: 2,
        plexOwner: 3,
      };

      // figure out the highest permission this user has
      const [authType] = authTypes.sort(
        (a, b) => authTypesSort[b] - authTypesSort[a],
      );

      const permissions = permittedAuthTypes[authType] ?? [];

      if (permissions.length === 0) {
        throw new PlexLoginNotPermittedError(
          `There are no permitted auth types for ${authType} logins`,
        );
      }

      user = {
        id: userId,
        userName: plexUser.username,
        permissions,
        avatarImage: plexUser.thumb,
      };
      break;
    }
  }

  userStates.set(userId, { user });

  return user;
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
class PlexUserUnknownError extends MovieMatchError {}
class PlexLoginNotPermittedError extends MovieMatchError {}
class AlreadyConnectedError extends MovieMatchError {}

interface LoginRequest {
  login: Login;
  config: Config;
  providers: MovieMatchProvider[];
}
