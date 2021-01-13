import { ServerRequest } from "https://deno.land/std@0.83.0/http/server.ts";
import { memo } from "/internal/util/memo.ts";
import {
  getAvailableLocales,
  getTranslations,
  loadTranslation,
} from "/internal/app/moviematch/i18n.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";
import { getLogger } from "/internal/app/moviematch/logger.ts";
import { readTextFile } from "pkger";

type KVP = { [key: string]: string | KVP };

const get = (context: KVP, keyPath: string[]): string =>
  String(
    keyPath.reduce(
      (subContext: string | KVP, key: string) =>
        typeof subContext === "object" ? subContext[key] ?? "" : subContext,
      context,
    ),
  );

const interpolate = (template: string, context: KVP): string => {
  for (const [, match, name] of template.matchAll(/(\$\{([a-z0-9_.]+)\})/gi)) {
    template = template.replace(match, get(context, name.split(".")));
  }

  return template;
};

const getTemplate = memo(() => readTextFile("/web/template/index.html"));

export const render = async (req: ServerRequest) => {
  const translations = await getTranslations(req.headers);
  const config = getConfig();
  const template = await getTemplate();

  req.respond({
    status: 200,
    body: interpolate(template, {
      ...translations,
      config: (config as unknown) as KVP,
    }),
  });
};
