import { log } from "/deps.ts";
import { LibaryTypes, LibraryType } from "/types/moviematch.ts";
import { addRedaction } from "/internal/app/moviematch/logger.ts";
import {
  assert,
  isRecord,
  MovieMatchError,
} from "/internal/app/moviematch/util/assert.ts";
import {
  BasicAuthInvalid,
  BasicAuthPasswordInvalid,
  BasicAuthUserNameInvalid,
  ConfigMustBeRecord,
  HostNameMustBeString,
  LogLevelInvalid,
  PortMustBeNumber,
  RequirePlexTvLoginInvalid,
  ServerBasePathInvalid,
  ServerLibraryTitleFilterInvalid,
  ServerLibraryTypeFilterInvalid,
  ServerLinkTypeInvalid,
  ServerMustBeRecord,
  ServersMustBeArray,
  ServersMustNotBeEmpty,
  ServerTokenMustBeString,
  ServerTypeInvalid,
  ServerUrlInvalid,
  ServerUrlMustBeString,
  TlsConfigCertFileInvalid,
  TlsConfigInvalid,
  TlsConfigKeyFileInvalid,
} from "/internal/app/moviematch/config/errors.ts";

export const validateConfig = (
  value: unknown,
): MovieMatchError[] => {
  const errors: MovieMatchError[] = [];

  try {
    isRecord(value, "config", ConfigMustBeRecord);

    if (value.hostname) {
      if (typeof value.hostname !== "string") {
        errors.push(new HostNameMustBeString("hostname must be a string"));
      }
    }

    if (value.port) {
      if (typeof value.port === "string") {
        value.port = Number(value.port);
      }

      if (Number.isNaN(value.port)) {
        errors.push(new PortMustBeNumber("Port must be a number"));
      }
    }

    if (value.logLevel) {
      if (typeof value.logLevel === "string") {
        value.logLevel = value.logLevel.toUpperCase();

        if (
          typeof value.logLevel === "string" &&
          !Object.keys(log.LogLevels).includes(value.logLevel)
        ) {
          errors.push(
            new LogLevelInvalid(
              `logLevel must be one of these: ${
                Object.keys(log.LogLevels).join(", ")
              }`,
            ),
          );
        }
      } else {
        errors.push(new LogLevelInvalid("logLevel must be a string"));
      }
    }

    if (!Array.isArray(value.servers)) {
      errors.push(new ServersMustBeArray(`servers must be an Array`));
    } else if (value.servers.length === 0) {
      errors.push(
        new ServersMustNotBeEmpty("At least one server must be configured"),
      );
    } else {
      for (const server of value.servers) {
        try {
          isRecord(server, "server", ServerMustBeRecord);

          if (server.type) {
            if (server.type !== "plex") {
              errors.push(
                new ServerTypeInvalid(
                  `"plex" is the only valid server type. Got "${server.type}"`,
                ),
              );
            }
          }

          if (typeof server.url !== "string") {
            errors.push(
              new ServerUrlMustBeString("a server url must be specified"),
            );
          } else {
            try {
              new URL(server.url);
            } catch (err) {
              errors.push(new ServerUrlInvalid(err.message));
            }

            addRedaction(server.url);
          }

          if (typeof server.token !== "string" || server.token.length === 0) {
            errors.push(
              new ServerTokenMustBeString("a server token must be specified"),
            );
          } else {
            addRedaction(server.token);
          }

          if (server.libraryTitleFilter) {
            if (
              !Array.isArray(server.libraryTitleFilter)
            ) {
              errors.push(
                new ServerLibraryTitleFilterInvalid(
                  "libraryTitleFilter must be a list of strings or a string",
                ),
              );
            } else {
              for (const libraryTitle of server.libraryTitleFilter) {
                if (typeof libraryTitle !== "string") {
                  errors.push(
                    new ServerLibraryTitleFilterInvalid(
                      "libraryTitleFilter must be a list of strings or a string",
                    ),
                  );
                }
              }
            }
          }

          if (server.libraryTypeFilter) {
            if (!Array.isArray(server.libraryTypeFilter)) {
              errors.push(
                new ServerLibraryTypeFilterInvalid(
                  "libraryTypeFilter must be a list of strings",
                ),
              );
            } else {
              for (
                const libraryType of (server.libraryTypeFilter as string[])
              ) {
                if (!LibaryTypes.includes(libraryType as LibraryType)) {
                  errors.push(
                    new ServerLibraryTypeFilterInvalid(
                      `libraryTypeFilter(s) must be one of ${
                        LibaryTypes.join(", ")
                      }. Instead you entered "${libraryType}"`,
                    ),
                  );
                }
              }
            }
          }

          if (server.linkType) {
            const validLinkTypes = ["app", "webLocal", "webExternal"];
            if (
              typeof server.linkType !== "string" ||
              !validLinkTypes.includes(server.linkType)
            ) {
              errors.push(
                new ServerLinkTypeInvalid(
                  `linkType must be one of these: ${
                    validLinkTypes.join(", ")
                  }. Instead, it was "${server.linkType}"`,
                ),
              );
            }
          }
        } catch (err) {
          errors.push(err);
        }
      }
    }

    if (value.rootPath) {
      if (typeof value.rootPath !== "string") {
        errors.push(new ServerBasePathInvalid("rootPath must be a string"));
      } else if (value.rootPath === "/") {
        errors.push(new ServerBasePathInvalid('rootPath must not be "/"'));
      }
    }

    if (value.basicAuth) {
      try {
        isRecord(value.basicAuth, "basicAuth", BasicAuthInvalid);

        if (typeof value.basicAuth.userName !== "string") {
          errors.push(
            new BasicAuthUserNameInvalid(
              "basicAuth.anonymousUserName must be a string",
            ),
          );
        }
        if (typeof value.basicAuth.password !== "string") {
          errors.push(
            new BasicAuthPasswordInvalid("basicAuth.password must be a string"),
          );
        }
      } catch (err) {
        errors.push(err);
      }
    }

    if (value.requirePlexTvLogin) {
      try {
        assert(
          typeof value.requirePlexTvLogin === "boolean",
          'requirePlexTvLogin must be "true" or "false"',
          RequirePlexTvLoginInvalid,
        );
      } catch (err) {
        errors.push(err);
      }
    }

    if (value.tlsConfig) {
      try {
        isRecord(value.tlsConfig, "tlsConfig", TlsConfigInvalid);
        if (typeof value.tlsConfig.certFile !== "string") {
          errors.push(new TlsConfigCertFileInvalid());
        }
        if (typeof value.tlsConfig.keyFile !== "string") {
          errors.push(new TlsConfigKeyFileInvalid());
        }
      } catch (err) {
        errors.push(err);
      }
    }
  } catch (err) {
    errors.push(err);
  }

  return errors;
};
