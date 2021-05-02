import React, { HTMLAttributes, ReactNode } from "react";

import styles from "./Pill.module.css";

interface PillProps {
  children: ReactNode;
  onRemove?: React.MouseEventHandler<HTMLDivElement>;
  href?: string;
}

export const Pill = ({ children, onRemove, href }: PillProps) => {
  const Tag = href ? "a" : "div";

  const props =
    (Tag === "a"
      ? { href, target: "_blank" }
      : { onClick: onRemove } as HTMLAttributes<HTMLElement>);

  return (
    <Tag
      className={onRemove && !href ? styles.pillWithRemoveButton : styles.pill}
      {...props}
    >
      <span className={styles.label}>{children}</span>
      {onRemove && <span className={styles.icon}>&times;</span>}
    </Tag>
  );
};
