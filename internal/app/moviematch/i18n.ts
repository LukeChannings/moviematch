import { Accepts, log } from "/deps.ts";
import { readDir, readTextFile } from "pkger";
import { memo, memo1 } from "/internal/app/moviematch/util/memo.ts";
import { Translations } from "/types/moviematch.ts";

const CONFIG_PATH = "/configs/localization";

export const getAvailableLocales = memo(async () => {
  const availableLocales = new Set<string>();
  for await (const file of readDir(CONFIG_PATH)) {
    if (file.isFile) {
      availableLocales.add(file.name.replace(".json", ""));
    }
  }
  return availableLocales;
});

class TranslationLoadError extends Error {}

export const loadTranslation = memo1(
  async (locale: string): Promise<Record<string, string>> => {
    const translationPath = CONFIG_PATH + `/${locale}.json`;

    try {
      const translationText = await readTextFile(translationPath);
      const translation = JSON.parse(translationText);
      return translation;
    } catch (_) {
      throw new TranslationLoadError(`Failed to load ${translationPath}`);
    }
  },
);

export const getTranslations = async (
  headers: Headers,
): Promise<Translations> => {
  const accept = new Accepts(headers);
  if (!headers.get("accept-language")) {
    log.info(
      `No accept-languages when loading translations. Defaulting to en`,
    );
    headers.set("accept-language", "en");
  }
  const availableLocales = await getAvailableLocales();
  const acceptedLanguage = accept.languages([...availableLocales]);

  let language: string;

  if (acceptedLanguage === false) {
    language = "en";
  } else if (Array.isArray(acceptedLanguage)) {
    language = acceptedLanguage[0];
  } else {
    language = acceptedLanguage;
  }

  return await loadTranslation(language) as Translations;
};
