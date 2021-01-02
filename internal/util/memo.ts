import { getConfig } from "/internal/app/moviematch/config.ts";

export const memo = <T>(fn: (...args: any[]) => T): ((...args: any[]) => T) => {
  if (getConfig().devMode) {
    return fn;
  }
  let cachedResult: T;
  return (...args: any[]) => {
    if (!cachedResult) {
      cachedResult = fn(...args);
    }
    return cachedResult;
  };
};

export const memo1 = <T>(
  fn: (key: string, ...args: any[]) => T
): ((key: string, ...args: any[]) => T) => {
  if (getConfig().devMode) {
    return fn;
  }
  let cachedResult = new Map<string, T>();
  return (key: string, ...args: any[]) => {
    if (cachedResult.has(key)) {
      return cachedResult.get(key)!;
    } else {
      const result = fn(key, ...args);
      cachedResult.set(key, result);
      return result;
    }
  };
};
