import { Response, ServerRequest } from "http/server.ts";
import { lookup } from "https://deno.land/x/media_types/mod.ts";
import { fileExists, readFile } from "pkger";
import { RouteHandler } from "/internal/app/moviematch/types.ts";

export const serveStatic = (basePaths: string[]): RouteHandler =>
  async (req: ServerRequest): Promise<Response | void> => {
    let response: Response = {
      status: 404,
      body: `${req.url} was not found`,
      headers: new Headers([["content-type", "text/plain"]]),
    };

    for (const basePath of basePaths) {
      try {
        const path = basePath + req.url;
        if (await fileExists(path)) {
          const file = await readFile(path);
          response = {
            status: 200,
            body: file,
            headers: new Headers([[
              "content-type",
              lookup(path) ?? "text/plain",
            ]]),
          };
        }
      } catch (err) {
        continue;
      }
    }

    return response;
  };

export const handler = serveStatic(["/web/static", "/web/app/dist"]);
