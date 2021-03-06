import React, { useCallback } from "https://cdn.skypack.dev/react@17.0.1?dts";
import { render } from "https://cdn.skypack.dev/react-dom@17.0.1?dts";

import "./main.css";

import "./components/Screen.ts";

import { LoginScreen } from "./screens/Login.tsx";
import { JoinScreen } from "./screens/Join.tsx";
import { CreateScreen } from "./screens/Create.tsx";
import { RateScreen } from "./screens/Rate.tsx";
import { MovieMatchContext, Routes, useStore } from "./store.ts";
import { ScreenProps } from "./components/Screen.ts";
import { Loading } from "./screens/Loading.tsx";
import { ToastList } from "./components/Toast.tsx";
import { ConfigScreen } from "./screens/Config.tsx";

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
            dispatch({ type: "removeToast", payload: toast })}
        />
      </>
    </MovieMatchContext.Provider>
  );
};

render(<MovieMatch />, document.getElementById("app"));

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
