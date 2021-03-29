import React, { forwardRef, ReactNode, useState } from "react";
import type { Media } from "../../../../types/moviematch";

import "./Card.css";
import { InfoIcon } from "./InfoIcon";
import { Pill } from "./Pill";
import { ContentRatingSymbol } from "./ContentRatingSymbol";

export interface CardProps {
  title?: ReactNode;
  href?: string;
  media: Media;

  style?: React.CSSProperties;
}

const formatTime = (milliseconds: number) =>
  `${Math.round(milliseconds / 1000 / 60)} minutes`;

export const Card = forwardRef<HTMLDivElement & HTMLAnchorElement, CardProps>(
  ({ media, title, href, style }, ref) => {
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);

    const srcSet = [
      `${import.meta.env.API_URI ?? ""}${media.posterUrl}?width=300`,
      `${import.meta.env.API_URI ?? ""}${media.posterUrl}?width=450 1.5x`,
      `${import.meta.env.API_URI ?? ""}${media.posterUrl}?width=600 2x`,
      `${import.meta.env.API_URI ?? ""}${media.posterUrl}?width=900 3x`,
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
                  {media.genres.map((genre) => (
                    <Pill key={genre}>{genre}</Pill>
                  ))}
                </div>
              </div>
              <p className="Card_MoreInfo_Description">
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
