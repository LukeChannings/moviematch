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
          error: undefined,
          room: {
            ...state.room,
            joined: true,
            matches: action.payload.previousMatches,
            media: action.payload.media,
            users: action.payload.users,
          },
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
      let route = state.route;

      if (action.type === "loginError") route = "login";
      if (action.type === "joinRoomError") route = "join";
      if (action.type === "createRoomError") route = "createRoom";

      return { ...state, error: action.payload, route };
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
        createRoom: { ...state.createRoom!, availableFilters: action.payload },
      };
    }
    case "requestFilterValuesSuccess": {
      return {
        ...state,
        createRoom: {
          ...state.createRoom!,
          filterValues: {
            ...state.createRoom?.filterValues,
            [action.payload.request.key]: action.payload.values,
          },
        },
      };
    }
    case "match": {
      return {
        ...state,
        room: {
          ...state.room!,
          matches: [
            ...(state.room?.matches ?? []).filter((_) =>
              _.media.id !== action.payload.media.id
            ),
            action.payload,
          ],
        },
      };
    }
    case "userJoinedRoom": {
      return {
        ...state,
        room: {
          ...state.room!,
          users: [...state.room?.users ?? [], action.payload],
        },
      };
    }
    case "userLeftRoom": {
      return {
        ...state,
        room: {
          ...state.room!,
          users: (state.room?.users ?? []).filter(({ user }) =>
            user.userName !== action.payload.userName
          ),
        },
      };
    }
    case "userProgress": {
      return {
        ...state,
        room: {
          ...state.room!,
          users: (state.room?.users ?? []).map((userProgress) => {
            if (userProgress.user.userName === action.payload.user.userName) {
              return { ...userProgress, progress: action.payload.progress };
            }
            return userProgress;
          }),
        },
      };
    }
  }

  return state;
};
