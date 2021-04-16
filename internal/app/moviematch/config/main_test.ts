import { assert } from "/deps.ts";
import { Config } from "/types/moviematch.ts";
import { loadConfig } from "/internal/app/moviematch/config/main.ts";
import { resetEnv } from "/internal/app/moviematch/config/load_env_test.ts";

Deno.test("Config -> loadConfig", async () => {
  const cases: Array<
    [
      yamlConfig: string | undefined,
      env: Record<string, string>,
      expectedConfig: Partial<Config>,
      expectedErrors: string[],
    ]
  > = [
    [
      ``,
      {},
      {},
      ["ServersMustNotBeEmpty"],
    ],
    [
      `servers:
  - url: https://plex.example.com
    token: abc123`,
      {},
      {
        hostname: "0.0.0.0",
        port: 8000,
        logLevel: "DEBUG",
        rootPath: "",
        servers: [
          {
            type: "plex",
            libraryTypeFilter: ["movie"],
            url: "https://plex.example.com",
            token: "abc123",
          },
        ],
      },
      [],
    ],
    [
      `
port: 8888
servers:
  - url: https://plex.example.com
    token: abc123`,
      {},
      {
        hostname: "0.0.0.0",
        port: 8888,
        logLevel: "DEBUG",
        rootPath: "",
        servers: [
          {
            type: "plex",
            libraryTypeFilter: ["movie"],
            url: "https://plex.example.com",
            token: "abc123",
          },
        ],
      },
      [],
    ],
    [
      `
port: 8888
servers:
  - url: https://plex.example.com
    token: abc123`,
      { PORT: "9000", LIBRARY_TYPE_FILTER: "show" },
      {
        hostname: "0.0.0.0",
        port: 9000,
        logLevel: "DEBUG",
        rootPath: "",
        servers: [
          {
            type: "plex",
            libraryTypeFilter: ["show"],
            url: "https://plex.example.com",
            token: "abc123",
          },
        ],
      },
      [],
    ],
  ];

  const tmpConfigPath = `/tmp/actualConfig.yaml`;

  for (
    const [testIndex, [yamlConfig, env, expectedConfig, expectedErrors]]
      of Object.entries(cases)
  ) {
    if (yamlConfig) {
      await Deno.writeTextFile(tmpConfigPath, yamlConfig);
    }
    resetEnv(env);

    const [actualConfig, errors] = await loadConfig(
      yamlConfig ? tmpConfigPath : "/dev/null",
    );

    if (expectedErrors.length) {
      assert(
        JSON.stringify(expectedErrors) ===
          JSON.stringify(errors.map((_) => _.name)),
        `Test ${testIndex} failed. Expected ${
          JSON.stringify(expectedErrors)
        }, got ${JSON.stringify(errors.map((_) => _.name))}`,
      );
    } else {
      assert(
        JSON.stringify(actualConfig!) === JSON.stringify(expectedConfig),
        `Test ${testIndex} failed. Expected ${
          JSON.stringify(expectedConfig, null, 2)
        }, got ${JSON.stringify(actualConfig!, null, 2)}`,
      );
    }
  }
});
