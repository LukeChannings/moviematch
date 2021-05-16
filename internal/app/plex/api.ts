import { log } from "/deps.ts";
import type {
  FilterValue,
  FilterValues,
} from "./types/library_filter_values.ts";
import { requestNet } from "/internal/app/moviematch/util/permission.ts";
import { Capabilities } from "/internal/app/plex/types/capabilities.ts";
import { Identity } from "/internal/app/plex/types/identity.ts";
import { PlexMediaContainer } from "/internal/app/plex/types/common.ts";
import { Libraries, Library } from "/internal/app/plex/types/libraries_list.ts";
import { LibraryItems, Meta } from "/internal/app/plex/types/library_items.ts";

export interface PlexApiOptions {
  language?: string;
  libraryTitleFilter?: string[];
  libraryTypeFilter?: string[];
  linkType?: "app" | "webLocal" | "webExternal";
}

export class PlexApi {
  plexUrl: URL;
  options: PlexApiOptions;

  constructor(plexUrl: string, plexToken: string, options: PlexApiOptions) {
    this.plexUrl = new URL(plexUrl);
    this.plexUrl.searchParams.set("X-Plex-Token", plexToken);
    this.options = options;
  }

  private async fetch<T>(
    key: string,
    { searchParams = {} }: {
      searchParams?: Record<string, string>;
    } = {},
  ): Promise<T> {
    const url = new URL(this.plexUrl.href);
    url.pathname = (url.pathname + key).replace(/\/+/g, "/");

    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }

    if (!await requestNet(url.host)) {
      log.critical(`Permission was denied to ${url.href}. Cannot continue!`);
      Deno.exit(1);
    }

    log.debug(`Fetching: ${url.href}`);

    const req = await fetch(url.href, {
      headers: {
        accept: "application/json",
        "accept-language": this.options.language ?? "en",
      },
    });

    try {
      const data: PlexMediaContainer<T> = await req.json();

      return data.MediaContainer;
    } catch (_err) {
      throw new Error(url.href);
    }
  }

  async isAvaliable(): Promise<boolean> {
    return !!(await this.getCapabilities()).size;
  }

  getIdentity(): Promise<Identity> {
    return this.fetch<Identity>("/identity");
  }

  getCapabilities(): Promise<Capabilities> {
    return this.fetch<Capabilities>("/");
  }

  async getServerVersion(): Promise<
    {
      fullVersion: string;
      major: number;
      minor: number;
      patch: number;
      build: number;
      meta: string;
      hash: string;
    }
  > {
    const fullVersion = (await this.getIdentity()).version;
    const [major, minor, patch, meta] = fullVersion.split(".");
    const [build, hash] = meta.split("-");

    return {
      fullVersion,
      major: Number(major),
      minor: Number(minor),
      patch: Number(patch),
      build: Number(build),
      meta,
      hash,
    };
  }

  async getServerName(): Promise<string> {
    return (await this.getCapabilities()).friendlyName;
  }

  async getServerId(): Promise<string> {
    return (await this.getIdentity()).machineIdentifier;
  }

  async getServerOwner(): Promise<string> {
    const { myPlex, myPlexSigninState, myPlexUsername } = await this
      .getCapabilities();
    if (!myPlex || myPlexSigninState !== "ok") {
      throw new Error(`This Plex server doesn't have a logged in owner.`);
    }
    return myPlexUsername;
  }

  async getLibraries(): Promise<Library[]> {
    const sections = await this.fetch<Libraries>("/library/sections");
    if (sections.size === 0) {
      return [];
    } else {
      let filteredLibraries = sections.Directory;

      if (this.options.libraryTypeFilter?.length) {
        filteredLibraries = filteredLibraries.filter(({ type }) =>
          this.options.libraryTypeFilter!.includes(type)
        );
      }

      if (this.options.libraryTitleFilter?.length) {
        filteredLibraries = filteredLibraries.filter(({ title }) =>
          this.options.libraryTitleFilter!.includes(title)
        );
      }
      return filteredLibraries;
    }
  }

  async getAllFilters(): Promise<Meta> {
    const libraries = await this.getLibraries();

    const results: Meta = { Type: [], FieldType: [] };

    for (const { key } of libraries) {
      const result = await this.fetch<LibraryItems>(
        `/library/sections/${key}/all`,
        {
          searchParams: {
            "type": "1",
            "includeMeta": "1",
            "includeAdvanced": "1",
            "includeCollections": "1",
            "includeExternalMedia": "0",
          },
        },
      );

      if (result.Meta) {
        if (!results.FieldType.length && result.Meta.FieldType.length) {
          results.FieldType = result.Meta.FieldType;
        }
        results.Type.push(...result.Meta.Type);
      }
    }

    return results;
  }

  async getFilterValues(
    key: string,
  ): Promise<FilterValues> {
    if (key.includes("/")) {
      return this.fetch<FilterValues>(
        `/library/sections/${key}`,
      );
    } else {
      const libraries = await this.getLibraries();

      const filterValueList: FilterValue[] = [];
      let filterValues: FilterValues;

      for (const { key: libraryKey } of libraries) {
        const path = `/library/sections/${libraryKey}/${key}`;
        filterValues = await this.fetch<FilterValues>(path);

        log.debug(`got ${filterValues.size} values from ${path}`);

        if (filterValues.size > 0) {
          for (const filterValue of filterValues.Directory) {
            filterValueList.push(filterValue);
          }
        }
      }

      filterValues!.Directory = filterValueList;
      filterValues!.size = filterValueList.length;
      return filterValues!;
    }
  }

  getLibraryItems(
    key: string,
    { filters }: { filters?: Record<string, string> } = {},
  ): Promise<LibraryItems> {
    return this.fetch<LibraryItems>(
      `/library/sections/${key}/all`,
      {
        searchParams: filters,
      },
    );
  }

  async getLibraryItemDetails(key: string) {
    return await this.fetch(key);
  }

  async transcodePhoto(
    key: string,
    options: PlexTranscodeOptions,
  ): Promise<[ReadableStream, Headers]> {
    const url = new URL(this.plexUrl.href);
    url.pathname = `/photo/:/transcode`;

    const [metadataId, thumbId] = key.split("/");

    url.searchParams.append(
      "url",
      `/library/metadata/${metadataId}/thumb/${thumbId}`,
    );

    for (
      const [key, value] of Object.entries({
        upscale: "1",
        minSize: "1",
        width: 480,
        height: (options.width ?? 720) * 1.5,
        ...options,
      })
    ) {
      url.searchParams.append(
        key,
        String(typeof value === "boolean" ? +value : value),
      );
    }

    const response = await fetch(url.href);

    if (response.ok && response.body) {
      return [response.body, response.headers];
    } else {
      throw new Error(`${response.status}: ${await response.text()}`);
    }
  }

  async getDeepLink(
    key: string,
    options?: PlexDeepLinkOptions,
  ): Promise<string> {
    const { type = "plexTv", metadataType = "1" } = options ?? {};
    const serverId = await this.getServerId();

    if (type === "app") {
      return `plex://preplay/?metadataKey=${
        encodeURIComponent(key)
      }&metadataType=${metadataType}&server=${serverId}`;
    }

    const url = new URL(
      type === "plexTv" ? "https://app.plex.tv/desktop" : this.plexUrl.origin,
    );
    url.hash = `!/server/${serverId}/details?key=${encodeURIComponent(key)}`;

    return `https://app.plex.tv/desktop#!/server/${serverId}/details?key=${
      encodeURIComponent(key)
    }`;
  }
}

export interface PlexDeepLinkOptions {
  type: "plexTv" | "plexLocal" | "app";
  metadataType?: string;
}

interface PlexTranscodeOptions {
  width?: number;
  height?: number;
  minSize?: boolean;
  upscale?: boolean;
}
