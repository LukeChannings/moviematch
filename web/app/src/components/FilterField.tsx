import React, {
  useEffect,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Field } from "./Field.tsx";
import { Select } from "./Select.tsx";

import "./FilterField.css";
import { Filter } from "../../../../types/moviematch.d.ts";

const keys = {
  title: "Title",
  studio: "Studio",
  userRating: "Rating",
  contentRating: "Content Rating",
  year: "Year",
  decade: "Decade",
  originallyAvailableAt: "Release Date",
  unmatched: "Unmatched",
  duplicate: "Duplicate",
  genre: "Genre",
  collection: "Collection",
  director: "Director",
  writer: "Writer",
  producer: "Producer",
  actor: "Actor",
  country: "Country",
  addedAt: "Date Added",
  viewCount: "Plays",
  lastViewedAt: "Last Played",
  unwatched: "Unplayed",
  resolution: "Resolution",
  hdr: "HDR",
  label: "Label",
  rating: "Rating",
};

const operators = {
  equal: "is",
  notEqual: "isn't",
  lessThan: "at least",
  greaterThan: "at most",
};

interface FilterFieldProps {
  onChange: (filter: Filter) => void;
}

export const FilterField = ({ onChange }: FilterFieldProps) => {
  const [key, setKey] = useState<string>("genre");
  const [operator, setOperator] = useState<string>("equal");
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (typeof onChange === "function") {
      onChange({
        key,
        operator: operator as keyof typeof operators,
        value,
      });
    }
  }, [key, operator, value]);

  return (
    <fieldset className="FilterField">
      <Select name="key" value={key} options={keys} onChange={setKey} />
      <Select
        name="operator"
        value={operator}
        options={operators}
        onChange={setOperator}
      />
      <Field name="value" value={value} onChange={setValue} />
    </fieldset>
  );
};
