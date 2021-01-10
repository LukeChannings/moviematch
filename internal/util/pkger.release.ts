import { pkg } from "/pkg.ts";

export const isRelease = true;

export const fileExists = async (path: string): Promise<boolean> =>
  pkg.has(path);

export const readFile = async (path: string): Promise<Uint8Array> =>
  pkg.get(path)!;

export const readTextFile = async (path: string): Promise<string> => {
  const data = await readFile(path);
  const textDecoder = new TextDecoder();
  return textDecoder.decode(data);
};

export const readDir = (path: string): AsyncIterable<Deno.DirEntry> => {
  const files = [...pkg.keys()].filter((name) => name.startsWith(path));
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
