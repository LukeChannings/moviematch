import { parse } from "flags/mod.ts";
import * as log from "log/mod.ts";
import { setLogLevel } from "/internal/app/moviematch/logger.ts";
import {
  ConfigReloadError,
  loadConfig,
} from "/internal/app/moviematch/config.ts";
import { getVersion } from "/internal/app/moviematch/version.ts";
import {
  Application,
  ProviderUnavailableError,
} from "/internal/app/moviematch/app.ts";

const flags = parse(Deno.args, { alias: { v: "version" } });

const CONFIG_PATH = flags.config ?? Deno.env.get("CONFIG_PATH");

if (flags.version) {
  console.log(`MovieMatch ${await getVersion()}`);
  Deno.exit(0);
}

if (flags.dev) {
  import("/internal/app/moviematch/dev_server.ts")
    .then(({ watchAndBuild }) => watchAndBuild());
}

let exitCode: number | undefined;

while (typeof exitCode === "undefined") {
  const config = await loadConfig(CONFIG_PATH);

  setLogLevel(config.logLevel);

  log.info(`MovieMatch ${await getVersion()}`);
  log.debug(`Config: ${JSON.stringify(config, null, 2)}`);

  const abortController = new AbortController();

  if (Deno.build.os !== "windows") {
    Deno.signal(Deno.Signal.SIGINT).then(() => abortController.abort());
  }

  try {
    const app = Application(config, abortController.signal);
    exitCode = await app.statusCode;
  } catch (err) {
    if (err instanceof ProviderUnavailableError) {
      exitCode = 1;
      log.critical(String(err));
    }

    if (err instanceof ConfigReloadError) {
      exitCode = undefined;
      log.info(`Reloading configuration`);
    }
  }
}

Deno.exit(exitCode);
