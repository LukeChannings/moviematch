import React from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Layout } from "../components/Layout.tsx";
import { ScreenProps } from "../components/Screen.ts";

import "./Config.css";

export const ConfigScreen = ({
  navigate,
  dispatch,
}: ScreenProps<{ roomName: string }>) => {
  return (
    <Layout>
      <p>CONFIG</p>
    </Layout>
  );
};
