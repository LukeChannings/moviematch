import { base64 } from "/deps.ts";
// ts-ignore
import { pkg } from "/build/pkg.ts";

export const isRelease = true;

export const fileExists = (path: string): boolean => !!pkg[path];

export const readFile = (path: string): Uint8Array => {
  const value = pkg[path];
  if (typeof value !== "string") {
    throw new Error(`${path} not found`);
  }

  return base64.toUint8Array(value);
};

export const readTextFile = (path: string): string => {
  const data = readFile(path);
  const textDecoder = new TextDecoder();
  return textDecoder.decode(data);
};

export const readDir = (path: string): AsyncIterable<Deno.DirEntry> => {
  const files = Object.keys(pkg).filter((name) => name.startsWith(path));
  return {
    async *[Symbol.asyncIterator]() {
      for (const match of files) {
        yield {
          name: match.replace(path + "/", ""),
          isFile: true,
          isDirectory: false,
          isSymlink: false,
        };
      }
    },
  };
};
