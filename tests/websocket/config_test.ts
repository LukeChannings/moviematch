import { assert, assertEquals } from "/deps.ts";
import { Config } from "/types/moviematch.ts";
import {
  getUniquePort,
  getWebSocket,
  startMovieMatch,
  waitForMessage,
} from "../_utils.ts";

Deno.test("requiresSetup is true when config is empty", async () => {
  const { url, stop } = await startMovieMatch({});
  const ws = await getWebSocket(url);
  ws.send(JSON.stringify({ type: "config", payload: { locale: "en" } }));
  const config = await waitForMessage(ws, "configSuccess");
  assertEquals(
    config.payload.requiresSetup,
    true,
    "requiresSetup should be true",
  );
  assert(
    typeof config.payload.initialConfiguration === "object" &&
      config.payload.initialConfiguration !== null,
    "initialConfiguration should be an object",
  );

  await stop();
});

Deno.test("requiresSetup is false when config has servers", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
  });
  const ws = await getWebSocket(url);
  ws.send(JSON.stringify({ type: "config", payload: { locale: "en" } }));
  const config = await waitForMessage(ws, "configSuccess");
  assertEquals(
    config.payload.requiresSetup,
    false,
    "requiresSetup should be false",
  );

  await stop();
});

Deno.test(
  "configure command fails when the configuration is invalid",
  async () => {
    const { url, stop } = await startMovieMatch({});
    const ws = await getWebSocket(url);
    ws.send(JSON.stringify({
      type: "setup",
      payload: { servers: [{}] } as Config,
    }));

    const setupError = await waitForMessage(ws, "setupError");

    assert(setupError.payload.type === "InvalidConfig");

    assertEquals(setupError.payload.errors, [
      "ServerUrlMustBeString",
      "ServerTokenMustBeString",
    ]);

    await stop();
  },
);

Deno.test({
  name: "configure command fails when a provider is unavailable",
  fn: async () => {
    const { url, stop } = await startMovieMatch({});
    const ws = await getWebSocket(url);
    ws.send(JSON.stringify({
      type: "setup",
      payload: {
        servers: [
          {
            url: "https://plex.example.com",
            token: "abc123",
          },
        ],
      } as Config,
    }));

    const setupError = await waitForMessage(ws, "setupError");
    assert(
      setupError.payload.type === "ProviderAvailabilityError",
      `setupError.payload.type: expected "ProviderAvailabilityError", got "${setupError.payload.type}"`,
    );

    assertEquals(setupError.payload.unavailableUrls, [
      "https://plex.example.com",
    ]);

    await stop();
  },
});

Deno.test({
  name: "configure succeeds when Plex server is available",
  fn: async () => {
    const { url, stop } = await startMovieMatch({});
    const ws = await getWebSocket(url);
    const port = getUniquePort();

    ws.send(JSON.stringify({
      type: "setup",
      payload: {
        port,
        servers: [
          {
            url: Deno.env.get("TEST_PLEX_URL"),
            token: Deno.env.get("TEST_PLEX_TOKEN"),
          },
        ],
      } as Config,
    }));

    const setupSuccess = await waitForMessage(ws, "setupSuccess");

    assertEquals(
      setupSuccess.payload.port,
      port,
      "The new port is sent in the setup success",
    );

    await stop();
  },
});
