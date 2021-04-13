import type { Toast } from "src/components/atoms/Toast";
import type { Routes } from "src/types";
import type {
  AppConfig,
  ClientMessage,
  ServerMessage,
  Translations,
} from "../../../../types/moviematch";
import type { Store } from "./reducer";

export type ClientActions =
  | { type: "addToast"; payload: Toast }
  | { type: "removeToast"; payload: Toast }
  | { type: "navigate"; payload: Routes }
  | { type: "plexLogin" }
  | ServerMessage;

export type Actions =
  | {
    type: "connect";
    payload: { config: AppConfig; translations: Translations };
  }
  | { type: "disconnect" }
  | {
    type: "updateConnectionStatus";
    payload: Store["connectionStatus"];
  }
  | ClientActions
  | ClientMessage;
