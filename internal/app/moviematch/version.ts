import { readTextFile } from "pkger";

export const getVersion = async () => {
  const VERSION = await readTextFile("/VERSION");
  return VERSION;
};
