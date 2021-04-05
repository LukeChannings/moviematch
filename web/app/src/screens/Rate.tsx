import React, { useContext, useRef, useState } from "react";
import { Card } from "../components/Card";
import { CardStack } from "../components/CardStack";
import { ErrorMessage } from "../components/ErrorMessage";
import { Layout } from "../components/Layout";
import { MatchesList } from "../components/MatchesList";
import { RoomInfoBar } from "../components/RoomInfoBar";
import type { ScreenProps } from "../components/Screen";
import { Tr } from "../components/Tr";
import { Version } from "../components/Version";
import {
  SegmentedControlOption,
  SegmentedControls,
} from "../components/SegmentedControls";
import { MovieMatchContext } from "../store";

import "./Rate.css";

export const RateScreen = ({ dispatch }: ScreenProps) => {
  const state = useContext(MovieMatchContext);
  const matchesEl = useRef<HTMLUListElement>(null);
  const [matchOrder, setMatchOrder] = useState<string>("mostRecent");
  const [media] = useState(state.room?.media);

  if (!state.room || !media) {
    return <ErrorMessage message="No Room!" />;
  }

  return (
    <Layout hideLogo className="RateScreen">
      <CardStack
        cards={media}
        onCardDismissed={(card, rating) => {
          state.client.rate({
            mediaId: card.id,
            rating: rating === "left" ? "dislike" : "like",
          });
        }}
        renderCard={(card) => <Card media={card} key={card.id} />}
      />

      <RoomInfoBar
        addToast={(toast) => {
          dispatch({ type: "addToast", payload: toast });
        }}
        logout={async () => {
          await state.client.leaveRoom();
          dispatch({ type: "logout", payload: null });
        }}
        leaveRoom={async () => {
          await state.client.leaveRoom();
          dispatch({ type: "setRoom", payload: undefined });
          dispatch({ type: "navigate", payload: { path: "join" } });
        }}
      />
      <SegmentedControls
        name="sortMatches"
        value={matchOrder}
        onChange={(value) => {
          if (matchesEl.current) {
            matchesEl.current.scrollTo({ left: 0, behavior: "smooth" });
          }
          setMatchOrder(value);
        }}
        paddingTop="s4"
      >
        <SegmentedControlOption value="mostRecent">
          Most Recent
        </SegmentedControlOption>
        <SegmentedControlOption value="mostLikes">
          Most Likes
        </SegmentedControlOption>
      </SegmentedControls>
      <MatchesList ref={matchesEl}>
        {state.room.matches &&
          state.room.matches
            .sort((a, b) =>
              matchOrder === "mostLikes"
                ? b.users.length - a.users.length
                : b.matchedAt - a.matchedAt
            )
            .map((match) => (
              <Card
                media={match.media}
                href={match.media.linkUrl}
                key={match.media.id}
                title={<Tr
                  name="MATCHES_SECTION_CARD_LIKERS"
                  context={{
                    users: match.users.join(" & "),
                    movie: match.media.title,
                  }}
                />}
              />
            ))}
      </MatchesList>
      <Version />
    </Layout>
  );
};
