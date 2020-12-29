import { getConfig } from "/internal/app/moviematch/config.ts";

export const memo = <T>(
  fn: (...args: unknown[]) => T
): ((...args: unknown[]) => T) => {
  if (getConfig().devMode) {
    return fn;
  }
  let cachedResult: T;
  return (...args: unknown[]) => {
    if (!cachedResult) {
      cachedResult = fn(...args);
    }
    return cachedResult;
  };
};

export const memo1 = <T>(
  fn: (key: string, ...args: unknown[]) => T
): ((key: string, ...args: unknown[]) => T) => {
  if (getConfig().devMode) {
    return fn;
  }
  let cachedResult = new Map<string, T>();
  return (key: string, ...args: unknown[]) => {
    if (cachedResult.has(key)) {
      return cachedResult.get(key)!;
    } else {
      const result = fn(key, ...args);
      cachedResult.set(key, result);
      return result;
    }
  };
};
