const proxy = require("http2-proxy");
const { VERSION = "dev" } = process.env;

console.log(`Building version ${VERSION}`);

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mode: VERSION === "dev" ? "development" : "production",
  env: {
    VERSION,
  },
  mount: {
    static: { url: "/", static: true },
    src: { url: "/dist" },
  },
  routes: [
    {
      src: "/api/ws",
      upgrade: (req, socket, head) => {
        const defaultWSHandler = (err, _req, socket, _head) => {
          if (err) {
            if (err.code !== "ECONNRESET") {
              console.error("proxy error", err);
            }
            socket.destroy();
          }
        };

        proxy.ws(
          req,
          socket,
          head,
          {
            hostname: "localhost",
            port: 8000,
          },
          defaultWSHandler,
        );
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
