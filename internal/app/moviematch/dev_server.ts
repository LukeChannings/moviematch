/**
 * Watches web app for changes and compiles the dist files
 */

import { getLogger } from "/internal/app/moviematch/logger.ts";

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
};

export const watchAndBuild = async () => {
  const watcher = Deno.watchFs(WEB_APP_PATH + "/src", { recursive: true });

  await build();

  for await (const event of watcher) {
    if (["create", "modify", "remove"].includes(event.kind)) {
      try {
        await build();
      } catch (err) {
        getLogger().error(err);
      }
    }
  }
};
