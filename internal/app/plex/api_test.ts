import { assert, assertEquals, assertNotEquals, yup } from "/deps.ts";
import { PlexApi } from "/internal/app/plex/api.ts";

const { array, boolean, mixed, number, object, string } = yup;

const TEST_PLEX_URL = Deno.env.get("TEST_PLEX_URL");
const TEST_PLEX_TOKEN = Deno.env.get("TEST_PLEX_TOKEN");

try {
  assert(
    typeof TEST_PLEX_URL !== "undefined",
    "TEST_PLEX_URL is required for testing Plex API integration",
  );
  assert(
    typeof TEST_PLEX_TOKEN !== "undefined",
    "TEST_PLEX_TOKEN is required for testing Plex API integration",
  );

  const plexApi = new PlexApi(
    TEST_PLEX_URL,
    TEST_PLEX_TOKEN,
    {
      language: "en",
    },
  );

  Deno.test("plexApi -> isAvaliable", async () => {
    assertEquals(
      await plexApi.isAvaliable(),
      true,
      "The server should be available",
    );
  });

  Deno.test("plexApi -> getIdentity", async () => {
    const identitySchema = object().shape({
      size: number().required(),
      claimed: boolean().required(),
      machineIdentifier: string().required(),
      version: string().required(),
    });

    const identity = await plexApi.getIdentity();
    await identitySchema.validate(identity);
  });

  Deno.test("plexApi -> getCapabilities", async () => {
    const capabilities = await plexApi.getCapabilities();

    assertNotEquals(
      capabilities.size,
      0,
      "The server is expected to have capabilities.",
    );
  });

  Deno.test("plexApi -> getServerVersion", async () => {
    const serverVersionSchema = object().shape({
      fullVersion: string().required(),
      major: number().required(),
      minor: number().required(),
      patch: number().required(),
      build: number().required(),
      meta: string().required(),
      hash: string().required(),
    });

    const serverVersion = await plexApi.getServerVersion();
    await serverVersionSchema.validate(serverVersion);
  });

  Deno.test("plexApi -> getServerName", async () => {
    assertEquals(typeof await plexApi.getServerName(), "string");
  });

  Deno.test("plexApi -> getServerId", async () => {
    assertEquals(typeof await plexApi.getServerId(), "string");
  });

  Deno.test("plexApi -> getServerOwner", async () => {
    assertEquals(typeof await plexApi.getServerOwner(), "string");
  });

  Deno.test("plexApi -> getLibraries", async () => {
    const librarySchema = array(
      object().shape({
        allowSync: boolean().required(),
        art: string().required(),
        composite: string().required(),
        filters: boolean().required(),
        refreshing: boolean().required(),
        thumb: string().required(),
        key: string().required(),
        type: string().matches(/^(movie|show|artist|photo)$/).required(),
        title: string().required(),
        agent: string().required(),
        scanner: string().required(),
        language: string().required(),
        uuid: string().required(),
        updatedAt: number().required(),
        createdAt: number().required(),
        scannedAt: number().required(),
        content: boolean().required(),
        directory: boolean().required(),
        contentChangedAt: number().required(),
        hidden: number().required(),
        Location: array(
          object().shape({
            id: number().required(),
            path: string().required(),
          }).required(),
        ).required(),
      }),
    ).required().min(1);

    const libraries = await plexApi.getLibraries();

    await librarySchema.validate(libraries);
  });

  Deno.test("plexApi -> getLibraryItems", async () => {
    const tagSchema = array(object({ tag: string().required() }));

    const libraryItemSchema = object().shape({
      size: number().required(),
      allowSync: boolean().required(),
      art: string().required(),
      identifier: string().required(),
      librarySectionID: number().required(),
      librarySectionTitle: string().required(),
      librarySectionUUID: string().required(),
      mediaTagPrefix: string().required(),
      mediaTagVersion: number().required(),
      thumb: string().required(),
      title1: string().required(),
      title2: string().required(),
      viewGroup: string().oneOf(["movie", "show"]).required(),
      viewMode: number().required(),
      nocache: boolean(),
      Metadata: array(object({
        ratingKey: string().required(),
        key: string().required(),
        guid: string().required(),
        studio: string(),
        type: string(),
        title: string().required(),
        contentRating: string(),
        summary: string().required(),
        rating: number(),
        viewCount: number(),
        lastViewedAt: number(),
        year: number(),
        tagline: string(),
        thumb: string(),
        art: string(),
        duration: number(),
        originallyAvailableAt: string(),
        addedAt: number().required(),
        updatedAt: number(),
        chapterSource: string(),
        primaryExtraKey: string(),
        Genre: tagSchema,
        Director: tagSchema,
        Writer: tagSchema,
        Country: tagSchema,
        Role: tagSchema,
        titleSort: string(),
        Collection: tagSchema,
        originalTitle: string(),
        ratingImage: string(),
        audienceRating: number(),
        audienceRatingImage: string(),
        index: number(),
        banner: string(),
        theme: string(),
        leafCount: number(),
        viewedLeafCount: number(),
        childCount: number(),
        composite: string(),
        Media: array(object({
          id: number().required(),
          duration: number().required(),
          bitrate: number().required(),
          width: number().required(),
          height: number().required(),
          aspectRatio: number().required(),
          audioChannels: number().required(),
          audioCodec: string().required(),
          videoCodec: string().required(),
          videoResolution: string().required(),
          container: string().required(),
          videoFrameRate: string(),
          audioProfile: string(),
          videoProfile: string(),
          Part: array(object({
            id: number().required(),
            key: string().required(),
            duration: number().required(),
            file: string().required(),
            size: number().required(),
            audioProfile: string(),
            container: mixed().required(),
            indexes: string(),
            videoProfile: string(),
            has64bitOffsets: boolean(),
            optimizedForStreaming: boolean(),
            hasThumbnail: string(),
            packetLength: number(),
            timeStamp: boolean(),
            hasChapterVideoStream: boolean(),
          })).required(),
          optimizedForStreaming: number(),
          has64bitOffsets: boolean(),
        })),
      })),
    });
    const items = await plexApi.getLibraryItems("3");
    await libraryItemSchema.validate(items);
  });

  Deno.test("plexApi -> getAllFilters", async () => {
    const filters = await plexApi.getAllFilters();

    const filtersSchema = object().shape({
      Type: array(
        object().shape({
          key: string().required(),
          type: string().required(),
          title: string().required(),
          active: boolean().required(),
          Filter: array(
            object().shape({
              filter: string().required(),
              filterType: string().required(),
              key: string().required(),
              title: string().required(),
              type: string().required(),
            }).required(),
          ),
        }),
      ).min(1),
      FieldType: array(
        object().shape({
          type: string().required(),
          Operator: array(
            object().shape({
              key: string().required(),
              title: string().required(),
            }),
          ),
        }),
      ).min(1),
    });

    await filtersSchema.validate(filters);
  });

  Deno.test("plexApi -> getFilterValues", async () => {
    const filterValues = await plexApi.getFilterValues("3/collection");

    const filterValueSchema = object().shape({
      size: number().required(),
      allowSync: boolean().required(),
      art: string().required(),
      content: string().required(),
      identifier: string().required(),
      mediaTagPrefix: string().required(),
      mediaTagVersion: number().required(),
      thumb: string().required(),
      title1: string().required(),
      title2: string().required(),
      viewGroup: string().required(),
      viewMode: number().required(),
      Directory: array(
        object().shape({
          key: string().required(),
          title: string().required(),
        }),
      ).required().min(1),
    });

    await filterValueSchema.validate(filterValues);
  });
} catch (err) {
  console.log(err);
}
