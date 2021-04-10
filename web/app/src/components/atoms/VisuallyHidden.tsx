import React, { ReactNode } from "react";

import styles from "./VisuallyHidden.module.css";

export const VisuallyHidden = ({ children }: { children: ReactNode }) => (
  <div className={styles.hidden}>{children}</div>
);
