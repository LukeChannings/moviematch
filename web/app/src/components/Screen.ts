import type { Actions, Routes, Store } from "../store";

import "./Screen.css";

export interface ScreenProps<T = undefined> {
  dispatch: React.Dispatch<Actions>;
  navigate(route: Routes): void;
  params: T;
  store: Store;
}
