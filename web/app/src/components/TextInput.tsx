import React from "react";

import "./TextInput.css";

interface TextInputProps {
  name: string;
  value?: string;
  paddingTop?: "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";
  autoComplete?: string;
  invalid?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  testHandle?: string;
}

export const TextInput = ({
  value,
  name,
  autoComplete,
  invalid,
  onChange,
  onBlur,
  paddingTop,
  testHandle,
}: TextInputProps) => (
  <input
    className={`TextInput ${invalid ? "--invalid" : ""}`}
    style={{
      ...(paddingTop ? { marginTop: `var(--${paddingTop})` } : {}),
    }}
    type="text"
    name={name}
    id={`${name}-text-input`}
    value={value}
    autoComplete={autoComplete ?? "off"}
    autoCorrect="off"
    onChange={onChange}
    onBlur={onBlur}
    data-test-handle={testHandle ?? `${name}-text-input`}
  />
);
