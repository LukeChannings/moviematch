import React, { ReactNode } from "react";
import { Logo } from "../atoms/Logo";

import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  hideLogo?: boolean;
  className?: string;
}

export const Layout = (
  { children, className, hideLogo = false }: LayoutProps,
) => (
  <section className={`${styles.screenLayout} ${className ?? ""}`}>
    {!hideLogo && <Logo />}
    {children}
  </section>
);
