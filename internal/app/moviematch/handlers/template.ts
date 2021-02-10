import { ServerRequest } from "http/server.ts";
import { memo } from "/internal/app/moviematch/util/memo.ts";
import { getTranslations } from "/internal/app/moviematch/i18n.ts";
import { Config, getConfig } from "/internal/app/moviematch/config.ts";
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

export const render = async (req: ServerRequest, config: Config) => {
  const translations = await getTranslations(req.headers);
  const template = await getTemplate();

  req.respond({
    status: 200,
    body: interpolate(template, {
      ...translations,
      config: (config as unknown) as KVP,
    }),
  });
};

export const route = [/^\/$/, render] as const;
