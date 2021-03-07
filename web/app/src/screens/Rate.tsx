import React, {
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Card } from "../components/Card.tsx";
import { CardStack } from "../components/CardStack.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";
import { Layout } from "../components/Layout.tsx";
import { MatchesList } from "../components/MatchesList.tsx";
import { RoomInfoBar } from "../components/RoomInfoBar.tsx";
import { ScreenProps } from "../components/Screen.ts";
import { Tr } from "../components/Tr.tsx";
import { Version } from "../components/Version.tsx";
import {
  SegmentedControlOption,
  SegmentedControls,
} from "../components/SegmentedControls.tsx";
import { MovieMatchContext } from "../store.ts";

import "./Rate.css";

export const RateScreen = ({ dispatch }: ScreenProps) => {
  const state = useContext(MovieMatchContext);
  const [currentIndex, setIndex] = useState<number>(0);
  const [matchOrder, setMatchOrder] = useState<string>("mostRecent");

  if (!state.room || !state.room.media) {
    return <ErrorMessage message="No Room!" />;
  }

  const media = state.room.media.slice(currentIndex, currentIndex + 5);

  return (
    <Layout hideLogo>
      <CardStack
        onRate={(rating) => {
          const [top] = media;
          if (top) {
            setIndex(currentIndex + 1);
            state.client.rate({
              mediaId: top.id,
              rating,
            });
          }
        }}
      >
        {media.map((media) => (
          <Card media={media} key={media.id} />
        ))}
      </CardStack>

      <RoomInfoBar
        addToast={(toast) => {
          dispatch({ type: "addToast", payload: toast });
        }}
        logout={() => {
          dispatch({ type: "logout", payload: null });
        }}
        leaveRoom={() => {
          dispatch({ type: "setRoom", payload: undefined });
          dispatch({ type: "navigate", payload: { path: "join" } });
        }}
      />
      <SegmentedControls
        name="sortMatches"
        value={matchOrder}
        onChange={setMatchOrder}
        paddingTop="s4"
      >
        <SegmentedControlOption value="mostRecent">
          Most Recent
        </SegmentedControlOption>
        <SegmentedControlOption value="mostLikes">
          Most Likes
        </SegmentedControlOption>
      </SegmentedControls>
      <MatchesList>
        {state.room.matches && (
          state.room.matches.sort((a, b) =>
            matchOrder === "mostLikes"
              ? b.users.length - a.users.length
              : b.matchedAt - a.matchedAt
          ).map((match) => (
            <Card
              media={match.media}
              href={match.media.linkUrl}
              title={<Tr
                name="MATCHES_SECTION_CARD_LIKERS"
                context={{
                  users: match.users.join(" & "),
                  movie: match.media.title,
                }}
              />}
            />
          ))
        )}
      </MatchesList>
      <Version />
    </Layout>
  );
};
