const { VERSION = "dev" } = process.env;

console.log(`Building version ${VERSION}`);

process.env.SNOWPACK_PUBLIC_BASE_PATH = "http://localhost:8000";

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  env: {
    VERSION,
    API_URI: VERSION === "dev" ? "ws://localhost:8000/api/ws" : undefined,
  },
  mount: {
    static: { url: "/", static: true },
    src: { url: "/dist" },
  },
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-typescript",
  ],
  optimize: {
    bundle: VERSION !== "dev",
    minify: true,
    treeshake: true,
    target: "es2018",
  },
  devOptions: {
    open: "none",
  },
};
