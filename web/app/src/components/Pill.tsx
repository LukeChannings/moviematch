import React, { ReactNode } from "react";

import "./Pill.css";

interface PillProps {
  children: ReactNode;
  onRemove?: React.MouseEventHandler<HTMLDivElement>;
}

export const Pill = ({ children, onRemove }: PillProps) => (
  <div className={`Pill ${onRemove ? "--has-remove" : ""}`} onClick={onRemove}>
    <span className="PillLabel">{children}</span>
    {onRemove && <span className="PillCloseIcon">&times;</span>}
  </div>
);
