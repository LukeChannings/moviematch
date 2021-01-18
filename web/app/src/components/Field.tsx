import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Field.css";
import { TextInput } from "./TextInput.tsx";

interface FieldProps {
  name: string;
  value?: string;
  label?: ReactNode;
  paddingTop?: "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";
  onChange?(value: string): void;
  errorMessage?: ReactNode;
  autoComplete?: string;
}

export const Field = ({
  label,
  name,
  value,
  paddingTop,
  onChange,
  errorMessage,
  autoComplete,
}: FieldProps) => (
  <div
    className={`Field ${errorMessage ? "--invalid" : ""}`}
    style={paddingTop ? { marginTop: `var(--${paddingTop})` } : {}}
  >
    {label && (
      <label className="Field_Label" htmlFor={`${name}-text-input`}>
        {label}
      </label>
    )}
    <TextInput
      name={name}
      value={value}
      autoComplete={autoComplete}
      onChange={(newValue) => {
        if (typeof onChange === "function") {
          onChange(newValue);
        }
      }}
      paddingTop="s2"
    />
    {errorMessage && <p className="Field_Error">{errorMessage}</p>}
  </div>
);
