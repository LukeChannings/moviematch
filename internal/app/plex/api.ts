import { FilterValues } from "./types/library_filter_values.ts";
import { Capabilities } from "/internal/app/plex/types/capabilities.ts";
import { Identity } from "/internal/app/plex/types/identity.ts";
import { Libraries, Library } from "/internal/app/plex/types/libraries_list.ts";
import { LibraryItems, Meta } from "/internal/app/plex/types/library_items.ts";

type PlexMediaContainer<T> = { MediaContainer: T };

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
    { baseKey = "/", searchParams = {} }: {
      baseKey?: string;
      searchParams?: Record<string, string>;
      lang?: string;
    } = {},
  ): Promise<T> {
    const url = new URL(this.plexUrl.href);
    url.pathname = key.startsWith("/") ? key : baseKey + key;

    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }

    const req = await fetch(url.href, {
      headers: {
        accept: "application/json",
        "accept-language": this.options.language ?? "en",
      },
    });

    try {
      const data: PlexMediaContainer<T> = await req.json();

      return data.MediaContainer;
    } catch (err) {
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
      return sections.Directory;
    }
  }

  async getAllFilters(): Promise<Meta> {
    const libraries = await this.getLibraries();

    const results: Meta = { Type: [], FieldType: [] };

    for (const { key } of libraries) {
      const result = await this.fetch<LibraryItems>(
        `/library/sections/${key}/filters`,
        {
          searchParams: {
            "includeMeta": "1",
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

  getFilterValues(
    libraryKey: string,
    filterName: string,
  ): Promise<FilterValues> {
    return this.fetch<FilterValues>(
      `/library/sections/${libraryKey}/${filterName}`,
    );
  }

  getLibraryItems(
    key: string,
  ): Promise<LibraryItems> {
    return this.fetch<LibraryItems>(
      `/library/sections/${key}/all`,
    );
  }

  async getLibraryItemDetails(key: string) {
    return await this.fetch(key);
  }

  async getDeepLink(
    key: string,
    type: "plexTv" | "plexLocal" | "app" = "plexTv",
    metadataType?: "1",
  ): Promise<string> {
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

export const getAllMedia = () => [];
