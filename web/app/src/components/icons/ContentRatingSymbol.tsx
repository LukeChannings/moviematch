import React from "react";

import BBFC_U from "./RatingSymbols/BbfcU";
import BBFC_PG from "./RatingSymbols/BbfcPg";
import BBFC_12A from "./RatingSymbols/Bbfc12A";
import BBFC_12 from "./RatingSymbols/Bbfc12";
import BBFC_15 from "./RatingSymbols/Bbfc15";
import BBFC_18 from "./RatingSymbols/Bbfc18";

export interface ContentRatingProps {
  rating: string;
  size?: string;
}

const iconUrls: Partial<
  Record<string, (props: React.SVGProps<SVGSVGElement>) => JSX.Element | null>
> = {
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
  const Icon = iconUrls[rating];

  return Icon ? <Icon style={{ fontSize: size }} /> : <p>{rating}</p>;
};
