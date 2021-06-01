/**
 * A generic interface that the Plex provider implements.
 *
 * The point of this is to:
 * - Keep the Plex API integration (/internal/app/plex) portable, so it can possibly be published separately and used by others
 * - Allow MovieMatch to have its own clean data structures, excluding some of the Plex weirdness (since it's converted from XML, it is not idiomatic)
 * - Allow the possibility of providers to MovieMatch that are not Plex (e.g. Emby). I don't plan on implementing it, but it allows others to integrate more easliy.
 * - Allow connecting to multiple providers of the same type, e.g. more than one Plex server
 */

import {
  Filter,
  Filters,
  FilterValue,
  Library,
  Media,
} from "/types/moviematch.ts";

export type MovieMatchProviderCtor = <T>(
  // this is a unique identifier for the provider
  // it could just be the index, or a hash of the provider options
  id: string,
  options: T,
) => MovieMatchProvider;

export interface MovieMatchProvider {
  options: { url: string };
  isAvailable(): Promise<boolean>;

  // determine if a user is authorized to access this particular server.
  isUserAuthorized(username: string): Promise<boolean>;

  getName(): Promise<string>;

  getLibraries(): Promise<Library[]>;

  getFilters(): Promise<Filters>;

  getFilterValues(
    key: string,
  ): Promise<FilterValue[]>;

  getArtwork(
    key: string,
    width: number,
  ): Promise<[ReadableStream<Uint8Array>, Headers]>;

  getCanonicalUrl(
    key: string,
    options?: { userAgent?: string | null },
  ): Promise<string>;

  getMedia(options: {
    filters?: Filter[];
  }): Promise<Media[]>;
}
