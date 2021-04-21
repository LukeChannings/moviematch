import { animated, useSpring } from "@react-spring/web";
import React, { CSSProperties, forwardRef, HTMLAttributes } from "react";

import styles from "./Popover.module.css";

interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  arrowStyles?: CSSProperties;
  arrowProps?: { [key: string]: string };
}

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  ({ children, arrowProps, arrowStyles, isOpen, ...props }, ref) => {
    const { opacity } = useSpring({
      opacity: isOpen ? 1 : 0,
      config: {
        duration: 150,
      },
    });

    return (
      <animated.div
        {...props}
        ref={ref}
        style={{
          ...props.style,
          ...(!isOpen ? { pointerEvents: "none" } : {}),
          opacity,
        }}
        className={styles.popover}
      >
        <div
          {...arrowProps}
          data-popper-arrow
          className={styles.popoverArrow}
          style={arrowStyles}
        />
        {children}
      </animated.div>
    );
  },
);
