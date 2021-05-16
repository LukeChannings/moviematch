import { assert, yup } from "/deps.ts";
import { getPlexHomeUsers, getPlexUsers } from "./plex_tv.ts";

const { array, boolean, number, object, string } = yup;

const TEST_PLEX_TOKEN = Deno.env.get("TEST_PLEX_TOKEN");
const clientId = "odFpLIdHbUMBOL4iwYRGsPc2mJkoOY";

try {
  assert(
    typeof TEST_PLEX_TOKEN !== "undefined",
    "TEST_PLEX_TOKEN is required for testing Plex TV API integration",
  );

  Deno.test("Plex TV -> getPlexUsers", async () => {
    const users = await getPlexUsers({
      clientId,
      plexToken: TEST_PLEX_TOKEN,
    });

    const usersSchema = object({
      friendlyName: string().required(),
      identifier: string().required(),
      machineIdentifier: string().required(),
      totalSize: string().required(),
      size: string().required(),
      User: array(object({
        id: number().required(),
        title: string().required(),
        username: string().required(),
        email: string().required(),
        recommendationsPlaylistId: string(),
        thumb: string().required(),
        protected: boolean().required(),
        home: boolean().required(),
        allowTuners: boolean().required(),
        allowSync: boolean().required(),
        allowCameraUpload: boolean().required(),
        allowChannels: boolean().required(),
        allowSubtitleAdmin: boolean().required(),
        filterAll: string(),
        filterMovies: string(),
        filterMusic: string(),
        filterPhotos: string(),
        filterTelevision: string(),
        restricted: boolean().required(),
        Server: array(object({
          id: number().required(),
          serverId: string().required(),
          machineIdentifier: string().required(),
          name: string().required(),
          lastSeenAt: string().required(),
          numLibraries: number().required(),
          allLibraries: number().required(),
          owned: boolean().required(),
          pending: boolean().required(),
        })).required(),
      })),
    });

    usersSchema.validate(users.MediaContainer);
  });

  Deno.test("Plex TV -> getPlexHomeUsers", async () => {
    const users = await getPlexHomeUsers({
      clientId,
      plexToken: TEST_PLEX_TOKEN,
    });

    const homeUsersSchema = object({
      friendlyName: string().required(),
      identifier: string().required(),
      machineIdentifier: string().required(),
      size: string().required(),
      User: array(object({
        id: number().required(),
        uuid: string().required(),
        admin: boolean().required(),
        guest: boolean().required(),
        restricted: boolean().required(),
        restrictionProfile: string(),
        hasPassword: boolean().required(),
        protected: boolean().required(),
        title: string().required(),
        username: string().required(),
        email: string().required(),
        thumb: string().required(),
      })),
    });

    homeUsersSchema.validate(users.MediaContainer);
  });
} catch (err) {
  console.log(err);
}
