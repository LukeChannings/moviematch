import React, { useCallback, useContext, useRef, useState } from "react";
import type {
  Filter,
  Filters,
  JoinRoomSuccess,
} from "../../../../../types/moviematch";
import { Button } from "../atoms/Button";
import { ButtonContainer } from "../layout/ButtonContainer";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { Field } from "../molecules/Field";
import { FilterField } from "../molecules/FilterField";
import { AddRemoveList } from "../atoms/AddRemoveList";
import { Layout } from "../layout/Layout";
import type { ScreenProps } from "../layout/Screen";
import { Tr } from "../atoms/Tr";
import { MovieMatchContext } from "../../store";
import { useAsyncEffect } from "../../hooks/useAsyncEffect";

import styles from "./Create.module.css";

export const CreateScreen = ({
  navigate,
  dispatch,
  params: { roomName: initialRoomName },
}: ScreenProps<{ roomName: string }>) => {
  const { client, translations } = useContext(MovieMatchContext);
  const [roomName, setRoomName] = useState(initialRoomName);
  const [roomNameError, setRoomNameError] = useState<string | null>(null);
  const [createRoomError, setCreateRoomError] = useState<string>();
  const [availableFilters, setAvailableFilters] = useState<Filters>();
  const filters = useRef(new Map<number, Filter>());
  const createRoom = useCallback(async () => {
    if (!roomName) {
      setRoomNameError(translations?.FIELD_REQUIRED_ERROR!);
      return;
    }

    if (roomName) {
      try {
        const joinMsg: JoinRoomSuccess = await client.createRoom({
          roomName,
          filters: [...filters.current.values()],
        });

        dispatch({
          type: "setRoom",
          payload: {
            name: roomName,
            joined: true,
            media: joinMsg.media,
            matches: joinMsg.previousMatches,
          },
        });
        navigate({ path: "rate" });
      } catch (err) {
        setCreateRoomError(err.message);
      }
    }
  }, [roomName]);

  useAsyncEffect(async () => {
    const filters = await client.getFilters();
    setAvailableFilters(filters);
  }, []);

  return (
    <Layout>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {createRoomError && <ErrorMessage message={createRoomError} />}
        <Field
          label={<Tr name="LOGIN_ROOM_NAME" />}
          name="roomName"
          value={roomName}
          errorMessage={roomNameError}
          onChange={(e) => setRoomName(e.target.value)}
        />

        <div className={styles.filters}>
          <h2 className={styles.filtersTitle}>Filters</h2>
          <AddRemoveList
            initialChildren={0}
            onRemove={(i) => filters.current.delete(i)}
            testHandle="filter"
          >
            {(i) =>
              availableFilters && (
                <FilterField
                  key={i}
                  name={String(i)}
                  onChange={(filter) =>
                    filter && filters.current.set(i, filter)}
                  filters={availableFilters}
                  getSuggestions={async (key: string) => {
                    return await client.getFilterValues(key);
                  }}
                />
              )}
          </AddRemoveList>
        </div>

        <ButtonContainer reverseMobile paddingTop="s3">
          <Button
            appearance="Tertiary"
            onPress={() => navigate({ path: "join" })}
            testHandle="back"
          >
            <Tr name="BACK" />
          </Button>
          <Button
            appearance="Primary"
            onPress={createRoom}
            testHandle="create-room"
          >
            <Tr name="CREATE_ROOM" />
          </Button>
        </ButtonContainer>
      </form>
    </Layout>
  );
};
