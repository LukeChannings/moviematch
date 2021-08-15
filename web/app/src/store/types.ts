import type { Dispatch as ReduxDispatch } from "redux";
import type { Toast } from "src/components/atoms/Toast";
import type { Routes } from "src/types";
import type {
  ExchangeRequestMessage,
  ExchangeResponseMessage,
  Filters,
  FilterValue,
  Match,
  Media,
  Room,
  UIConfig,
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
  | ExchangeRequestMessage;

export type Actions =
  | {
    type: "connect";
    payload: { config: UIConfig; translations: Record<string, string> };
  }
  | { type: "disconnect" }
  | {
    type: "updateConnectionStatus";
    payload: Store["connectionStatus"];
  }
  | ClientActions
  | ExchangeResponseMessage;

export type Dispatch = ReduxDispatch<ClientActions>;

export interface Store {
  connectionStatus: "connecting" | "connected" | "disconnected";
  route: Routes;
  routeParams?: Record<string, string | undefined>;
  error?: { type?: string; message?: string };
  toasts: Toast[];
  translations?: Record<string, string>;
  config?: Omit<UIConfig, "translations">;
  user?: User;
  createRoom?: {
    availableFilters?: Filters;
    filterValues?: Record<string, FilterValue[]>;
  };
  roomList?: Room[];
  room?: {
    name: string;
    joined: boolean;
    media?: Media[];
    matches?: Match[];
    users?: Array<{ user: User; progress: number }>;
  };
}
