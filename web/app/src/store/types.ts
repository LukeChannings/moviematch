import type { Dispatch as ReduxDispatch } from "redux";
import type { Toast } from "src/components/atoms/Toast";
import type { Routes } from "src/types";
import type {
  AppConfig,
  ClientMessage,
  Filters,
  FilterValue,
  Match,
  Media,
  ServerMessage,
  Translations,
  User,
} from "../../../../types/moviematch";

export type ClientActions =
  | { type: "addToast"; payload: Toast }
  | { type: "removeToast"; payload: Toast }
  | {
    type: "navigate";
    payload: { route: Routes; routeParams?: Record<string, string> };
  }
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

export type Dispatch = ReduxDispatch<ClientActions>;

export interface Store {
  connectionStatus: "connecting" | "connected" | "disconnected";
  route: Routes;
  routeParams?: Record<string, string | undefined>;
  error?: { type?: string; message?: string };
  toasts: Toast[];
  translations?: Translations;
  config?: AppConfig;
  user?: User;
  createRoom?: {
    availableFilters?: Filters;
    filterValues?: Record<string, FilterValue[]>;
  };
  room?: {
    name: string;
    joined: boolean;
    media?: Media[];
    matches?: Match[];
    users?: Array<{ user: User; progress: number }>;
  };
}
