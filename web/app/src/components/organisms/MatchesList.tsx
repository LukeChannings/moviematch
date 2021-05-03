import React, { Children, forwardRef, isValidElement, ReactNode } from "react";

import { Tr } from "../atoms/Tr";
import styles from "./MatchesList.module.css";

interface MatchesListProps {
  children: ReactNode;
}

export const MatchesList = forwardRef<HTMLUListElement, MatchesListProps>(
  ({ children }, ref) => {
    return (
      <div className={styles.matches}>
        {Children.count(children) === 0
          ? (
            <p className={styles.noMatchesText}>
              <Tr name="MATCHES_SECTION_NO_MATCHES" />
            </p>
          )
          : (
            <ul className={styles.list} ref={ref}>
              {Children.map(children, (child) => {
                if (isValidElement(child)) {
                  return (
                    <li className={styles.item} key={`${child.key}-item`}>
                      {child}
                    </li>
                  );
                }
              })}
            </ul>
          )}
      </div>
    );
  },
);
