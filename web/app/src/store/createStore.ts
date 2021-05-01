import {
  applyMiddleware,
  createStore as createReduxStore,
  Middleware,
} from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { MovieMatchClient } from "../api/moviematch";
import type {
  ClientMessage,
  ServerMessage,
} from "../../../../types/moviematch";
import { reducer } from "./reducer";
import * as plex from "../api/plex_tv";
import type { Actions } from "./types";

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

  const forwardActions: Middleware = () =>
    (next) =>
      (action: Actions) => {
        if (action.type in client) {
          client[action.type as ServerMessage["type"]](
            "payload" in action ? action.payload as any : undefined,
          );
        }

        if (action.type === "plexLogin") {
          plex.signIn();
        }

        if (action.type === "loginSuccess") {
          localStorage.setItem("userName", action.payload.userName!);
        }

        if (action.type === "logout") {
          localStorage.removeItem("userName");
          localStorage.removeItem("plexClientId");
          localStorage.removeItem("plexToken");
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
      type: "setLocale",
      payload: { language: navigator.language },
    });

    const existingLogin = await getExistingLogin();

    if (existingLogin) {
      dispatch({
        type: "login",
        payload: "token" in existingLogin
          ? {
            plexToken: existingLogin.token,
            plexClientId: existingLogin.clientId,
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
    dispatch((e as MessageEvent<ClientMessage>).data);
  });

  return store;
};
