/**
 * plex.tv Authentication
 * See - https://forums.plex.tv/t/authenticating-with-plex/609370
 */
import { Login } from "../../../../types/moviematch.ts";

const APP_NAME = "MovieMatch";
const CLIENT_ID = localStorage.getItem("plexClientId") ?? generateClientId();

export interface PlexPIN {
  id: string;
  code: string;
  authToken: string | null;
  expiresAt: string;
}

function generateClientId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const clientId = Array.from({ length: 30 })
    .map((_) => characters[Math.floor(Math.random() * characters.length)])
    .join("");
  localStorage.setItem("plexClientId", clientId);
  return clientId;
}

export const signIn = async () => {
  const pinReq = await fetch(`https://plex.tv/api/v2/pins`, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    body: new URLSearchParams({
      strong: "true",
      "X-Plex-Product": APP_NAME,
      "X-Plex-Client-Identifier": CLIENT_ID,
    }),
  });

  if (pinReq.ok) {
    const pin: PlexPIN = await pinReq.json();

    localStorage.setItem("plexTvPin", JSON.stringify(pin));

    const search = new URLSearchParams({
      clientID: CLIENT_ID,
      code: pin.code,
      "context[device][product]": APP_NAME,
      forwardUrl: location.href,
    });

    location.href = `https://app.plex.tv/auth#?${String(search)}`;
  }
};

export class PlexPINExpiredError extends Error {}

export const checkPin = async (pin: PlexPIN) => {
  if (Number(new Date(pin.expiresAt)) > Date.now() && !pin.authToken) {
    const search = new URLSearchParams({
      strong: "true",
      "X-Plex-Client-Identifier": CLIENT_ID,
      code: pin.code,
    });

    const req = await fetch(
      `https://plex.tv/api/v2/pins/${pin.id}?${String(search)}`,
      {
        headers: {
          accept: "application/json",
        },
      },
    );

    if (!req.ok) {
      throw new Error(`${req.status}: ${await req.text()}`);
    }

    const data: PlexPIN = await req.json();

    if (!data.authToken) {
      throw new Error("Login failed...");
    } else {
      localStorage.removeItem("plexTvPin");
      localStorage.setItem("plexToken", data.authToken);
    }

    return {
      clientId: CLIENT_ID,
      plexToken: data.authToken,
    };
  } else {
    throw new PlexPINExpiredError();
  }
};

export const getPlexCredentials = async (): Promise<Login["plexAuth"]> => {
  const plexTvPin = localStorage.getItem("plexTvPin");

  const pin: PlexPIN = JSON.parse(plexTvPin ?? "null");

  if (!pin || Number(new Date(pin.expiresAt)) < Date.now()) {
    await signIn();
    return;
  }

  return await checkPin(pin);
};
