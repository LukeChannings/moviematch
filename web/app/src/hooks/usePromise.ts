import { useEffect, useState } from "https://cdn.skypack.dev/react@17.0.1?dts";

export const usePromise = <T>(promise: Promise<T>, deps: unknown[]) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setData(null);
    setError(null);

    promise.then(setData).catch(setError);
  }, deps);

  return [loading, data, error] as const;
};
