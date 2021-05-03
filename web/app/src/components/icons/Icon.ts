import type { SVGAttributes } from "react";
import styles from "./Icon.module.css";

export type IconProps = { size?: string } | { width?: string; height?: string };

export const iconProps = (props: IconProps): SVGAttributes<SVGElement> => ({
  className: styles.icon,
  preserveAspectRatio: "xMidYMin slice",
  style: "width" in props
    ? {
      width: props.width,
      height: props.height,
    }
    : "size" in props
    ? {
      fontSize: props.size ?? "1.2rem",
    }
    : {},
});
