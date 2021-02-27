import { assert } from "util/assert.ts";
import { createProvider } from "/internal/app/moviematch/providers/plex.ts";

const TEST_PLEX_URL = Deno.env.get("TEST_PLEX_URL");
const TEST_PLEX_TOKEN = Deno.env.get("TEST_PLEX_TOKEN");

Deno.test("providers -> plex -> getFilters", async () => {
  const provider = createProvider("0", {
    url: TEST_PLEX_URL!,
    token: TEST_PLEX_TOKEN!,
  });

  const filters = await provider.getFilters();

  assert(!!filters);
});
