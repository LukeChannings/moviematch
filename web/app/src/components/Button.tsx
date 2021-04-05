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
  highlightColor?: Color;
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  testHandle?: string;
}

export const Button = ({
  children,
  onPress,
  appearance,
  paddingTop,
  disabled,
  color,
  highlightColor,
  type,
  testHandle
}: ButtonProps) => (
  <button
    className={`Button Button${appearance}`}
    style={{
      ...(paddingTop ? { marginTop: `var(--${paddingTop})` } : {}),
      ...(color ? { "--bg-color": `var(--mm-${color})` } : {}),
      ...(highlightColor
        ? { "--bg-highlight-color": `var(--mm-${highlightColor})` }
        : {}),
    }}
    onClick={onPress}
    type={type ?? "button"}
    disabled={disabled}
    data-test-handle={testHandle && `${testHandle}-button`}
  >
    {children}
  </button>
);
