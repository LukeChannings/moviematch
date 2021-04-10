import React, { useContext, useRef, useState } from "react";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { Tr } from "../atoms/Tr";
import {
  SegmentedControlOption,
  SegmentedControls,
} from "../atoms/SegmentedControls";
import { Version } from "../atoms/Version";
import { Layout } from "../layout/Layout";
import { Card } from "../molecules/Card";
import { CardStack } from "../organisms/CardStack";
import { MatchesList } from "../organisms/MatchesList";
import { RoomInfoBar } from "../organisms/RoomInfoBar";
import type { ScreenProps } from "../layout/Screen";
import { MovieMatchContext } from "../../store";

import styles from "./Room.module.css";

export const RoomScreen = ({ dispatch }: ScreenProps) => {
  const state = useContext(MovieMatchContext);
  const matchesEl = useRef<HTMLUListElement>(null);
  const [matchOrder, setMatchOrder] = useState<string>("mostRecent");
  const [media] = useState(state.room?.media);

  if (!state.room || !media) {
    return <ErrorMessage message="No Room!" />;
  }

  return (
    <Layout hideLogo className={styles.screen}>
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
