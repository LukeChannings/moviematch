import { memo, memo1 } from "/internal/util/memo.ts";

const CONFIG_PATH = Deno.cwd() + "/configs/localization";

export const getAvailableLocales = memo(async () => {
  const availableLocales = new Set<string>();
  for await (const file of Deno.readDir(CONFIG_PATH)) {
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
      const translationText = await Deno.readTextFile(translationPath);
      const translation = JSON.parse(translationText);
      return translation;
    } catch (_) {
      throw new TranslationLoadError(`Failed to load ${translationPath}`);
    }
  }
);
