import React, { ReactNode } from "react";
import { Logo } from "./Logo";

interface LayoutProps {
  hideLogo?: boolean;
  children: ReactNode;
}

export const Layout = ({ children, hideLogo = false }: LayoutProps) => (
  <section className="Screen">
    {!hideLogo && <Logo />}
    {children}
  </section>
);
