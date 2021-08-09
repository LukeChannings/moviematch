import { parseYaml } from "/deps.ts";
import { Config } from "/types/moviematch.ts";
import { isRecord } from "/internal/app/moviematch/util/assert.ts";
import { ConfigFileNotFoundError } from "/internal/app/moviematch/config/errors.ts";

export const loadFromYaml = async (
  path: string,
): Promise<Partial<Config>> => {
  let config: Partial<Config> = {};

  const configStat = await Deno.stat(path);
  if (configStat.isFile) {
    const yamlConfigRaw = await Deno.readTextFile(path);

    const yamlConfig = parseYaml(yamlConfigRaw);
    isRecord(yamlConfig, path);

    config = yamlConfig;
  } else {
    throw new ConfigFileNotFoundError(`${path} does not exist`);
  }

  return config;
};
