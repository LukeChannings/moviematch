import React from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./Select.css";

interface SelectProps<Value extends string = string> {
  name: string;
  options: Record<Value, string>;
  value: Value;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
}

export const Select = (
  { name, value = "", options, onChange, onBlur }: SelectProps,
) => (
  <div className="Select">
    <select
      className="Select_Element"
      name={name}
      onChange={onChange}
      onBlur={onBlur}
    >
      <option value="">&mdash; Select &mdash;</option>
      {options && Object.entries(options).map(([optionValue, label]) => (
        <option
          value={optionValue}
          selected={optionValue === value}
          key={optionValue}
        >
          {label}
        </option>
      ))}
    </select>
  </div>
);
