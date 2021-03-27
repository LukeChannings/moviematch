import React, {
  forwardRef,
  ReactNode,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Media } from "../../../../types/moviematch.ts";

import "./Card.css";
import { InfoIcon } from "./InfoIcon.tsx";
import { Pill } from "./Pill.tsx";
import { ContentRatingSymbol } from "./ContentRatingSymbol.tsx";

export interface CardProps {
  title?: ReactNode;
  href?: string;
  media: Media;

  style?: React.CSSProperties;
}

const formatTime = (milliseconds: number) =>
  `${Math.round((milliseconds / 1000) / 60)} minutes`;

const formatList = (list: string[]) => list.join("&");

export const Card = forwardRef<HTMLDivElement & HTMLAnchorElement, CardProps>(
  ({ media, title, href, style }, ref) => {
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);

    const srcSet = [
      `${media.posterUrl}?width=300`,
      `${media.posterUrl}?width=450 1.5x`,
      `${media.posterUrl}?width=600 2x`,
      `${media.posterUrl}?width=900 3x`,
    ];

    const mediaTitle = `${media.title}${
      media.type === "movie" ? ` (${media.year})` : ""
    }`;

    const Tag = href ? "a" : "div";

    return (
      <Tag
        ref={ref}
        className={`Card ${href ? "--link" : ""}`}
        {...(href
          ? {
            href,
            target: /(iPhone|iPad)/.test(navigator.userAgent)
              ? "_self"
              : "_blank",
          }
          : {})}
      >
        <img
          className="Card_Poster"
          src={srcSet[0]}
          srcSet={srcSet.join(", ")}
          alt={`${media.title} poster`}
        />
        {showMoreInfo
          ? (
            <div className="Card_MoreInfo">
              <div className="Card_MoreInfo_Header">
                <p className="Card_MoreInfo_Title">{mediaTitle}</p>
                <div className="Card_MoreInfo_Metadata">
                  <Pill>{media.year}</Pill>
                  <Pill>{formatTime(+media.duration)}</Pill>
                  <Pill>{media.rating} ⭐️</Pill>
                  <Pill>
                    <ContentRatingSymbol
                      rating={media.contentRating!}
                      size="1.5em"
                    />
                  </Pill>
                  {media.genres.map((genre) => <Pill>{genre}</Pill>)}
                </div>
              </div>
              <p className="Card_MoreInfo_Description">
                {media.description}
                {media.description}
              </p>
            </div>
          )
          : (
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
  },
);

Card.displayName = "Card";
