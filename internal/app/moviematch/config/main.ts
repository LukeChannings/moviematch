import { stringify } from "encoding/yaml.ts";
import * as log from "log/mod.ts";
import { join } from "path/posix.ts";
import { Config } from "/types/moviematch.ts";
import { applyDefaults } from "/internal/app/moviematch/config/defaults.ts";
import { loadFromEnv } from "/internal/app/moviematch/config/load_env.ts";
import { loadFromYaml } from "/internal/app/moviematch/config/load_yaml.ts";
import { validateConfig } from "/internal/app/moviematch/config/validate.ts";
import { MovieMatchError } from "/internal/app/moviematch/util/assert.ts";

let configPath: string;
let cachedConfig: Config;

export function getConfig() {
  if (!cachedConfig) {
    throw new Error(`getConfig was called before the config was loaded.`);
  }
  return cachedConfig;
}

export async function loadConfig(
  path?: string,
): Promise<[config: Config, errors: MovieMatchError[]]> {
  const yamlConfigPath = path ?? join(Deno.cwd(), "config.yaml");

  log.info(`Looking for config in ${yamlConfigPath}`);

  const envConfig = await loadFromEnv();
  let yamlConfig: Partial<Config> | undefined;

  try {
    yamlConfig = yamlConfigPath !== "/dev/null"
      ? await loadFromYaml(yamlConfigPath)
      : {};
  } catch (err) {
    if (path) {
      throw err;
    }
  }

  const serversLength = Math.max(
    yamlConfig?.servers?.length ?? 0,
    envConfig?.servers?.length ?? 0,
    0,
  );

  const config: Partial<Config> = applyDefaults({
    ...yamlConfig,
    ...envConfig,
    ...(serversLength !== 0
      ? ({
        servers: Array.from({ length: serversLength }).map(
          ((_, index) => ({
            ...(yamlConfig?.servers ?? [])[index],
            ...(envConfig?.servers ?? [])[index],
          })),
        ),
      })
      : {}),
  });

  const configErrors = validateConfig(config);

  cachedConfig = config as Config;

  return [cachedConfig, configErrors];
}

export async function updateConfiguration(config: Record<string, unknown>) {
  cachedConfig = config as unknown as Config;
  const yamlConfig = stringify(config, { indent: 2 });
  await Deno.writeTextFile(
    configPath ?? join(Deno.cwd(), "config.yaml"),
    yamlConfig,
  );
}
