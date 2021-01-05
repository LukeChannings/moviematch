import React from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Match, Media } from "../../../../types/moviematch.d.ts";
import { Card } from "./Card.tsx";

import "./MatchesList.css";

interface MatchesListProps {
  matches: Match[];
}

export const MatchesList = ({ matches }: MatchesListProps) => {
  return (
    <ul className="MatchesList">
      {matches.length === 0 && (
        <li className="MatchesList_Item">
          <p>There are no matches!</p>
        </li>
      )}
      {matches.map((match) => (
        <li className="MatchesList_Item" key={match.media.id}>
          <Card media={match.media} />
        </li>
      ))}
    </ul>
  );
};
