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

import { join } from "https://deno.land/std@0.86.0/path/mod.ts";
import { walk } from "https://deno.land/std@0.86.0/fs/walk.ts";

const pkg = new Map<string, Uint8Array>();

for (const path of Deno.args) {
  const fullPath = join(Deno.cwd(), path);

  const stat = await Deno.stat(fullPath);

  if (stat.isDirectory) {
    for await (const entry of walk(fullPath, { includeDirs: false })) {
      const data = await Deno.readFile(entry.path);
      const path = entry.path.replace(Deno.cwd(), "").replace(/\\/g, "/");
      pkg.set(path, data);
      console.log(path);
    }
  } else if (stat.isFile) {
    const data = await Deno.readFile(fullPath);
    const path = fullPath.replace(Deno.cwd(), "").replace(/\\/g, "/");
    pkg.set(path, data);
    console.log(path);
  }
}

let out = "export const pkg = new Map<string, Uint8Array>([\n";

for (const [path, data] of pkg.entries()) {
  out += `  ["${path}", new Uint8Array([${String(data)}])],\n`;
}

out += "])";

const encoder = new TextEncoder();

Deno.writeFile("internal/pkg.ts", encoder.encode(out));
