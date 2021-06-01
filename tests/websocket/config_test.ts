import { assert, assertEquals } from "/deps.ts";
import { Config } from "/types/moviematch.ts";
import { sendMessage, testMovieMatch, waitForMessage } from "../framework.ts";

await testMovieMatch("Config - Unconfigured", {}, ({ test }) => {
  test("requiresSetup is true", async (ws) => {
    const config = await waitForMessage(ws, "config");
    assertEquals(config.payload.requiresSetup, true);
    assert(
      typeof config.payload.initialConfiguration === "object" &&
        config.payload.initialConfiguration !== null,
    );
  });

  test("configure command fails when the configuration is invalid", async (
    ws,
  ) => {
    sendMessage(ws, {
      type: "setup",
      payload: { servers: [{}] } as Config,
    });

    const setupError = await waitForMessage(ws, "setupError");

    assert(setupError.payload.type === "InvalidConfig");

    assertEquals(setupError.payload.errors, [
      "ServerUrlMustBeString",
      "ServerTokenMustBeString",
    ]);
  });

  test("configure command fails when a provider is unavailable", async (
    ws,
  ) => {
    sendMessage(ws, {
      type: "setup",
      payload: {
        servers: [{
          url: "https://plex.example.com",
          token: "abc123",
        }],
      } as Config,
    });

    const setupError = await waitForMessage(ws, "setupError");

    assert(
      setupError.payload.type === "ProviderAvailabilityError",
      `setupError.payload.type: expected "ProviderAvailabilityError", got "${setupError.payload.type}"`,
    );

    assertEquals(setupError.payload.unavailableUrls, [
      "https://plex.example.com",
    ]);
  });

  // test("configure command succeeds when the configuration is valid", async () => {
  //   sendMessage(ws, {
  //     type: "setup",
  //     payload: { servers: [{}] } as Config,
  //   });

  //   const setupError = await waitForMessage(ws, "setupError");

  //   assert(setupError.payload.type === "InvalidConfig");

  //   assertEquals(setupError.payload.errors, [
  //     "ServerUrlMustBeString",
  //     "ServerTokenMustBeString",
  //   ]);
  // });

  test(
    "the server sends the client a message when it's about to restart",
    async () => {
    },
  );
  test("login command always fails", async () => {
  });
});
