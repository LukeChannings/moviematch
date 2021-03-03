import { parse } from "encoding/yaml.ts";
import * as log from "log/mod.ts";
import { join } from "path/posix.ts";
import { Config } from "/types/moviematch.ts";
import { isRecord } from "/internal/app/moviematch/util/assert.ts";
import { ConfigFileNotFoundError } from "/internal/app/moviematch/config/errors.ts";

export const loadFromYaml = async (
  path: string,
): Promise<Partial<Config>> => {
  let config: Partial<Config> = {};

  const yamlConfigPath = path ?? join(Deno.cwd(), "config.yaml");
  const configStat = await Deno.stat(yamlConfigPath);
  if (configStat.isFile) {
    const yamlConfigRaw = await Deno.readTextFile(yamlConfigPath);

    const yamlConfig = parse(yamlConfigRaw);
    isRecord(yamlConfig, yamlConfigPath);

    config = yamlConfig;
  } else {
    throw new ConfigFileNotFoundError(`${path} does not exist`);
  }

  return config;
};
