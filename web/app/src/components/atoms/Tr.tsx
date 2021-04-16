import React, { memo } from "react";
import { useStore } from "../../store";
import type { TranslationKey } from "../../../../../types/moviematch";

interface TranslationProps {
  name: TranslationKey;
  context?: Record<string, string>;
}

/**
 * A simple interpolate function
 * @example interpolate("foo ${bar} baz", { bar: "abc" }) => "foo abc baz"
 */
const interpolate = (text: string, context: Record<string, string>) => {
  let interpolatedText = text;
  for (const [, match, name] of text.matchAll(/(\$\{([a-z0-9_]+)\})/gi)) {
    interpolatedText = interpolatedText.replace(match, context[name]);
  }
  return interpolatedText;
};

export const Tr = memo(({ name, context }: TranslationProps) => {
  const [{ translations }] = useStore(["translations"]);
  const translation = (translations ?? {})[name];

  if (translation && context) {
    return <>{interpolate(translation, context)}</>;
  }

  return <>{translation ?? name}</>;
});
