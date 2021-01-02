import React, {
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Card } from "../components/Card.tsx";
import { CardStack } from "../components/CardStack.tsx";
import { Layout } from "../components/Layout.tsx";
import { MovieMatchContext } from "../state.ts";

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
        onRate={() => {
          setIndex(currentIndex + 1);
        }}
      >
        {state.room.media
          .slice(currentIndex, currentIndex + 5)
          .map((media, i) => (
            <Card media={media} key={media.id} index={i} />
          ))}
      </CardStack>
    </Layout>
  );
};
