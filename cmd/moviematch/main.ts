import { assert } from "https://deno.land/std@0.84.0/_util/assert.ts";
import {
  serve,
  Server,
  ServerRequest,
  serveTLS,
} from "https://deno.land/std@0.84.0/http/server.ts";
import { acceptWebSocket } from "https://deno.land/std@0.84.0/ws/mod.ts";
import { Config, getConfig } from "/internal/app/moviematch/config.ts";
import { getLogger, setupLogger } from "/internal/app/moviematch/logger.ts";
import { getAvailableLocales } from "/internal/app/moviematch/i18n.ts";
import { Client } from "/internal/app/moviematch/client.ts";
import { isAvailable } from "/internal/app/plex/api.ts";
import {
  isAuthorized,
  respondRequiringAuth,
} from "/internal/util/basic_auth.ts";
import { watchAndBuild } from "/internal/app/moviematch/dev_server.ts";
import { urlFromReqUrl } from "/internal/util/url.ts";
import { isRelease, readTextFile } from "pkger";
import { serveStatic } from "/internal/app/moviematch/handlers/serve_static.ts";
import { route as templateRoute } from "/internal/app/moviematch/handlers/template.ts";
import { route as posterRoute } from "/internal/app/moviematch/handlers/poster_art.ts";
import { route as movieLinkRoute } from "/internal/app/moviematch/handlers/movie_link.ts";

const VERSION = await readTextFile("/VERSION");

const showVersion = Deno.args.includes("--version") || Deno.args.includes("-v");

if (showVersion) {
  console.log(`MovieMatch ${VERSION}`);
  Deno.exit(0);
}

const config = getConfig();
const availableLocales = await getAvailableLocales();
await setupLogger(config.logLevel);
const log = getLogger();

log.info(`Starting MovieMatch (${VERSION})`);

assert(
  await isAvailable(config.plexUrl),
  `Availability of ${config.plexUrl.origin} could not be verified.`,
);

assert(availableLocales.size !== 0, `Could not find any translation files`);

log.debug(`Config: ${JSON.stringify(config)}`);

log.debug(`Available localisations: ${[...availableLocales].join(", ")}`);

let server: Server;

try {
  server = config.tlsConfig
    ? serveTLS({ ...config.tlsConfig, ...config.addr })
    : serve(config.addr);
} catch (err) {
  log.critical(
    `Failed to start an HTTP server. ${
      err.name === "NotFound" && config.tlsConfig
        ? `Please check that your TLS_CERT and TLS_FILE values are correct.`
        : err.message
    }`,
  );
  Deno.exit(1);
}

log.info(
  `Server listening on ${
    config.tlsConfig ? "https" : "http"
  }://${config.addr.hostname}:${config.addr.port}`,
);

if (Deno.build.os !== "windows") {
  Deno.signal(Deno.Signal.SIGINT).then(() => {
    log.info("Shutting down");
    server.close();
    Deno.exit(0);
  });
}

if (config.devMode && !isRelease) {
  watchAndBuild();
}

type Handler = (req: ServerRequest, config: Config) => Promise<void>;

const routes: Array<readonly [RegExp, Handler]> = [
  templateRoute,
  posterRoute,
  movieLinkRoute,
  [/^\/api\/ws$/, async (req) => {
    try {
      const webSocket = await acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      });

      new Client(webSocket);
    } catch (err) {
      log.error(`Failed to upgrade to a WebSocket`, err);
      req.respond({ status: 404 });
    }
  }],
];

for await (const req of server) {
  log.debug(`Handling ${req.url}`);
  const { pathname } = urlFromReqUrl(req.url);

  if (config.basicAuth && !isAuthorized(config.basicAuth, req)) {
    log.debug(`Not authorized`);
    respondRequiringAuth(req);
    continue;
  }

  const [, handler] = routes.find(([matcher]) => matcher.test(pathname)) ?? [];

  if (handler) {
    handler(req, config).catch(log.error);
  } else {
    serveStatic(req, ["/web/static", "/web/app/dist"]).catch(log.error);
  }
}
