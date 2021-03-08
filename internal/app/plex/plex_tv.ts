/**
 * plex.tv Authentication
 * See - https://forums.plex.tv/t/authenticating-with-plex/609370
 */

import { requestNet } from "/internal/app/moviematch/util/permission.ts";

const APP_NAME = "MovieMatch";

export interface PlexUser {
  id: string;
  uuid: string;
  username: string;
  title: string;
  email: string;
  thumb: string;
  authToken: string;
  guest: boolean;
  restricted: boolean;
  subscriptionDescription: string;
  anonymous: null;
  home: boolean;
  homeSize: number;
  homeAdmin: boolean;
  maxHomeSize: number;
  certificateVersion: number;
  rememberExpiresAt: number;
}

export const getUser = async ({
  clientId,
  plexToken,
}: {
  clientId: string;
  plexToken: string;
}): Promise<PlexUser> => {
  const search = new URLSearchParams({
    "X-Plex-Product": APP_NAME,
    "X-Plex-Client-Identifier": clientId,
    "X-Plex-Token": plexToken,
  });

  if (!await requestNet('plex.tv')) {
    throw new Error(`Net access was denied for plex.tv`);
  }

  const req = await fetch(`https://plex.tv/api/v2/user?${String(search)}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!req.ok) {
    throw new Error(`${req.status}: ${await req.text()}`);
  }

  const user = await req.json();

  return user;
};

export const getUsers = async ({
  clientId,
  plexToken,
}: {
  clientId: string;
  plexToken: string;
}) => {
  const search = new URLSearchParams({
    "X-Plex-Product": APP_NAME,
    "X-Plex-Client-Identifier": clientId,
    "X-Plex-Token": plexToken,
  });
  const req = await fetch(`https://plex.tv/api/users?${String(search)}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!req.ok) {
    throw new Error(`${req.status}: ${await req.text()}`);
  }

  const users = await req.json();

  return users;
};
