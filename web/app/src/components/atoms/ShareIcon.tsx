import React from "react";

import styles from "./Icon.module.css";

export const ShareIcon = ({ size = "1.2rem" }: { size?: string }) => (
  <svg
    className={styles.icon}
    viewBox="0 0 13 17"
    xmlns="http://www.w3.org/2000/svg"
    style={{ fontSize: size }}
  >
    <g fillRule="nonzero" fill="currentColor">
      <path
        d="M8.784 4.176L6.24 1.632 3.696 4.176l-.672-.672L6.24.288l3.216 3.216z"
      />
      <path d="M5.76.96h.96v10.08h-.96z" />
      <path
        d="M11.04 16.8h-9.6C.624 16.8 0 16.176 0 15.36V6.72c0-.816.624-1.44 1.44-1.44H4.8v.96H1.44c-.288 0-.48.192-.48.48v8.64c0 .288.192.48.48.48h9.6c.288 0 .48-.192.48-.48V6.72c0-.288-.192-.48-.48-.48H7.68v-.96h3.36c.816 0 1.44.624 1.44 1.44v8.64c0 .816-.624 1.44-1.44 1.44z"
      />
    </g>
  </svg>
);
