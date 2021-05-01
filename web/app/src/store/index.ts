import { useDispatch } from "react-redux";
import type { Dispatch, Store } from "./types";
import { useSelector } from "./useSelector";
export type { Dispatch } from "./types";

export * from "./createStore";
export * from "./useSelector";

export const useStore = (keys: Array<keyof Store>) => {
  const dispatch = useDispatch<Dispatch>();
  const store = useSelector(keys);
  return [store, dispatch] as const;
};
