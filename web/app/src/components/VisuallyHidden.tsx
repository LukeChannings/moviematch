import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./VisuallyHidden.css";

export const VisuallyHidden = ({ children }: { children: ReactNode }) =>
  <div className="VisuallyHidden">{children}</div>;
