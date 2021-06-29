/**
 * plex.tv Authentication
 * See - https://forums.plex.tv/t/authenticating-with-plex/609370
 */
const APP_NAME = "MovieMatch";
const CLIENT_ID = localStorage.getItem("clientId") ??
  (() => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const clientId = Array.from({ length: 30 })
      .map((_) => characters[Math.floor(Math.random() * characters.length)])
      .join("");
    localStorage.setItem("clientId", clientId);
    return clientId;
  })();

export class PlexPINExpiredError extends Error {}

export interface PlexPIN {
  id: string;
  code: string;
  authToken: string | null;
  expiresAt: string;
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

export const verifyPin = async (pin: PlexPIN) => {
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
      token: data.authToken,
    };
  } else {
    throw new PlexPINExpiredError();
  }
};

export const getLogin = ():
  | { pin: PlexPIN }
  | {
    token: string;
    clientId: string;
  }
  | null => {
  const token = localStorage.getItem("plexToken");
  const pin = JSON.parse(localStorage.getItem("plexTvPin")!);

  if (token) return { token, clientId: CLIENT_ID };
  if (pin) return { pin };
  return null;
};
