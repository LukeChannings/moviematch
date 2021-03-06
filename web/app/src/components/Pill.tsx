import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./Pill.css";

interface PillProps {
  children: ReactNode;
  onRemove?: () => void;
}

export const Pill = ({ children, onRemove }: PillProps) =>
  <div className="Pill" onClick={onRemove}>
    <span className="PillLabel">{children}</span>
    {onRemove && <span className="PillCloseIcon">&times;</span>}
  </div>;
