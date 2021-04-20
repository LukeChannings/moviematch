import React, { CSSProperties, forwardRef, HTMLAttributes } from "react";

import styles from "./Popover.module.css";

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  arrowStyles?: CSSProperties;
  arrowProps?: { [key: string]: string };
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ children, arrowProps, arrowStyles, isOpen, ...props }, ref) => {
    return (
      <div
        {...props}
        ref={ref}
        style={isOpen ? { ...props.style, display: "none" } : props.style}
        className={styles.popover}
      >
        <div
          {...arrowProps}
          data-popper-arrow
          className={styles.popoverArrow}
          style={arrowStyles}
        />
        {children}
      </div>
    );
  },
);
