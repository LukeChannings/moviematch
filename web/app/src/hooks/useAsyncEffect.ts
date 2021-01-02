import { useEffect } from "https://cdn.skypack.dev/react@17.0.1?dts";

export const useAsyncEffect = (
  fn: (...args: unknown[]) => Promise<unknown>,
  deps: unknown[],
) => {
  return useEffect(() => {
    fn();
  }, deps);
};
