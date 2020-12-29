/**
 * plex.tv Authentication
 * See - https://forums.plex.tv/t/authenticating-with-plex/609370
 */

const APP_NAME = "MovieMatch";

export const getUser = async ({
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
