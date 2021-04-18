import { useSelector as useReduxSelector } from "react-redux";
import type { Store } from "./types";

export const useSelector = <K extends keyof Store>(keys: Array<K>) => {
  return useReduxSelector<Store, Pick<Store, K>>((store) => {
    return keys.reduce((acc, key) => {
      acc[key] = store[key];
      return acc;
    }, {} as Pick<Store, K>);
  });
};
