import React, { InputHTMLAttributes } from "react";

import styles from "./Switch.module.css";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?(value: boolean): void;
  paddingTop?: "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";
}

export const Switch = ({
  checked,
  onChange,
  disabled,
  name,
}: SwitchProps) => (
  <input
    type="checkbox"
    checked={checked}
    disabled={disabled}
    className={styles.switch}
    name={name}
    onChange={(e) => {
      if (onChange) {
        onChange(e.currentTarget.checked);
      }
    }}
  />
);
