import React, { StrictMode, useCallback } from "react";
import { render } from "react-dom";

import "modern-css-reset/dist/reset.css";
import "./main.css";
import "./components/Screen";

import { LoginScreen } from "./screens/Login";
import { JoinScreen } from "./screens/Join";
import { CreateScreen } from "./screens/Create";
import { RateScreen } from "./screens/Rate";
import { MovieMatchContext, Routes, useStore } from "./store";
import type { ScreenProps } from "./components/Screen";
import { Loading } from "./screens/Loading";
import { ToastList } from "./components/Toast";
import { ConfigScreen } from "./screens/Config";

const MovieMatch = () => {
  const [store, dispatch] = useStore();
  const navigate = useCallback(async function navigate(route: Routes) {
    dispatch({ type: "navigate", payload: route });
  }, []);

  return (
    <MovieMatchContext.Provider value={store}>
      <>
        {(() => {
          const routes: Record<
            Routes["path"],
            (props: ScreenProps<any>) => JSX.Element
          > = {
            loading: Loading,
            login: LoginScreen,
            join: JoinScreen,
            createRoom: CreateScreen,
            rate: RateScreen,
            config: ConfigScreen,
          };
          const CurrentComponent = routes[store.route.path];
          return (
            <CurrentComponent
              navigate={navigate}
              dispatch={dispatch}
              params={"params" in store.route ? store.route.params : undefined}
              store={store}
            />
          );
        })()}
        <ToastList
          toasts={store.toasts}
          removeToast={(toast) =>
            dispatch({ type: "removeToast", payload: toast })
          }
        />
      </>
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
  document.querySelector("body")?.getBoundingClientRect().height
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
