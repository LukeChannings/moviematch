import { assert } from "https://deno.land/std@0.83.0/_util/assert.ts";
import {
  serve,
  Server,
  serveTLS,
} from "https://deno.land/std@0.83.0/http/server.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";
import { getLogger, setupLogger } from "/internal/app/moviematch/logger.ts";
import { render } from "/internal/app/moviematch/template.ts";
import { getAvailableLocales } from "/internal/app/moviematch/i18n.ts";
import { isAvailable } from "/internal/app/plex/api.ts";
import {
  isAuthorized,
  respondRequiringAuth,
} from "/internal/util/basicAuth.ts";
import { serveStatic } from "/internal/util/serveStatic.ts";
import { upgradeWebSocket } from "/internal/app/moviematch/websocket.ts";
import { watchAndBuild } from "/internal/app/moviematch/devServer.ts";
import { proxy } from "/internal/util/proxy.ts";
import { urlFromReqUrl } from "/internal/util/url.ts";

const config = getConfig();
const availableLocales = await getAvailableLocales();
await setupLogger(config.logLevel);
const log = getLogger();

assert(
  await isAvailable(config.plexUrl),
  `Availability of ${config.plexUrl.origin} could not be verified.`
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
        : ""
    }`
  );
  Deno.exit(1);
}

log.info(
  `Server listening on ${config.tlsConfig ? "https" : "http"}://${
    config.addr.hostname
  }:${config.addr.port}`
);

Deno.signal(Deno.Signal.SIGINT).then(() => {
  server.close();
  Deno.exit(0);
});

if (config.devMode) {
  watchAndBuild();
}

for await (const req of server) {
  log.debug(`Handling ${req.url}`);
  const { pathname } = urlFromReqUrl(req.url);

  if (config.basicAuth && !isAuthorized(config.basicAuth, req)) {
    log.debug(`Not authorized`);
    respondRequiringAuth(req);
    continue;
  }

  try {
    switch (pathname) {
      case "/":
        await render(req);
        break;
      case "/api/ws":
        upgradeWebSocket(req);
        break;
      case "/api/poster":
        const { searchParams } = urlFromReqUrl(req.url);
        const key = searchParams.get("key");
        const width = searchParams.has("w") ? searchParams.get("w")! : "500";
        if (!key) {
          req.respond({ status: 404 });
        } else {
          const height = String(Number(width) * 1.5);

          proxy(req, "/photo/:/transcode", config.plexUrl, {
            width,
            height,
            minSize: "1",
            upscale: "1",
            url: key,
          });
        }
        break;
      default:
        await serveStatic(req, ["/web/static", "/web/app/dist"]);
        break;
    }
  } catch (err) {
    log.error(err);
    req.respond({ status: 500 });
  }
}
