import { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts";
import { extname } from "https://deno.land/std@0.69.0/path/mod.ts";

const MIME_TYPES = new Map<string, string>([
  [".svg", "image/svg+xml"],
  [".css", "text/css"],
  [".js", "application/javascript"],
  [".png", "image/png"],
]);

const getMimeType = (path: string): string =>
  MIME_TYPES.get(extname(path)) ?? "text/plain";

export const serveStatic = async (req: ServerRequest, basePaths: string[]) => {
  for (const basePath of basePaths) {
    try {
      const path =
        Deno.cwd() + new URL(`file://${basePath}${req.url}`).pathname;
      const stat = await Deno.stat(path);
      console.log(path);
      if (stat.isFile) {
        const file = await Deno.readFile(path);
        return req.respond({
          status: 200,
          body: file,
          headers: new Headers([["content-type", getMimeType(path)]]),
        });
      }
    } catch (err) {
      continue;
    }
  }

  req.respond({ status: 404 });
};
