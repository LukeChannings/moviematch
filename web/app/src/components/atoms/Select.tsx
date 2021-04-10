import React from "react";

import styles from "./Select.module.css";

interface SelectProps<Value extends string = string> {
  name: string;
  options: Record<Value, string>;
  value: Value;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
}

export const Select = ({
  name,
  value = "",
  options,
  onChange,
  onBlur,
}: SelectProps) => (
  <div className={styles.selectWrapper}>
    <select
      className={styles.select}
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      data-test-handle={`${name}-select-input`}
    >
      <option value="">&mdash; Select &mdash;</option>
      {options &&
        Object.entries(options).map(([optionValue, label]) => (
          <option
            value={optionValue}
            key={optionValue}
          >
            {label}
          </option>
        ))}
    </select>
  </div>
);
