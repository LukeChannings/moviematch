import React, { ReactNode, useEffect, useRef, useState } from "react";

import "./Popover.css";

interface PopoverProps {
  className?: string;
  children: (popoverOpen: boolean) => ReactNode;
}

export const PopoverButton = ({ className, children }: PopoverProps) => {
  const [isOpen, setOpen] = useState(false);
  const popoverRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isOpen) {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          e.target instanceof HTMLElement &&
          popoverRef.current?.contains(e.target)
        ) {
          return;
        }
        setOpen(false);
      };

      document.addEventListener("mouseup", handleOutsideClick, { once: true });
      return () => {
        document.removeEventListener("mouseup", handleOutsideClick);
      };
    }
  }, [isOpen]);
  return (
    <button
      className={`PopoverButton ${className ?? ""}`}
      onClick={() => setOpen(!isOpen)}
      ref={popoverRef}
    >
      {children(isOpen)}
    </button>
  );
};

export const Popover = ({ children }: { children: ReactNode }) => (
  <div className="Popover">{children}</div>
);

interface PopoverMenuButtonProps {
  children: ReactNode;
  onPress: () => void;
}

export const PopoverMenuButton = ({
  children,
  onPress,
}: PopoverMenuButtonProps) => (
  <button className="PopoverMenuButton" onClick={onPress}>
    {children}
  </button>
);
