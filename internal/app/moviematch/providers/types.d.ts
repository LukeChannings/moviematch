/**
 * A generic interface that the Plex provider implements.
 * 
 * The point of this is to:
 * - Keep the Plex API integration (/internal/app/plex) portable, so it can possibly be published separately and used by others
 * - Allow MovieMatch to have its own clean data structures, excluding some of the Plex weirdness (since it's converted from XML, it is not idiomatic)
 * - Allow the possibility of providers to MovieMatch that are not Plex (e.g. Emby). I don't plan on implementing it, but it allows others to integrate more easliy.
 * - Allow connecting to multiple providers of the same type, e.g. more than one Plex server
 */

export interface MovieMatchProvider {
  options: { url: string };
  isAvailable(): Promise<boolean>;

  // determine if a user is authorized to access this particular server.
  isUserAuthorized(username: string): Promise<boolean>;

  getName(): Promise<string>;

  getLibraries(): Promise<MovieMatchLibrary[]>;

  // this will return the available values for a given filter
  // e.g. if the key is 'Genre', the options might be ['Comedy', 'Drama', etc]
  getFilterOptions(key: string): Promise<string[]>;

  getArtwork(key: string, width: number): Promise<Uint8Array>;

  getCanonicalUrl(key: string): Promise<string>;
}

type MovieMatchLibraryName = string;

interface MovieMatchLibrary {
  name: MovieMatchLibraryName;
  type: "show" | "movie" | "music" | "photo";
  filters: MovieMatchFilter[];
}

interface MovieMatchFilter {
  availability: MovieMatchLibraryName[];
}
