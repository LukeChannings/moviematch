import React, { StrictMode } from "react";
import { render } from "react-dom";
import { Provider, useDispatch } from "react-redux";

import "./main.css";

import { LoginScreen } from "./components/screens/Login";
import { JoinScreen } from "./components/screens/Join";
import { CreateScreen } from "./components/screens/Create";
import { RoomScreen } from "./components/screens/Room";
import { Loading } from "./components/screens/Loading";
import { ToastList } from "./components/atoms/Toast";
import { ConfigScreen } from "./components/screens/Config";
import type { Routes } from "./types";
import { createStore, Dispatch, useSelector } from "./store";

const store = createStore();

const MovieMatch = () => {
  const { route = "loading", translations, toasts } = useSelector([
    "route",
    "translations",
    "toasts",
  ]);

  const dispatch = useDispatch<Dispatch>();

  return (
    <>
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
        const CurrentComponent = routes[route];

        if (!translations) {
          return <Loading />;
        }

        if (CurrentComponent) {
          return <CurrentComponent />;
        } else {
          return <p>No route for {route}</p>;
        }
      })()}
      <ToastList
        toasts={toasts}
        removeToast={(toast) =>
          dispatch({ type: "removeToast", payload: toast })}
      />
    </>
  );
};

render(
  <StrictMode>
    <Provider store={store}>
      <MovieMatch />
    </Provider>
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
