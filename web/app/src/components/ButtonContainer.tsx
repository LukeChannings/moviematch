import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./ButtonContainer.css";

interface ButtonContainerProps {
  children: ReactNode;
  paddingTop?: "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";
}

export const ButtonContainer = ({
  children,
  paddingTop,
}: ButtonContainerProps) => (
  <div
    className="ButtonContainer"
    style={paddingTop ? { paddingTop: `var(--${paddingTop})` } : {}}
  >
    {children}
  </div>
);
