import React, { memo, useContext } from "react";
import type { TranslationKey } from "../../../../../types/moviematch";
import { MovieMatchContext } from "../../store";

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
  const store = useContext(MovieMatchContext);
  const translation = (store.translations ?? {})[name];

  if (translation && context) {
    return <>{interpolate(translation, context)}</>;
  }

  return <>{translation ?? name}</>;
});
