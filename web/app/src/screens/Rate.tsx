import React, {
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Card } from "../components/Card.tsx";
import { CardStack } from "../components/CardStack.tsx";
import { Layout } from "../components/Layout.tsx";
import { MatchesList } from "../components/MatchesList.tsx";
import { RoomInfoBar } from "../components/RoomInfoBar.tsx";
import { MovieMatchContext } from "../store.ts";

import "./Rate.css";

export const RateScreen = () => {
  const state = useContext(MovieMatchContext);
  const [currentIndex, setIndex] = useState<number>(0);

  if (!state.room || !state.room.media) {
    return <p style={{ color: "red" }}>No Room!</p>;
  }

  return (
    <Layout hideLogo>
      <CardStack
        onRate={(rating) => {
          const top = state.room?.media![0];
          if (top) {
            setIndex(currentIndex + 1);
            state.client.rate({
              mediaId: top.id,
              rating,
            });
          }
        }}
      >
        {state.room.media.slice(currentIndex, currentIndex + 5).map((media) => (
          <Card media={media} key={media.id} />
        ))}
      </CardStack>

      <RoomInfoBar />
      <MatchesList matches={state.room.matches ?? []} />
    </Layout>
  );
};
