import React, { ReactNode } from "react";
import { Logo } from "./Logo";

interface LayoutProps {
  children: ReactNode;
  hideLogo?: boolean;
  className?: string;
}

export const Layout = ({ children, className, hideLogo = false }: LayoutProps) => (
  <section className={`Screen ${className ? className : ''}`}>
    {!hideLogo && <Logo />}
    {children}
  </section>
);
