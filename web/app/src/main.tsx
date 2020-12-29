import React, { createContext } from "https://cdn.skypack.dev/react@17.0.1?dts";
import { render } from "https://cdn.skypack.dev/react-dom@17.0.1?dts";

import "./main.css";

import { Spinner } from "./components/Spinner.tsx";

import { LoginScreen } from "./screens/Login.tsx";
import { JoinScreen } from "./screens/Join.tsx";
import { CreateScreen } from "./screens/Create.tsx";
import { RateScreen } from "./screens/Rate.tsx";
import { MovieMatchContext, useStore } from "./state.ts";

const MovieMatch = () => {
  const [store, dispatch] = useStore();

  if (!store.config) {
    return (
      <section className="Screen">
        <Spinner />
      </section>
    );
  }

  return (
    <MovieMatchContext.Provider value={store}>
      {(() => {
        switch (store.activeScreen) {
          case "login":
            return (
              <LoginScreen
                handleDone={() => {
                  dispatch({ type: "setScreen", payload: "join" });
                }}
              />
            );
          case "join":
            return (
              <JoinScreen
                handleDone={() => {
                  dispatch({ type: "setScreen", payload: "rate" });
                }}
              />
            );
          case "createRoom":
            return <CreateScreen />;
          case "rate":
            return <RateScreen />;
        }
      })()}
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
