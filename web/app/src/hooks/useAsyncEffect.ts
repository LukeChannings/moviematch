import { useEffect } from "react";

export const useAsyncEffect = (
  fn: (...args: unknown[]) => Promise<unknown>,
  deps: unknown[],
) => {
  return useEffect(() => {
    fn();
  }, deps);
};
