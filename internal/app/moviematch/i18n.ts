import { memo, memo1 } from "/internal/util/memo.ts";
import { readDir, readTextFile } from "pkger";

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
