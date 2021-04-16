import { lookupMimeType, Response, ServerRequest } from "/deps.ts";
import { fileExists, readFile } from "pkger";
import { RouteHandler } from "/internal/app/moviematch/types.ts";

const isGzipped = (bytes: Uint8Array) => bytes[0] === 31 && bytes[1] === 139;

export const serveStatic = (rootPaths: string[]): RouteHandler =>
  async (req: ServerRequest): Promise<Response | void> => {
    let response: Response = {
      status: 404,
      body: `${req.url} was not found`,
      headers: new Headers([["content-type", "text/plain"]]),
    };

    for (const rootPath of rootPaths) {
      try {
        const path = rootPath + req.url;
        if (await fileExists(path)) {
          const file = await readFile(path);
          const headers = new Headers([
            ["content-type", lookupMimeType(path) ?? "text/plain"],
          ]);

          if (isGzipped(file)) {
            headers.append("content-encoding", "gzip");
          }

          response = {
            status: 200,
            body: file,
            headers,
          };
        }
      } catch (_err) {
        continue;
      }
    }

    return response;
  };

export const handler = serveStatic(["/web/app/build"]);
