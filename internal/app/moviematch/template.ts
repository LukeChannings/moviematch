import { ServerRequest } from "https://deno.land/std@0.83.0/http/server.ts";
import { Accepts } from "https://deno.land/x/accepts@2.1.0/mod.ts";
import { memo } from "/internal/util/memo.ts";
import {
  getAvailableLocales,
  loadTranslation,
} from "/internal/app/moviematch/i18n.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";

type KVP = { [key: string]: string | KVP };

const get = (context: KVP, keyPath: string[]): string =>
  String(
    keyPath.reduce(
      (subContext: string | KVP, key: string) =>
        typeof subContext === "object" ? subContext[key] ?? "" : subContext,
      context
    )
  );

const interpolate = (template: string, context: KVP): string => {
  for (const [, match, name] of template.matchAll(/(\$\{([a-z0-9_.]+)\})/gi)) {
    template = template.replace(match, get(context, name.split(".")));
  }

  return template;
};

let getTemplate = memo(() =>
  Deno.readTextFile(Deno.cwd() + "/web/template/index.html")
);

export const getTranslations = async (
  req: ServerRequest
): Promise<Record<string, string>> => {
  const { headers } = req;
  const accept = new Accepts(headers);
  const availableLocales = await getAvailableLocales();
  const acceptedLanguage = accept.languages([...availableLocales]);

  const language = !acceptedLanguage
    ? "en"
    : Array.isArray(acceptedLanguage)
    ? acceptedLanguage[0]
    : acceptedLanguage;

  return loadTranslation(language);
};

export const render = async (req: ServerRequest) => {
  const translations = await getTranslations(req);
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
