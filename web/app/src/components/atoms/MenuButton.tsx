import React from "react";
import type { HTMLAttributes } from "react";

import styles from "./MenuButton.module.css";

export const MenuButton = (props: HTMLAttributes<HTMLButtonElement>) => {
  return (<button {...props} className={styles.menuButton} />);
};
