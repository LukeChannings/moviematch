export const isRelease = false;

const useAbsolutePath = <T>(fn: (path: string) => T): ((path: string) => T) => {
  return (path: string) => fn(Deno.cwd() + path);
};

export const fileExists = async (path: string): Promise<boolean> => {
  try {
    const stat = await Deno.stat(Deno.cwd() + path);
    return stat.isFile;
  } catch (_) {
    return false;
  }
};

export const readFile = useAbsolutePath(Deno.readFile);

export const readTextFile = useAbsolutePath(Deno.readTextFile);

export const readDir = useAbsolutePath(Deno.readDir);
