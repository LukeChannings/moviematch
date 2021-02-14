import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Field.css";
import { TextInput } from "./TextInput.tsx";

interface FieldProps {
  name?: string;
  value?: string | number | undefined;
  label?: ReactNode;
  paddingTop?: "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  errorMessage?: ReactNode;
  autoComplete?: string;
  children?: ReactNode;
}

export const Field = ({
  children,
  label,
  name,
  value,
  paddingTop,
  onChange,
  onBlur,
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
    {children ? children : <TextInput
      name={name!}
      value={String(value)}
      autoComplete={autoComplete}
      onChange={onChange}
      onBlur={onBlur}
      paddingTop="s2"
    />}
    {errorMessage && <p className="Field_Error">{errorMessage}</p>}
  </div>
);
