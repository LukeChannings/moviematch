import { ServerRequest } from "http/server.ts";
import { lookup } from "https://deno.land/x/media_types/mod.ts";
import { fileExists, readFile } from "pkger";

export const serveStatic = async (
  req: ServerRequest,
  basePaths: string[],
): Promise<void> => {
  for (const basePath of basePaths) {
    try {
      const path = basePath + req.url;
      if (await fileExists(path)) {
        const file = await readFile(path);
        await req.respond({
          status: 200,
          body: file,
          headers: new Headers([[
            "content-type",
            lookup(path) ?? "text/plain",
          ]]),
        });
      }
    } catch (err) {
      continue;
    }
  }

  req.respond({ status: 404 });
};
