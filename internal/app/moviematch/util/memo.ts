import { isRelease } from "pkger";

// deno-lint-ignore no-explicit-any
export const memo = <T>(fn: (...args: any[]) => T): ((...args: any[]) => T) => {
  if (!isRelease) {
    return fn;
  }
  let cachedResult: T;
  // deno-lint-ignore no-explicit-any
  return (...args: any[]) => {
    if (!cachedResult) {
      cachedResult = fn(...args);
    }
    return cachedResult;
  };
};

export const memo1 = <T>(
  // deno-lint-ignore no-explicit-any
  fn: (key: string, ...args: any[]) => T,
  // deno-lint-ignore no-explicit-any
): ((key: string, ...args: any[]) => T) => {
  if (!isRelease) {
    return fn;
  }
  const cachedResult = new Map<string, T>();
  // deno-lint-ignore no-explicit-any
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
