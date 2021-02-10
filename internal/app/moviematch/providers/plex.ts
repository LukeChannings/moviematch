import { PlexApi } from "/internal/app/plex/api.ts";
import { MovieMatchProvider } from "/internal/app/moviematch/providers/types.d.ts";

export interface PlexProviderConfig {
  url: string;
  token: string;
  libraryTitleFilter?: string[];
  libraryTypeFilter?: string[];
  linkType?: "app" | "webLocal" | "webExternal";
}

export const createProvider = (
  options: PlexProviderConfig,
): MovieMatchProvider => {
  const api = new PlexApi(options.url, options.token);

  return {
    options,
    isAvailable: () => api.isAvaliable(),
    isUserAuthorized: async () => true,
    getName: () => api.getServerName(),
    getLibraries: async () => {
      return [];
    },
    getFilterOptions: async () => [],
    getArtwork: async () => {
      return new Uint8Array();
    },
    getCanonicalUrl: async (key: string) => api.getDeepLink(key),
  };
};
