import React from "react";
import { IconProps, iconProps } from "./Icon";

export const CloseIcon = (props: IconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...iconProps(props)}
    >
      <path
        d="M17.25 6.75L6.75 17.25"
        fill="var(--fillColor)"
        stroke="var(--strokeColor, currentColor)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
      </path>
      <path
        d="M6.75 6.75L17.25 17.25"
        fill="var(--fillColor)"
        stroke="var(--strokeColor, currentColor)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
      </path>
    </svg>
  );
};
