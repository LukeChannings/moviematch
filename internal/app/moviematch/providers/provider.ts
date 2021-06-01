// This is the primary entrypoint for working with Providers.
// This is very Plex specific, but structured so that
// adding a provider won't require a ton of work.
import { MovieMatchProvider } from "./_types.ts";
import {
  createProvider as createPlexProvider,
  PlexProviderConfig,
} from "./_plex.ts";

export type { MovieMatchProvider };

export const createProvider = (
  id: string,
  providerOptions: PlexProviderConfig,
): MovieMatchProvider => {
  return createPlexProvider(id, providerOptions);
};
