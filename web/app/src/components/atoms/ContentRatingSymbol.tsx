import React from "react";

import MPAA_G from "./RatingSymbols/MpaaG";
import MPAA_PG13 from "./RatingSymbols/MpaaPg13";
import MPAA_PG from "./RatingSymbols/MpaaPg";
import MPAA_R from "./RatingSymbols/MpaaR";
import MPAA_NC17 from "./RatingSymbols/MpaaNc17";
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
  const Icon = iconUrls[rating];

  return Icon ? <Icon style={{ fontSize: size }} /> : <p>{rating}</p>;
};
