import {
  applyMiddleware,
  createStore as createReduxStore,
  Middleware,
} from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { MovieMatchClient } from "../api/moviematch";
import { reducer } from "./reducer";
import * as plex from "../api/plex_tv";
import type { Actions, Dispatch, Store } from "./types";
import type { ExchangeResponseMessage } from "../../../../types/moviematch";

const getExistingLogin = async () => {
  const plexLoginStatus = plex.getLogin();

  if (plexLoginStatus) {
    if ("pin" in plexLoginStatus) {
      try {
        return await plex.verifyPin(plexLoginStatus.pin);
      } catch (err) {
        return null;
      }
    } else {
      return plexLoginStatus;
    }
  }

  const userName = localStorage.getItem("userName");
  if (userName) return { userName };

  return null;
};

let client: MovieMatchClient;

export const createStore = () => {
  if (!client) {
    client = new MovieMatchClient();
  }

  const forwardActions: Middleware<Dispatch, Store> = ({ getState }) =>
    (next) =>
      (action: Actions) => {
        (async () => {
          switch (action.type) {
            case "setup":
              client.setup(action.payload);
              break;
            case "config":
              client.config(action.payload);
              break;
            case "login": {
              const response = await client.login(action.payload);
              if (response.type === "loginSuccess") {
                localStorage.setItem("userName", response.payload.userName);
              }
              break;
            }
            case "leaveRoom":
            case "logout": {
              const response = await client[action.type](action.payload);

              if (response.type === "logoutSuccess") {
                localStorage.removeItem("userName");
                localStorage.removeItem("plexToken");
                localStorage.removeItem("plexTvPin");
              }

              if (
                response.type === "leaveRoomSuccess" ||
                response.type === "logoutSuccess"
              ) {
                const newUrl = new URL(location.href);
                newUrl.searchParams.delete("roomName");
                history.replaceState(null, document.title, newUrl.href);
              }
              break;
            }
            case "createRoom":
            case "joinRoom": {
              const response = await client[action.type](action.payload);
              if (
                response.type === "joinRoomSuccess" ||
                response.type === "createRoomSuccess"
              ) {
                const roomName = getState().room?.name;
                if (roomName) {
                  const newUrl = new URL(location.href);
                  newUrl.searchParams.set("roomName", roomName);
                  history.replaceState(null, document.title, newUrl.href);
                }
              }
              break;
            }
            case "deleteRoom":
              client.deleteRoom(action.payload);
              break;
            case "resetRoom":
              client.resetRoom(action.payload);
              break;
            case "listRooms":
              client.listRooms(action.payload);
              break;
            case "listUsers":
              client.listUsers(action.payload);
              break;
            case "rate":
              client.rate(action.payload);
              break;
            case "requestFilters":
              client.requestFilters(action.payload);
              break;
            case "requestFilterValues":
              client.requestFilterValues(action.payload);
              break;
          }
        })();

        if (action.type === "plexLogin") {
          plex.signIn();
        }

        return next(action);
      };

  const store = createReduxStore(
    reducer,
    composeWithDevTools({ trace: true })(applyMiddleware(forwardActions)),
  );

  const { dispatch } = store;

  dispatch({ type: "updateConnectionStatus", payload: "connecting" });

  client.addEventListener("connected", async () => {
    dispatch({ type: "updateConnectionStatus", payload: "connected" });
    dispatch({
      type: "config",
      payload: { locale: navigator.language },
    });

    const existingLogin = await getExistingLogin();

    if (existingLogin) {
      dispatch({
        type: "login",
        payload: "token" in existingLogin
          ? {
            plexToken: existingLogin.token,
            clientId: existingLogin.clientId,
          }
          : existingLogin,
      });
    } else {
      dispatch({ type: "navigate", payload: { route: "login" } });
    }
  });

  client.addEventListener("disconnected", () => {
    dispatch({ type: "updateConnectionStatus", payload: "disconnected" });
  });

  client.addEventListener("message", (e) => {
    dispatch((e as MessageEvent<ExchangeResponseMessage>).data);
  });

  return store;
};
