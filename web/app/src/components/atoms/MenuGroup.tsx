import React, { ReactNode } from "react";

import styles from "./MenuGroup.module.css";

interface MenuGroupProps {
  title: string;
  children: ReactNode;
}

export const MenuGroup = ({ title, children }: MenuGroupProps) => {
  if (!children) {
    return null;
  }

  return (
    <div className={styles.menuGroup}>
      <p className={styles.title}>{title}</p>
      <div className={styles.menuGroupItems}>
        {children}
      </div>
    </div>
  );
};
