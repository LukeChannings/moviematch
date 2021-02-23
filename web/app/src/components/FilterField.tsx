import React, {
  useEffect,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Filter, Filters } from "../../../../types/moviematch.ts";
import { Select } from "./Select.tsx";
import { TextInput } from "./TextInput.tsx";

import "./FilterField.css";

interface FilterFieldProps {
  filters: Filters;
  onChange: (filter: Filter) => void;
}

export const FilterField = ({ onChange, filters }: FilterFieldProps) => {
  const [key, setKey] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    console.log(filters);
  }, []);

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
          <TextInput
            name="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </>
      )}
    </fieldset>
  );
};
