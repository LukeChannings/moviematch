const { networkInterfaces } = require("os");
const { VERSION = "dev" } = process.env;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  env: { VERSION },
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
    open: false,
  },
  buildOptions: {
    /* ... */
  },
};
