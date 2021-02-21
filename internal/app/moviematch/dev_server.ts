/**
 * Watches web app for changes and compiles the dist files
 */
import * as log from "log/mod.ts";

const WEB_APP_PATH = Deno.cwd() + "/web/app";

const build = async () => {
  const p = Deno.run({
    cmd: [
      "esbuild",
      "src/main.tsx",
      "--bundle",
      `--outdir=dist`,
      "--format=esm",
      "--sourcemap=inline",
      "--target=es2019",
    ],
    cwd: WEB_APP_PATH,
  });

  await p.status();
  p.close();
  return p;
};

export const watchAndBuild = async () => {
  const watcher = Deno.watchFs(WEB_APP_PATH + "/src", { recursive: true });

  try {
    await build();
  } catch (err) {
    if (err.name === "NotFound") {
      log.critical(
        `esbuild must be installed to compile the front end code.\nhttps://esbuild.github.io/getting-started/#install-esbuild`,
      );
    } else {
      log.critical(err);
    }

    Deno.exit(1);
  }

  for await (const event of watcher) {
    if (["create", "modify", "remove"].includes(event.kind)) {
      try {
        await build();
      } catch (err) {
        log.error(err);
      }
    }
  }
};
