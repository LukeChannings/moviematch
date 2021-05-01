const os = require("os");
const proxy = require("http2-proxy");
const { VERSION = "dev" } = process.env;

console.log(`Building version ${VERSION}`);

const ip = Object.values(os.networkInterfaces())
  .flat()
  .find(
    (_) => _.family == "IPv4" && !_.internal && _.address.startsWith("192"),
  ) ?? {};

process.env.SNOWPACK_PUBLIC_ROOT_PATH = `http://${ip.address ??
  "localhost"}:8000`;

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mode: VERSION === "dev" ? "development" : "production",
  env: {
    VERSION,
    API_URI: VERSION === "dev"
      ? `ws://${ip.address ?? "localhost"}:8000/api/ws`
      : undefined,
  },
  mount: {
    static: { url: "/", static: true },
    src: { url: "/dist" },
  },
  routes: [
    {
      src: "/api/.*",
      dest: (req, res) => {
        return proxy.web(req, res, {
          hostname: "localhost",
          port: 8000,
        });
      },
    },
  ],
  plugins: [
    "@snowpack/plugin-react-refresh",
    "@snowpack/plugin-dotenv",
    "@snowpack/plugin-typescript",
  ],
  optimize: {
    bundle: false,
    minify: false,
    treeshake: true,
    target: "es2018",
  },
  buildOptions: {
    clean: true,
  },
  devOptions: {
    open: "none",
  },
};
