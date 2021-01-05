import React, {
  forwardRef,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Media } from "../../../../types/moviematch.d.ts";

import "./Card.css";
import { InfoIcon } from "./InfoIcon.tsx";

export interface CardProps {
  media: Media;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ media }, ref) => {
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);

  const srcSet = [
    `${media.posterUrl}&w=300`,
    `${media.posterUrl}&w=450 1.5x`,
    `${media.posterUrl}&w=600 2x`,
    `${media.posterUrl}&w=900 3x`,
  ];

  return (
    <div ref={ref} className="Card">
      <img
        className="Card_Poster"
        src={srcSet[0]}
        srcSet={srcSet.join(", ")}
        alt={`${media.title} poster`}
      />
      {showMoreInfo ? (
        <div className="Card_MoreInfo">
          <p className="Card_MoreInfo_Title">{`${media.title}${
            media.type === "movie" ? ` (${media.year})` : ""
          }`}</p>
          <p className="Card_MoreInfo_Description">{media.description}</p>
        </div>
      ) : (
        <div className="Card_Info">
          <p className="Card_Info_Title">{`${media.title}${
            media.type === "movie" ? ` (${media.year})` : ""
          }`}</p>
        </div>
      )}
      <button
        className="Card_MoreInfoButton"
        onClick={() => setShowMoreInfo(!showMoreInfo)}
      >
        <InfoIcon />
      </button>
    </div>
  );
});

Card.displayName = "Card";
