import { Filters, LibraryType } from "/types/moviematch.ts";
import { PlexApi } from "/internal/app/plex/api.ts";
import {
  MovieMatchProvider,
} from "/internal/app/moviematch/providers/types.ts";
import { FieldType } from "/internal/app/plex/types/library_items.ts";

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
  const api = new PlexApi(options.url, options.token, options);

  return {
    options,
    isAvailable: () => api.isAvaliable(),
    isUserAuthorized: () => Promise.resolve(true),
    getName: () => api.getServerName(),
    getLibraries: () => Promise.resolve([]),
    getFilters: async () => {
      const meta = await api.getAllFilters();
      const availableTypes: LibraryType[] = ["movie", "show"];

      const filters = new Map<string, {
        title: string;
        key: string;
        type: string;
        libraryTypes: LibraryType[];
      }>();

      for (const type of meta.Type) {
        if (availableTypes.includes(type.type as LibraryType) && type.Filter) {
          for (const filter of type.Filter) {
            if (filters.has(filter.filter)) {
              const existing = filters.get(filter.filter);
              if (existing) {
                existing.libraryTypes.push(type.type as LibraryType);
              }
            } else {
              filters.set(filter.filter, {
                title: filter.title,
                key: filter.filter,
                type: filter.filterType,
                libraryTypes: [type.type as LibraryType],
              });
            }
          }
        }
      }

      const filterTypes = meta.FieldType.reduce(
        (acc, _: FieldType) => ({
          ...acc,
          [_.type]: _.Operator,
        }),
        {} as Filters["filterTypes"],
      );

      return {
        filters: [...filters.values()],
        filterTypes,
      };
    },
    getFilterValues: async (key: string) => {
      const filterValues = await api.getFilterValues(key);

      if (filterValues.size) {
        return filterValues.Directory.map((filterValue) => ({
          title: filterValue.title,
          value: filterValue.fastKey,
        }));
      }

      return [];
    },
    getArtwork: () => Promise.resolve(new Uint8Array()),
    getCanonicalUrl: (key: string) => api.getDeepLink(key),
  };
};
