import React, { forwardRef, ReactNode, useState } from "react";
import type { Media } from "../../../../../types/moviematch";

import { InfoIcon } from "../atoms/InfoIcon";
import { Pill } from "../atoms/Pill";
import { ContentRatingSymbol } from "../atoms/ContentRatingSymbol";
import { StarIcon } from "../atoms/StarIcon";

import styles from "./Card.module.css";

export interface CardProps {
  title?: ReactNode;
  href?: string;
  media: Media;

  style?: React.CSSProperties;
}

const formatTime = (milliseconds: number) =>
  `${Math.round(milliseconds / 1000 / 60)} minutes`;

export const Card = forwardRef<HTMLDivElement & HTMLAnchorElement, CardProps>(
  ({ media, title, href }, ref) => {
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);

    const { rootPath } = document.body.dataset;

    const srcSet = [
      `${rootPath}${media.posterUrl}?width=300`,
      `${rootPath}${media.posterUrl}?width=450 1.5x`,
      `${rootPath}${media.posterUrl}?width=600 2x`,
      `${rootPath}${media.posterUrl}?width=900 3x`,
    ];

    const mediaTitle = `${media.title}${
      media.type === "movie" ? ` (${media.year})` : ""
    }`;

    const Tag = href ? "a" : "div";

    return (
      <Tag
        ref={ref}
        className={href ? styles.linkCard : styles.card}
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
          className={styles.poster}
          src={srcSet[0]}
          srcSet={srcSet.join(", ")}
          alt={`${media.title} poster`}
        />
        {showMoreInfo
          ? (
            <div className={styles.moreInfo}>
              <p className={styles.moreInfoTitle}>{mediaTitle}</p>
              <div className={styles.moreInfoMetadata}>
                <Pill>{media.year}</Pill>
                <Pill>{formatTime(+media.duration)}</Pill>
                <Pill>
                  <StarIcon size="0.8rem" /> {media.rating}
                </Pill>
                {media.contentRating && (
                  <Pill>
                    <ContentRatingSymbol
                      rating={media.contentRating}
                      size="1rem"
                    />
                  </Pill>
                )}
                {media.genres.map((genre) => (
                  <Pill key={genre}>{genre}</Pill>
                ))}
              </div>
              <p className={styles.moreInfoDescription}>
                {media.description}
              </p>
            </div>
          )
          : (
            <div className={styles.titleContainer}>
              <p className={styles.title}>{title ?? mediaTitle}</p>
            </div>
          )}
        <button
          className={styles.moreInfoButton}
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
