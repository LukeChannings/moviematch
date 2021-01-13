import React, {
  forwardRef,
  ReactNode,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Media } from "../../../../types/moviematch.d.ts";

import "./Card.css";
import { InfoIcon } from "./InfoIcon.tsx";

export interface CardProps {
  title?: ReactNode;
  href?: string;
  media: Media;
}

export const Card = forwardRef<HTMLDivElement & HTMLAnchorElement, CardProps>(
  ({ media, title, href }, ref) => {
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);

    const srcSet = [
      `${media.posterUrl}&w=300`,
      `${media.posterUrl}&w=450 1.5x`,
      `${media.posterUrl}&w=600 2x`,
      `${media.posterUrl}&w=900 3x`,
    ];

    const mediaTitle = `${media.title}${
      media.type === "movie" ? ` (${media.year})` : ""
    }`;

    const Tag = href ? "a" : "div";

    return (
      <Tag
        ref={ref}
        className={`Card ${href ? "--link" : ""}`}
        {...(href ? { href, target: "_blank" } : {})}
      >
        <img
          className="Card_Poster"
          src={srcSet[0]}
          srcSet={srcSet.join(", ")}
          alt={`${media.title} poster`}
        />
        {showMoreInfo ? (
          <div className="Card_MoreInfo">
            <p className="Card_MoreInfo_Title">{mediaTitle}</p>
            <p className="Card_MoreInfo_Description">{media.description}</p>
          </div>
        ) : (
          <div className="Card_Info">
            <p className="Card_Info_Title">{title ?? mediaTitle}</p>
          </div>
        )}
        <button
          className="Card_MoreInfoButton"
          onClick={(e) => {
            e.preventDefault();
            setShowMoreInfo(!showMoreInfo);
          }}
        >
          <InfoIcon />
        </button>
      </Tag>
    );
  }
);

Card.displayName = "Card";
