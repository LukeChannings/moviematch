import React, { ReactNode } from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Logo } from "./Logo.tsx";

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
