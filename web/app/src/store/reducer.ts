import type { Reducer } from "redux";
import type { Actions, Store } from "./types";

export const initialState: Store = {
  connectionStatus: "disconnected",
  route: "loading",
  routeParams: {},
  toasts: [],
};

export const reducer: Reducer<Store, Actions> = (
  state = initialState,
  action,
) => {
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
      if (action.payload) {
        return {
          ...state,
          user: action.payload,
          route: "join",
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
  }

  return state;
};
