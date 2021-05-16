/**
 * plex.tv Authentication
 * See - https://forums.plex.tv/t/authenticating-with-plex/609370
 */

import { requestNet } from "/internal/app/moviematch/util/permission.ts";
import { parseXML } from "/internal/app/plex/util.ts";
import { HomeUsers, Users } from "/internal/app/plex/types/users.ts";
import { PlexMediaContainer } from "/internal/app/plex/types/common.ts";

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

  if (!await requestNet("plex.tv")) {
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

export const getPlexUsers = async ({
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
  const req = await fetch(`https://plex.tv/api/users?${String(search)}`);

  if (!req.ok) {
    throw new Error(`${req.status}: ${await req.text()}`);
  }

  const users = parseXML(await req.text(), (elementName, key, value) => {
    if (
      (elementName === "Server" &&
        ["id", "serverId", "numLibraries", "allLibraries"].includes(key)) ||
      (elementName === "User" && key === "id")
    ) {
      return Number(value);
    }
    if (
      (elementName === "Server" && ["owned", "pending"].includes(key)) ||
      (elementName === "User" && [
        "protected",
        "home",
        "allowTuners",
        "allowSync",
        "allowCameraUpload",
        "allowChannels",
        "allowSubtitleAdmin",
        "restricted",
      ].includes(key))
    ) {
      return value === "1";
    }
    return value;
  });

  return users as PlexMediaContainer<Users>;
};

export const getPlexHomeUsers = async ({
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

  const req = await fetch(`https://plex.tv/api/home/users?${String(search)}`);

  if (!req.ok) {
    throw new Error(`${req.status}: ${await req.text()}`);
  }

  const users = parseXML(await req.text(), (_elementName, key, value) => {
    if (key === "id") return Number(value);
    if (["admin", "guest", "restricted", "protected"].includes(key)) {
      return value === "1";
    }
    if (key === "hasPassword") return value === "true";
    return value;
  });

  return users as PlexMediaContainer<HomeUsers>;
};
