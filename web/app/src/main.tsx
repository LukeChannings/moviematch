import React, { StrictMode, useEffect } from "react";
import { render } from "react-dom";

import "./main.css";

import { LoginScreen } from "./components/screens/Login";
import { JoinScreen } from "./components/screens/Join";
import { CreateScreen } from "./components/screens/Create";
import { RoomScreen } from "./components/screens/Room";
import { Loading } from "./components/screens/Loading";
import { ToastList } from "./components/atoms/Toast";
import { ConfigScreen } from "./components/screens/Config";
import { useCreateStore } from "./store/useStore";
import type { Routes } from "./types";
import * as plex from "./api/plex_tv";

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

const MovieMatch = () => {
  const [store, dispatch, MovieMatchContext] = useCreateStore();

  useEffect(() => {
    if (store.connectionStatus === "connected") {
      dispatch({
        type: "setLocale",
        payload: { language: navigator.language },
      });

      getExistingLogin().then((existingLogin) => {
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
          dispatch({ type: "navigate", payload: "login" });
        }
      });
    }
  }, [store.connectionStatus]);

  return (
    <MovieMatchContext.Provider value={{ store, dispatch }}>
      {(() => {
        const routes: Record<
          Routes,
          () => JSX.Element
        > = {
          loading: Loading,
          login: LoginScreen,
          join: JoinScreen,
          createRoom: CreateScreen,
          room: RoomScreen,
          config: ConfigScreen,
        };
        const CurrentComponent = routes[store.route];

        if (!store.translations) {
          return <Loading />;
        }

        if (CurrentComponent) {
          return <CurrentComponent />;
        } else {
          return <p>No route for {store.route}</p>;
        }
      })()}
      <ToastList
        toasts={store.toasts}
        removeToast={(toast) =>
          dispatch({ type: "removeToast", payload: toast })}
      />
    </MovieMatchContext.Provider>
  );
};

render(
  <StrictMode>
    <MovieMatch />
  </StrictMode>,
  document.getElementById("app"),
);

if (
  window.innerHeight !==
    document.querySelector("body")?.getBoundingClientRect().height &&
  (!(navigator as unknown as Record<string, unknown>).standalone)
) {
  document.body.style.setProperty("--vh", window.innerHeight / 100 + "px");
  window.addEventListener("resize", () => {
    document.body.style.setProperty("--vh", window.innerHeight / 100 + "px");
  });
}

window.addEventListener("keyup", (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("show-focus-ring");
  }
});

window.addEventListener("mouseup", () => {
  document.body.classList.remove("show-focus-ring");
});
