import { requestEnv } from "/internal/app/moviematch/util/permission.ts";

export const getEnv = async (name: string): Promise<string | undefined> => {
  if (await requestEnv()) {
    return Deno.env.get(name);
  }
};
