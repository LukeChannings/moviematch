import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Color, Spacing } from "../types.ts";
import "./Button.css";

interface ButtonProps {
  appearance: "Primary" | "Secondary" | "Tertiary";
  children: ReactNode;
  paddingTop?: Spacing;
  onPress?(e: React.MouseEvent): void;
  disabled?: boolean;
  color?: Color;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

export const Button = ({
  children,
  onPress,
  appearance,
  paddingTop,
  disabled,
  color,
  type,
}: ButtonProps) => (
  <button
    className={`Button Button${appearance}`}
    style={{
      ...(paddingTop ? { marginTop: `var(--${paddingTop})` } : {}),
      ...(color ? { "--bg-color": `var(--mm-${color})` } : {}),
    }}
    onClick={onPress}
    type={type ?? "button"}
    disabled={disabled}
  >
    {children}
  </button>
);
