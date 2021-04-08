import React from "react";

import MPAA_G from "./RatingSymbols/MPAA_G.svg";
import MPAA_PG13 from "./RatingSymbols/MPAA_PG-13.svg";
import MPAA_PG from "./RatingSymbols/MPAA_PG.svg";
import MPAA_R from "./RatingSymbols/MPAA_R.svg";
import MPAA_NC17 from "./RatingSymbols/MPAA_NC-17.svg";
import BBFC_U from "./RatingSymbols/BBFC_U.svg";
import BBFC_PG from "./RatingSymbols/BBFC_PG.svg";
import BBFC_12A from "./RatingSymbols/BBFC_12A.svg";
import BBFC_12 from "./RatingSymbols/BBFC_12.svg";
import BBFC_15 from "./RatingSymbols/BBFC_15.svg";
import BBFC_18 from "./RatingSymbols/BBFC_18.svg";

export interface ContentRatingProps {
  rating: string;
  size?: string;
}

const iconUrls: Partial<Record<string, string | null>> = {
  "G": MPAA_G,
  "PG": MPAA_PG,
  "PG-13": MPAA_PG13,
  "R": MPAA_R,
  "NC-17": MPAA_NC17,
  "gb/U": BBFC_U,
  "gb/PG": BBFC_PG,
  "gb/12A": BBFC_12A,
  "gb/12": BBFC_12,
  "gb/15": BBFC_15,
  "gb/18": BBFC_18,
};

export const ContentRatingSymbol = ({
  rating,
  size = "1.2em",
}: ContentRatingProps) => {
  const src = iconUrls[rating];

  return src
    ? <img
      src={src}
      alt={`rated ${rating}`}
      title={rating}
      style={{ width: size, height: size, display: "block" }}
    />
    : <p>{rating}</p>;
};
