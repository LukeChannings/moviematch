import React, { Children, isValidElement, ReactNode } from "react";

import "./MatchesList.css";
import { Tr } from "./Tr";

interface MatchesListProps {
  children: ReactNode;
}

export const MatchesList = ({ children }: MatchesListProps) => {
  return (
    <div className="Matches">
      {Children.count(children) === 0 ? (
        <p className="Matches_NoMatches">
          <Tr name="MATCHES_SECTION_NO_MATCHES" />
        </p>
      ) : (
        <ul className="MatchesList">
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
};
