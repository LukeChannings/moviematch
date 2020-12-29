import React from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Color, Spacing } from "../types.ts";
import "./Button.css";

interface ButtonProps {
  appearance: "primary" | "secondary";
  children: string;
  paddingTop?: Spacing;
  onPress?(): void;
  disabled?: boolean;
  color?: Color;
}

export const Button = ({
  children,
  onPress,
  appearance,
  paddingTop,
  disabled,
  color,
}: ButtonProps) => (
  <button
    className={`Button ${
      appearance === "primary" ? "ButtonPrimary" : "ButtonSecondary"
    }`}
    style={{
      ...(paddingTop ? { marginTop: `var(--${paddingTop})` } : {}),
      ...(color ? { "--bg-color": `var(--mm-${color})` } : {}),
    }}
    onClick={onPress}
    disabled={disabled}
  >
    {children}
  </button>
);
