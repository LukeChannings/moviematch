import React, {
  memo,
  useContext,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { TranslationKey } from "../../../../types/moviematch.ts";
import { MovieMatchContext, Store } from "../store.ts";

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
