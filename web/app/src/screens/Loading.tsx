import React from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Layout } from "../components/Layout.tsx";
import { Spinner } from "../components/Spinner.tsx";

export const Loading = () => (
  <Layout>
    <Spinner />
  </Layout>
);
