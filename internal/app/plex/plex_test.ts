import { Schema } from "https://cdn.skypack.dev/valivar";
import { assert, assertEquals, assertNotEquals } from "testing/asserts.ts";
import { PlexApi } from "/internal/app/plex/api.ts";

const TEST_PLEX_URL = Deno.env.get("TEST_PLEX_URL");
const TEST_PLEX_TOKEN = Deno.env.get("TEST_PLEX_TOKEN");

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
);

Deno.test("plexApi -> isAvaliable", async () => {
  assertEquals(
    await plexApi.isAvaliable(),
    true,
    "The server should be available",
  );
});

Deno.test("plexApi -> getIdentity", async () => {
  const identitySchema = new Schema({
    size: Number,
    claimed: Boolean,
    machineIdentifier: String,
    version: String,
  });

  assertEquals(identitySchema.validate(await plexApi.getIdentity()).length, 0);
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
  const serverVersionSchema = new Schema({
    fullVersion: String,
    major: Number,
    minor: Number,
    patch: Number,
    build: Number,
    meta: String,
    hash: String,
  });

  const serverVersion = await plexApi.getServerVersion();
  const errors = serverVersionSchema.validate(serverVersion);
  assertEquals(errors.length, 0);
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
  const libraries = await plexApi.getLibraries();

  const librarySchema = new Schema({
    allowSync: Boolean,
    art: String,
    composite: String,
    filters: Boolean,
    refreshing: Boolean,
    thumb: String,
    key: String,
    type: {
      type: String,
      enum: ["movie", "show", "artist", "photo"],
    },
    title: String,
    agent: String,
    scanner: String,
    language: String,
    uuid: String,
    updatedAt: Number,
    createdAt: Number,
    scannedAt: Number,
    content: Boolean,
    directory: Boolean,
    contentChangedAt: Number,
    hidden: Number,
    Location: [{
      id: Number,
      path: String,
    }],
  });

  for (const library of libraries) {
    assertEquals(librarySchema.validate(library), []);
  }
});
