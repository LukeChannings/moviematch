import { Config } from "/types/moviematch.ts";
import { assert } from "testing/asserts.ts";
import { applyDefaults } from "/internal/app/moviematch/config/defaults.ts";

Deno.test("Config -> applyDefaults", () => {
  const cases: Array<[Partial<Config>, Partial<Config>]> = [
    [{}, {
      hostname: "0.0.0.0",
      port: 8000,
      logLevel: "DEBUG",
      basePath: "",
      servers: [],
    }],
    [{ hostname: "127.0.0.1" }, {
      hostname: "127.0.0.1",
      port: 8000,
      logLevel: "DEBUG",
      basePath: "",
      servers: [],
    }],
    [{ hostname: "127.0.0.1", port: 8888 }, {
      hostname: "127.0.0.1",
      port: 8888,
      logLevel: "DEBUG",
      basePath: "",
      servers: [],
    }],
    [{ hostname: "127.0.0.1", port: 8888, logLevel: "DEBUG" }, {
      hostname: "127.0.0.1",
      port: 8888,
      logLevel: "DEBUG",
      basePath: "",
      servers: [],
    }],
    [{
      hostname: "127.0.0.1",
      port: 8888,
      logLevel: "DEBUG",
      basePath: "/moviematch",
      servers: [],
    }, {
      hostname: "127.0.0.1",
      port: 8888,
      logLevel: "DEBUG",
      basePath: "/moviematch",
      servers: [],
    }],
    [{
      hostname: "127.0.0.1",
      port: 8888,
      servers: [{} as unknown as Config["servers"][number]],
    }, {
      hostname: "127.0.0.1",
      port: 8888,
      logLevel: "DEBUG",
      basePath: "",
      servers: [
        {
          type: "plex",
          libraryTypeFilter: ["movie"],
        } as unknown as Config["servers"][number],
      ],
    }],
  ];

  for (const [partialConfig, expected] of cases) {
    const actual = applyDefaults(partialConfig);
    assert(
      JSON.stringify(actual) === JSON.stringify(expected),
      `Expected:
      ${JSON.stringify(expected, null, 2)}
      
      got:
      ${JSON.stringify(actual, null, 2)}`,
    );
  }
});
