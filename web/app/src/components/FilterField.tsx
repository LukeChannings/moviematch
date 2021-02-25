import React, {
  useEffect,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Filter, Filters, FilterValue } from "../../../../types/moviematch.ts";
import { Select } from "./Select.tsx";

import "./FilterField.css";
import { AutoSuggestInput } from "./AutoSuggestInput.tsx";
import { useAsyncEffect } from "../hooks/useAsyncEffect.ts";

interface FilterFieldProps {
  filters: Filters;
  onChange: (filter: Filter | null) => void;
  getSuggestions: (key: string) => Promise<FilterValue[]>;
}

export const FilterField = (
  { onChange, filters, getSuggestions }: FilterFieldProps,
) => {
  const [key, setKey] = useState<string>("");
  const [operator, setOperator] = useState<string>("==");
  const [value, setValue] = useState<FilterValue[]>([]);
  const [suggestions, setSuggestions] = useState<FilterValue[]>([]);

  useAsyncEffect(async () => {
    if (key !== "") {
      const suggestions = await getSuggestions(key);
      setSuggestions(suggestions);
    }
  }, [key]);

  useEffect(() => {
    if (key && operator && value) {
      onChange({ key, operator, value: value.map((_) => _.value) });
    } else {
      onChange(null);
    }
  }, [key, operator, value]);

  return (
    <fieldset className="FilterField">
      <Select
        name="key"
        value={key}
        options={filters.filters.reduce(
          (acc, filter) => ({ ...acc, [filter.key]: filter.title }),
          {},
        )}
        onChange={(e) => setKey(e.target.value)}
      />
      {key && (
        <>
          <Select
            name="operator"
            value={operator}
            options={filters.filterTypes[
              filters.filters.find((_) => _.key === key)!.type
            ]?.reduce(
              (acc, filterType) => ({
                ...acc,
                [filterType.key]: filterType.title,
              }),
              {},
            )}
            onChange={(e) => setOperator(e.target.value)}
          />
          <AutoSuggestInput
            items={suggestions}
            onChange={setValue}
          />
        </>
      )}
    </fieldset>
  );
};
