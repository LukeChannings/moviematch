import { serve, Server, ServerRequest, serveTLS } from "http/server.ts";
import { acceptWebSocket } from "ws/mod.ts";
import * as log from "log/mod.ts";
import { route as templateRoute } from "/internal/app/moviematch/handlers/template.ts";
import { serveStatic } from "/internal/app/moviematch/handlers/serve_static.ts";
import { Config } from "/internal/app/moviematch/config.ts";
import { Client } from "/internal/app/moviematch/client.ts";
import { urlFromReqUrl } from "/internal/app/moviematch/util/url.ts";
import {
  isAuthorized,
  respondRequiringAuth,
} from "/internal/app/moviematch/util/basic_auth.ts";
import { createProvider as createPlexProvider } from "/internal/app/moviematch/providers/plex.ts";
import type { MovieMatchProvider } from "/internal/app/moviematch/providers/types.d.ts";

type Handler = (
  req: ServerRequest,
  config: Config,
) => Promise<void>;

export class ProviderUnavailableError extends Error {}

export const Application = async (
  config: Config,
  signal?: AbortSignal,
): Promise<number> => {
  let server: Server;

  const providers: MovieMatchProvider[] = config.servers.map((server) => {
    if (typeof server.type === "string" && server.type !== "plex") {
      throw new Error(`server type ${server.type} unhandled.`);
    }

    return createPlexProvider(server);
  });

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

  const routes: Array<readonly [RegExp, Handler]> = [
    templateRoute,
    [/^\/api\/poster$/, async (req) => {}],
    [/^\/movie\/(?<key>.+)$/, async (req) => {
      const key = req.url.match(/^\/movie\/(?<key>.+)$/)?.groups?.key;
      if (!key) {
        return req.respond({ status: 404 });
      }

      const location = "";

      await req.respond({
        status: 302,
        headers: new Headers({
          Location: location,
        }),
      });
    }],
    [/^\/api\/ws$/, async (req) => {
      try {
        const webSocket = await acceptWebSocket({
          conn: req.conn,
          bufReader: req.r,
          bufWriter: req.w,
          headers: req.headers,
        });

        const client = new Client(webSocket);

        await client.finished;

        Deno.shutdown(req.conn.rid);
      } catch (err) {
        log.error(`Failed to upgrade to a WebSocket`, err);
        req.respond({ status: 404 });
      }
    }],
  ];

  try {
    const handlers = new Set<Promise<void>>();

    const handleRequest = async (req: ServerRequest, config: Config) => {
      const { pathname } = urlFromReqUrl(req.url);

      let resolve: () => void;
      const handledPromise = new Promise<void>((_) => {
        resolve = _;
      });
      handlers.add(handledPromise);

      if (config.basicAuth && !isAuthorized(config.basicAuth, req)) {
        log.debug(`Not authorized`);
        respondRequiringAuth(req);
      }

      const [, handler] = routes.find(([matcher]) => matcher.test(pathname)) ??
        [];

      try {
        log.debug(`Handling ${req.url}`);

        if (handler) {
          await handler(req, config);
        } else {
          await serveStatic(req, ["/web/static", "/web/app/dist"]);
        }

        log.debug(`Finished handling ${req.url}`);
      } catch (err) {
        log.error(String(err));
      } finally {
        handlers.delete(handledPromise);
        resolve!();
      }
    };

    for await (const req of server) {
      handleRequest(req, config);
    }

    log.info("Shutting down...");

    await Promise.all(handlers);

    log.info("Done...");
  } finally {
    log.info("Server closed");
  }

  return 0;
};
