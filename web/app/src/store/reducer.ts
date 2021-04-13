import type { PlexPIN } from "src/api/plex_tv";
import type { Toast } from "src/components/atoms/Toast";
import type { Routes } from "src/types";
import type {
  AppConfig,
  Filters,
  FilterValue,
  Match,
  Media,
  Translations,
} from "../../../../types/moviematch";
import type { Actions } from "./actions";

interface User {
  userName: string;
  avatar?: string;
  plexAuth?: { clientId: string; plexToken: string } | { pin: PlexPIN };
}

export interface Store {
  connectionStatus: "connecting" | "connected" | "disconnected";
  route: Routes;
  routeParams: Record<string, unknown>;
  error?: { type?: string; message?: string };
  toasts: Toast[];
  translations?: Translations;
  config?: AppConfig;
  user?: User;
  room?: {
    name: string;
    joined: boolean;
    media?: Media[];
    matches?: Match[];
    availableFilters?: Filters;
    filterValues?: Record<string, FilterValue[]>;
  };
}

export const initialState: Store = {
  connectionStatus: "disconnected",
  route: "loading",
  routeParams: {},
  toasts: [],
};

export const reducer = (state: Store, action: Actions): Store => {
  console.log(action);
  switch (action.type) {
    case "updateConnectionStatus":
      return { ...state, connectionStatus: action.payload };
    case "navigate":
      return { ...state, route: action.payload };
    case "addToast":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case "removeToast":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast !== action.payload),
      };
    case "joinRoom": {
      return {
        ...state,
        room: { name: action.payload.roomName, joined: false },
      };
    }
    case "createRoomSuccess":
    case "joinRoomSuccess": {
      if (state.room) {
        return {
          ...state,
          route: "room",
          room: {
            ...state.room,
            joined: true,
            matches: action.payload.previousMatches,
            media: action.payload.media,
          },
        };
      }
      break;
    }
    case "loginSuccess": {
      return {
        ...state,
        user: action.payload,
        route: "join",
      };
    }
    case "logoutSuccess": {
      return {
        ...state,
        user: undefined,
        room: undefined,
        route: "login",
      };
    }
    case "loginError":
    case "joinRoomError":
    case "createRoomError": {
      return { ...state, error: action.payload };
    }
    case "leaveRoomSuccess": {
      return { ...state, room: undefined, route: "join" };
    }
    case "translations": {
      return { ...state, translations: action.payload };
    }
    case "requestFiltersSuccess": {
      return {
        ...state,
        room: { ...state.room!, availableFilters: action.payload },
      };
    }
  }

  return state;
};
