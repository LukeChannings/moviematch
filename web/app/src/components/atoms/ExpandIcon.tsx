import React from "react";

import styles from "./Icon.module.css";

export const ExpandIcon = ({ size = "1.2rem" }: { size?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={styles.icon}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ fontSize: size }}
  >
    <path d="M24 24H0V0h24v24z" fill="none" opacity=".87" />
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" />
  </svg>
);
