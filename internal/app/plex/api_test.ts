import {
  array,
  boolean,
  number,
  object,
  string,
} from "https://cdn.skypack.dev/yup?dts";
import { assert, assertEquals, assertNotEquals } from "testing/asserts.ts";
import { PlexApi } from "/internal/app/plex/api.ts";

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
    const librarySchema = object().shape({
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
    });

    const libraries = await plexApi.getLibraries();

    for (const library of libraries) {
      await librarySchema.validate(library);
    }
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
      ),
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
      ),
    });

    assertNotEquals(filters.Type.length, 0, "Filters cannot be empty");
    assertNotEquals(filters.FieldType.length, 0, "Filters cannot be empty");

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
      ).required(),
    });

    await filterValueSchema.validate(filterValues);
  });
} catch (err) {
  console.log(err);
}
