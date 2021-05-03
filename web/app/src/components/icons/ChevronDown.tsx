import React from "react";
import { IconProps, iconProps } from "./Icon";

export const ChevronDownIcon = (props: IconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...iconProps(props)}
    >
      <path
        d="M15.25 10.75L12 14.25L8.75 10.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
      </path>
    </svg>
  );
};
