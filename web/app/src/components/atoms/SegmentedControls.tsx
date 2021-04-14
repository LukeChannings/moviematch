import React, {
  AriaAttributes,
  createContext,
  ReactElement,
  ReactNode,
  useContext,
} from "react";

import styles from "./SegmentedControls.module.css";
import { VisuallyHidden } from "./VisuallyHidden";

export interface SegmentedControlsProps extends AriaAttributes {
  name: string;
  value: string;

  onChange?(value: string): void;

  paddingTop?: "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";

  children: ReactElement[];
}

interface SegmentedControlOptionProps {
  value: string;
  children: ReactNode;
}

interface SegmentedControlContext {
  value: string;
  name: string;
}

const SegmentedControlContext = createContext<SegmentedControlContext>({
  name: "",
  value: "",
});

export const SegmentedControls = ({
  children,
  name,
  value,
  onChange,
  paddingTop,
}: SegmentedControlsProps) => (
  <SegmentedControlContext.Provider value={{ name, value }}>
    <fieldset
      name={name}
      className={styles.controls}
      onChange={(e) => {
        if (typeof onChange === "function") {
          onChange((e.target as HTMLInputElement).value);
        }
      }}
      style={paddingTop ? { marginTop: `var(--${paddingTop})` } : {}}
    >
      <ul className={styles.list}>
        {children.map((child) => {
          const childValue = child.props.value;
          const isSelected = childValue === value;
          return (
            <li
              key={childValue}
              className={isSelected ? styles.itemSelected : styles.item}
            >
              {child}
            </li>
          );
        })}
      </ul>
    </fieldset>
  </SegmentedControlContext.Provider>
);

export const SegmentedControlOption = ({
  value,
  children,
}: SegmentedControlOptionProps) => {
  const { name, value: currentValue } = useContext(SegmentedControlContext);

  const isSelected = value === currentValue;

  return (
    <label className={styles.option}>
      <VisuallyHidden>
        <input
          type="radio"
          name={name}
          value={value}
          defaultChecked={isSelected}
        />
      </VisuallyHidden>
      <div className={styles.itemPadding}>{children}</div>
    </label>
  );
};
