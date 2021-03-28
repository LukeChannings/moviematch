import React, { ReactNode } from "react";

import "./VisuallyHidden.css";

export const VisuallyHidden = ({ children }: { children: ReactNode }) => (
  <div className="VisuallyHidden">{children}</div>
);
