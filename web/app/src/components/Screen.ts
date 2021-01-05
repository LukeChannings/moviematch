import React from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Actions, Routes } from "../store.ts";

import "./Screen.css";

export interface ScreenProps<T = undefined> {
  dispatch: React.Dispatch<Actions>;
  navigate(route: Routes): void;
  params: T;
}
