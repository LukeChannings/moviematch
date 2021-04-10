import React, { ReactNode } from "react";

import styles from "./Pill.module.css";

interface PillProps {
  children: ReactNode;
  onRemove?: React.MouseEventHandler<HTMLDivElement>;
}

export const Pill = ({ children, onRemove }: PillProps) => (
  <div
    className={onRemove ? styles.pillWithRemoveButton : styles.pill}
    onClick={onRemove}
  >
    <span className={styles.label}>{children}</span>
    {onRemove && <span className={styles.icon}>&times;</span>}
  </div>
);
