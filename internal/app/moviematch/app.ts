import { serve, Server, serveTLS } from "http/server.ts";
import * as log from "log/mod.ts";
import { Config } from "/types/moviematch.ts";
import { handler as serveStaticHandler } from "/internal/app/moviematch/handlers/serve_static.ts";
import { handler as rootHandler } from "/internal/app/moviematch/handlers/template.ts";
import { handler as healthHandler } from "/internal/app/moviematch/handlers/health.ts";
import { handler as apiHandler } from "/internal/app/moviematch/handlers/api.ts";
import { handler as basicAuthHandler } from "/internal/app/moviematch/handlers/basic_auth.ts";
import { handler as posterHandler } from "/internal/app/moviematch/handlers/poster.ts";
import { handler as linkHandler } from "/internal/app/moviematch/handlers/link.ts";
import { urlFromReqUrl } from "/internal/app/moviematch/util/url.ts";

import { createProvider as createPlexProvider } from "/internal/app/moviematch/providers/plex.ts";
import type { MovieMatchProvider } from "/internal/app/moviematch/providers/types.ts";
import { RouteHandler } from "./types.ts";
import { deferred } from "async/deferred.ts";

export class ProviderUnavailableError extends Error {}

export const Application = async (
  config: Config,
  signal?: AbortSignal,
): Promise<number> => {
  let server: Server;

  const providers: MovieMatchProvider[] = config.servers.map(
    (server, index) => {
      if (typeof server.type === "string" && server.type !== "plex") {
        throw new Error(`server type ${server.type} unhandled.`);
      }

      return createPlexProvider(String(index), server);
    },
  );

  for (const provider of providers) {
    if (!await provider.isAvailable()) {
      throw new ProviderUnavailableError(provider.options.url.substr(0, 5));
    }
  }

  try {
    server = config.tlsConfig
      ? serveTLS({ ...config.tlsConfig, ...config })
      : serve(config);

    if (signal) {
      signal.addEventListener("abort", () => {
        log.info(`Abort signalled in Application. Closing server.`);
        server.close();
      });
    }
  } catch (err) {
    log.critical(
      `Failed to start an HTTP server. ${
        err.name === "NotFound" && config.tlsConfig
          ? `Please check that your TLS_CERT and TLS_FILE values are correct.`
          : err.message
      }`,
    );
    return 1;
  }

  log.info(
    `Server listening on ${
      config.tlsConfig ? "https://" : "http://"
    }${config.hostname}:${config.port}`,
  );

  const routes: Array<readonly [RegExp | string, RouteHandler[]]> = [
    ["/", [basicAuthHandler, rootHandler]],
    ["/health", [healthHandler]],
    ["/api/ws", [basicAuthHandler, apiHandler]],
    [
      /^\/api\/poster\/(?<providerIndex>[0-9]+)\/(?<key>[0-9/]+)$/,
      [basicAuthHandler, posterHandler],
    ],
    [
      /^\/api\/link\/(?<providerIndex>[0-9]+)\/(?<key>[0-9a-z/]+)$/i,
      [basicAuthHandler, linkHandler],
    ],
    ["/manifest.webmanifest", [serveStaticHandler]],
    [/.*/, [basicAuthHandler, serveStaticHandler]],
  ];

  try {
    const handling = new Set<Promise<void>>();

    for await (const req of server) {
      const url = urlFromReqUrl(req.url);
      const [path, handlers] = routes.find(([path]) => {
        if (typeof path === "string") {
          return path === url.pathname;
        } else {
          return path.test(url.pathname);
        }
      }) ?? [];

      if (!handlers || !path) {
        log.error(`No handlers for ${url.pathname}`);
      } else {
        (async () => {
          const dfd = deferred<void>();
          handling.add(dfd);
          let response;
          let params;
          if (path instanceof RegExp) {
            params = path.exec(url.pathname)?.groups;
          }
          for (const handler of handlers) {
            response = await handler(req, { providers, config, path, params });
            if (response) {
              break;
            }
          }

          if (!response) {
            response = {
              status: 404,
            };
          }

          try {
            await req.respond(response);
          } catch {
            // Pass
          }

          dfd.resolve();
          handling.delete(dfd);
        })();
      }
    }

    log.info("Closing handlers");

    await Promise.all(handling);

    log.info("Shutting down...");
  } finally {
    log.info("Server closed");
  }

  return 0;
};
