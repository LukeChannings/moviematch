const { networkInterfaces } = require("os");
const { VERSION = "dev" } = process.env;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  env: {
    API_URI: VERSION === "dev"
      ? `http://${
        networkInterfaces().en0.find((_) => _.family === "IPv4").address
      }:8000`
      : undefined,
    VERSION,
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
  routes: [
    /* Enable an SPA Fallback in development: */
    // {"match": "routes", "src": ".*", "dest": "/index.html"},
  ],
  optimize: {
    bundle: true,
    minify: true,
    treeshake: true,
    target: "es2018",
  },
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
