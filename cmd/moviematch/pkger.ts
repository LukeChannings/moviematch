// deno run cmd/moviematch/pkger.ts <paths...>
//
// pkger is a utility that walks a set of paths and generates
// a pkged.ts module containing a Map of <path: string, data: Uint8Array>
// where each entry in the map is a file in the paths
//
// In production, we'd like to have a single bundle containing all
// of MovieMatch's resources (including compiled web assets, translations, etc)
// this way we can use `deno compile` to create a standalone binary for MovieMatch
//
// In the future, this module can be removed in favour of Import Assertions (https://github.com/denoland/deno/issues/7623)
// but that may take a long time.
//
// This module is a quickly hacked together bundler reminiscent of Golang's pkger - https://github.com/markbates/pkger

import { base64, extname, gzip, resolvePath, walk } from "/deps.ts";

const pkg: Record<string, string> = {};

const EXTENSIONS_TO_COMPRESS = [
  ".css",
  ".js",
  ".map",
  ".png",
  ".svg",
  ".ico",
  ".webmanifest",
];

const bundleFile = async (
  fileName: string,
): Promise<[path: string, data: string]> => {
  let rawData = await Deno.readFile(fileName);

  if (EXTENSIONS_TO_COMPRESS.includes(extname(fileName))) {
    // Deno doesn't yet have native support for zlib,
    // so I'm preferring to compress what I can upfront.
    rawData = gzip(rawData);
  }

  const data = base64.fromUint8Array(rawData);

  const path = fileName.replace(Deno.cwd(), "").replace(/\\/g, "/");
  return [path, data];
};

for (const path of Deno.args) {
  const fullPath = resolvePath(path);

  try {
    const stat = await Deno.stat(fullPath);

    if (stat.isDirectory) {
      for await (const entry of walk(fullPath, { includeDirs: false })) {
        const [finalPath, data] = await bundleFile(entry.path);
        pkg[finalPath] = data;
      }
    } else if (stat.isFile) {
      const [finalPath, data] = await bundleFile(fullPath);
      pkg[finalPath] = data;
    }
  } catch (err) {
    console.error(`${fullPath}: ${String(err)}`);
    Deno.exit(1);
  }
}

console.log(
  `export const pkg: Record<string, string> = ${JSON.stringify(pkg)}`,
);
