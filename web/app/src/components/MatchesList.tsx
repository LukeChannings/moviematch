import React, { Children, forwardRef, isValidElement, ReactNode } from "react";

import "./MatchesList.css";
import { Tr } from "./Tr";

interface MatchesListProps {
  children: ReactNode;
}

export const MatchesList = forwardRef<HTMLUListElement, MatchesListProps>(
  ({ children }, ref) => {
    return (
      <div className="Matches">
        {Children.count(children) === 0
          ? (
            <p className="Matches_NoMatches">
              <Tr name="MATCHES_SECTION_NO_MATCHES" />
            </p>
          )
          : (
            <ul className="MatchesList" ref={ref}>
              {Children.map(children, (child) => {
                if (isValidElement(child)) {
                  return (
                    <li className="MatchesList_Item" key={`${child.key}-item`}>
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
