import type { Reducer } from "redux";
import type { Actions, Store } from "./types";

export const initialState: Store = {
  connectionStatus: "disconnected",
  route: "loading",
  toasts: [],
};

export const reducer: Reducer<Store, Actions> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case "updateConnectionStatus": {
      return {
        ...state,
        connectionStatus: action.payload,
        toasts: action.payload === "disconnected"
          ? [
            {
              id: "connection-failure",
              message: "Disconnected",
              appearance: "Failure",
            },
            ...state.toasts,
          ]
          : state.toasts.filter(({ id }) => id !== "connection-failure"),
      };
    }
    case "config": {
      if (action.payload.requiresConfiguration) {
        return { ...state, config: action.payload, route: "config" };
      }
      return {
        ...state,
        config: action.payload,
      };
    }
    case "navigate":
      return {
        ...state,
        route: action.payload.route,
        routeParams: action.payload.routeParams,
      };
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
    case "createRoom":
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
      if (action.payload) {
        return {
          ...state,
          user: action.payload,
          ...(!state.config?.requiresConfiguration
            ? {
              route: "join",
            }
            : {}),
        };
      }
      break;
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
    case "requestFilterValuesSuccess": {
      return {
        ...state,
        room: {
          ...state.room!,
          filterValues: {
            ...state.room?.filterValues,
            [action.payload.request.key]: action.payload.values,
          },
        },
      };
    }
  }

  return state;
};
