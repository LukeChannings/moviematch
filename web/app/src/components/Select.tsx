import React from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./Select.css";

interface SelectProps<Value extends string = string> {
  name: string;
  options: Record<Value, string>;
  value: Value;
  onChange?: (value: Value) => void;
}

export const Select = ({ name, value, options, onChange }: SelectProps) => (
  <div className="Select">
    <select
      className="Select_Element"
      name={name}
      onChange={(e) => {
        if (onChange && e.target.value) {
          onChange(e.target.value);
        }
      }}
    >
      {Object.entries(options).map(([optionValue, label]) => (
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
