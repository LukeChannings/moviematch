import React, { ReactNode } from "react";
import type { Color, Spacing } from "../types";
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
