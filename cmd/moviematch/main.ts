import { assert } from "https://deno.land/std@0.82.0/_util/assert.ts";
import { serve } from "https://deno.land/std@0.82.0/http/server.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";
import { setupLogger, getLogger } from "/internal/app/moviematch/logger.ts";
import { render } from "/internal/app/moviematch/template.ts";
import { getAvailableLocales } from "/internal/app/moviematch/i18n.ts";
import { getAllMedia, isAvailable } from "/internal/app/plex/api.ts";
import {
  isAuthorized,
  respondRequiringAuth,
} from "/internal/util/basicAuth.ts";
import { serveStatic } from "/internal/util/serveStatic.ts";
import { upgradeWebSocket } from "/internal/app/moviematch/websocket.ts";
import { watchAndBuild } from "/internal/app/moviematch/devServer.ts";

const config = getConfig();
const availableLocales = await getAvailableLocales();
await setupLogger(config.logLevel);
const log = getLogger();

assert(
  await isAvailable(config.plexUrl),
  `Availability of ${config.plexUrl.origin} could not be verified.`
);

const libs = await getAllMedia(config.plexUrl, ["movie"], {
  filters: [["year", "IS", "2000"]],
  sort: ["rating", "DESCENDING"],
});

Deno.writeTextFile("./movies.json", JSON.stringify(libs, null, 2));

assert(availableLocales.size !== 0, `Could not find any translation files`);

log.debug(`Config: ${JSON.stringify(config)}`);

log.debug(`Available localisations: ${[...availableLocales].join(", ")}`);

const server = serve(config.addr);

log.info(`Server listening on: ${config.addr}`);

Deno.signal(Deno.Signal.SIGINT).then(() => {
  server.close();
  Deno.exit(0);
});

if (config.devMode) {
  watchAndBuild();
}

for await (const req of server) {
  log.debug(`Handling ${req.url}`);
  const { pathname } = new URL("http://" + config.addr + req.url);

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
        req.respond({ status: 404 });
        break;
      case "/api/plexAuthCallback":
        console.log("Plex Auth callback");
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
