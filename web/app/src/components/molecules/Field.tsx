import React, { ReactNode } from "react";
import styles from "./Field.module.css";
import { TextInput } from "../atoms/TextInput";

interface FieldProps {
  name: string;
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
    className={styles.field}
    style={paddingTop ? { marginTop: `var(--${paddingTop})` } : {}}
  >
    {label && (
      <label className={styles.label} htmlFor={`${name}-text-input`}>
        {label}
      </label>
    )}
    {children
      ? (
        children
      )
      : (
        <TextInput
          name={name}
          value={String(value)}
          autoComplete={autoComplete}
          onChange={onChange}
          onBlur={onBlur}
          paddingTop="s2"
        />
      )}
    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
  </div>
);
