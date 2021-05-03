import React from "react";
import { IconProps, iconProps } from "./Icon";

export const HeartIcon = (props: IconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...iconProps(props)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.995 7.23321C10.5455 5.61 8.12832 5.17336 6.31215 6.65973C4.49599 8.1461 4.2403 10.6312 5.66654 12.3892L11.995 18.25L18.3235 12.3892C19.7498 10.6312 19.5253 8.13047 17.6779 6.65973C15.8305 5.189 13.4446 5.61 11.995 7.23321Z"
        stroke="var(--strokeColor, currentColor)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="var(--fillColor)"
      >
      </path>
    </svg>
  );
};
