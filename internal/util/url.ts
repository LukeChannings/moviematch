export const urlFromReqUrl = (url: string): URL =>
  new URL(`http://moviematch` + url);

export const updatePath = (url: URL, pathname: string) => {
  const urlCopy = new URL(url.href);
  urlCopy.pathname = pathname;
  return urlCopy;
};

export const updateSearch = (url: URL, search: Record<string, string>): URL => {
  const urlCopy = new URL(url.href);
  urlCopy.search = String(
    new URLSearchParams({
      ...Object.fromEntries(url.searchParams.entries()),
      ...search,
    }),
  );
  return urlCopy;
};
