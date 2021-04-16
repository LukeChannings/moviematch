import { assert } from "/deps.ts";
import { Config } from "/types/moviematch.ts";
import { loadFromEnv } from "/internal/app/moviematch/config/load_env.ts";

export const resetEnv = (newEnv: Record<string, string>) => {
  const movieMatchEnvKeys = [
    "PLEX_URL",
    "PLEX_TOKEN",
    "LIBRARY_TITLE_FILTER",
    "LIBRARY_TYPE_FILTER",
    "MOVIE_LINK_TYPE",
    "AUTH_USER",
    "AUTH_PASS",
    "TLS_CERT",
    "TLS_KEY",
    "HOST",
    "PORT",
    "LOG_LEVEL",
    "ROOT_PATH",
    "REQUIRE_PLEX_LOGIN",
  ];

  for (const key of movieMatchEnvKeys) {
    Deno.env.delete(key);
  }

  Object.entries(newEnv).forEach((e) => Deno.env.set(...e));
};

Deno.test("Config -> loadFromEnv", async () => {
  const cases: Array<[Record<string, string>, Partial<Config>]> = [
    [{ "HOST": "192.168.1.2", "PORT": "8080" }, {
      hostname: "192.168.1.2",
      port: 8080,
    }],
    [{ "TLS_CERT": "cert.pem", "TLS_KEY": "key.pem" }, {
      tlsConfig: {
        certFile: "cert.pem",
        keyFile: "key.pem",
      },
    }],
    [{ "AUTH_USER": "luke", "AUTH_PASS": "test" }, {
      basicAuth: { userName: "luke", password: "test" },
    }],
    [{ "PLEX_URL": "https://plex.example.com" }, {
      servers: [
        {
          url: "https://plex.example.com",
        } as Config["servers"][number],
      ],
    }],
    [{ "PLEX_URL": "https://plex.example.com", "PLEX_TOKEN": "abc123" }, {
      servers: [
        {
          url: "https://plex.example.com",
          token: "abc123",
        } as Config["servers"][number],
      ],
    }],
    [{ "LIBRARY_TITLE_FILTER": "Movies" }, {
      servers: [
        {
          libraryTitleFilter: ["Movies"],
        } as Config["servers"][number],
      ],
    }],
    [{ "LIBRARY_TYPE_FILTER": "show" }, {
      servers: [
        {
          libraryTypeFilter: ["show"],
        } as Config["servers"][number],
      ],
    }],
    [{ "MOVIE_LINK_TYPE": "app" }, {
      servers: [
        {
          linkType: "app",
        } as Config["servers"][number],
      ],
    }],
    [{ "LOG_LEVEL": "INFO" }, {
      logLevel: "INFO",
    }],
    [{ "ROOT_PATH": "/moviematch" }, {
      rootPath: "/moviematch",
    }],
    [{ "REQUIRE_PLEX_LOGIN": "1" }, {
      requirePlexTvLogin: true,
    }],
  ];

  for (const [env, expectecConfig] of cases) {
    resetEnv(env);
    const actualConfig = await loadFromEnv();
    assert(
      JSON.stringify(expectecConfig) == JSON.stringify(actualConfig),
      `Expected ${JSON.stringify(expectecConfig, null, 2)}, got ${
        JSON.stringify(actualConfig, null, 2)
      }`,
    );
  }
});
