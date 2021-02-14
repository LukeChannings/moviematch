import React from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./Switch.css";

interface SwitchProps {
  name: string;
  checked?: boolean;
  paddingTop?: "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";
  onChange?(value: string): void;
}

export const Switch = ({ paddingTop, checked }: SwitchProps) => (
  <input
    type="checkbox"
    className="Switch"
    checked={checked}
    style={{
      ...(paddingTop ? { marginTop: `var(--${paddingTop})` } : {}),
    }}
  />
);
