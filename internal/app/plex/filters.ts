import * as log from "log/mod.ts";
import { Filter } from "/types/moviematch.ts";

export const filterToQueryString = (
  { key, value, operator }: Filter,
): [key: string, value: string] => {
  log.debug(key, value, operator);
  return [key + operator.slice(0, -1), value.join(",")];
};
