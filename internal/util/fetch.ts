import { join } from "https://deno.land/std@0.83.0/path/mod.ts";
import { getLogger } from "/internal/app/moviematch/logger.ts";
import { getConfig } from "/internal/app/moviematch/config.ts";

// Intercept fetch calls for offline usage and tests.
export const fetch = async (
  input: string | Request | URL,
  init?: RequestInit | undefined,
): Promise<Response> => {
  if (getConfig().useTestFixtures) {
    let fixtureName: string;
    if (input instanceof Request) {
      fixtureName = new URL(input.url).pathname;
    } else if (input instanceof URL) {
      fixtureName = input.pathname;
    } else {
      fixtureName = new URL(input).pathname;
    }

    fixtureName = fixtureName.replaceAll(/\//g, "-").replace(/^-/, "") +
      ".json";
    const fixturePath = join(Deno.cwd(), "/fixtures", fixtureName);

    try {
      const data = await Deno.readTextFile(fixturePath);
      getLogger().error(`Found fixture for ${fixtureName}`);
      return new Response(data, { status: 200, statusText: "OK" });
    } catch (err) {
      getLogger().error(`No fixture for "${fixtureName}"`);
      return new Response("", { status: 404, statusText: "Not Found" });
    }
  }

  return globalThis.fetch(input, init);
};
