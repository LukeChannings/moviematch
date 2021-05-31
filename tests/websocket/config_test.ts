import { testMovieMatch } from "../framework.ts";

testMovieMatch("Config - Unconfigured", {}, ({ test }) => {
  test("requiresConfiguration=true is sent to the client", async () => {
  });

  test("configure command fails when the configuration is invalid", async () => {
  });
  test("configure command succeeds when the configuration is valid", async () => {
  });
  test(
    "the server sends the client a message when it's about to restart",
    async () => {
    },
  );
  test("login command always fails", async () => {
  });
});
