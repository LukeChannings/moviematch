import { ServerRequest } from "https://deno.land/std@0.84.0/http/server.ts";
import { extname } from "https://deno.land/std@0.84.0/path/mod.ts";
import { fileExists, readFile } from "pkger";

const MIME_TYPES = new Map<string, string>([
  [".svg", "image/svg+xml"],
  [".css", "text/css"],
  [".js", "application/javascript"],
  [".png", "image/png"],
  [".json", "application/json"],
  [".webmanifest", "application/manifest+json"],
]);

const getMimeType = (path: string): string =>
  MIME_TYPES.get(extname(path)) ?? "text/plain";

export const serveStatic = async (req: ServerRequest, basePaths: string[]) => {
  for (const basePath of basePaths) {
    try {
      const path = basePath + req.url;
      if (await fileExists(path)) {
        const file = await readFile(path);
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
