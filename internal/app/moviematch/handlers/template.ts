import { ServerRequest } from "/deps.ts";
import { memo } from "/internal/app/moviematch/util/memo.ts";
import { getTranslations } from "/internal/app/moviematch/i18n.ts";
import { getConfig } from "/internal/app/moviematch/config/main.ts";
import { Config } from "/types/moviematch.ts";
import { RouteHandler } from "/internal/app/moviematch/types.ts";
import { getVersion } from "/internal/app/moviematch/version.ts";
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

const getRootPath = (req: ServerRequest, config: Config) => {
  // X-Forwarded-Prefix is non-standard (https://tools.ietf.org/html/rfc7239#section-4)
  // However, there is no equivalent that provides this functionality,
  // so it's the name I'm going with. This header should be set by the reverse proxy.
  // Further reading: https://github.com/envoyproxy/envoy/issues/5528
  const forwardedPrefix = req.headers.get("x-forwarded-prefix");
  return (forwardedPrefix ?? config.rootPath ?? "").trim().replace(/\/$/, "");
};

export const handler: RouteHandler = async (req: ServerRequest) => {
  const config = getConfig();
  const translations = await getTranslations(req.headers);
  const template = await getTemplate();

  return {
    status: 200,
    headers: new Headers({ "Content-Type": "text/html" }),
    body: interpolate(template, {
      ...translations,
      config: (config as unknown) as KVP,
      rootPath: getRootPath(req, config),
      version: await getVersion(),
    }),
  };
};
