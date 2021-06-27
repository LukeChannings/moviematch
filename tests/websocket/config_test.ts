import { assert, assertEquals } from "/deps.ts";
import { Config } from "/types/moviematch.ts";
import { getWebSocket, startMovieMatch, waitForMessage } from "../framework.ts";

Deno.test("requiresSetup is true", async () => {
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
