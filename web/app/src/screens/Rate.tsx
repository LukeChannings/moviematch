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
import { Tr } from "../components/Tr.tsx";
import { MovieMatchContext } from "../store.ts";

import "./Rate.css";

export const RateScreen = () => {
  const state = useContext(MovieMatchContext);
  const [currentIndex, setIndex] = useState<number>(0);

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

      <RoomInfoBar />
      <MatchesList>
        {state.room.matches?.map((match) => (
          <Card
            media={match.media}
            href={`/foo`}
            title={
              <Tr
                name="MATCHES_SECTION_CARD_LIKERS"
                context={{
                  users: match.users.join(" & "),
                  movie: match.media.title,
                }}
              />
            }
          />
        ))}
      </MatchesList>
    </Layout>
  );
};
