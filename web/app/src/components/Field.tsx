import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Field.css";

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
    <input
      className="Field_Input"
      type="text"
      name={name}
      id={`${name}-text-input`}
      value={value}
      autoComplete={autoComplete ?? "off"}
      autoCorrect="off"
      onChange={(e) => {
        if (typeof onChange === "function") {
          onChange(e.target.value);
        }
      }}
    />
    {errorMessage && <p className="Field_Error">{errorMessage}</p>}
  </div>
);
