import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Filter, Filters } from "../../../../../types/moviematch";
import { useStore } from "../../store/useStore";
import { Button } from "../atoms/Button";
import { ButtonContainer } from "../layout/ButtonContainer";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { Field } from "../molecules/Field";
import { FilterField } from "../molecules/FilterField";
import { AddRemoveList } from "../atoms/AddRemoveList";
import { Layout } from "../layout/Layout";
import { Tr } from "../atoms/Tr";

import styles from "./Create.module.css";

export const CreateScreen = () => {
  const [{ translations, room, error }, dispatch] = useStore();
  const [roomName, setRoomName] = useState<string>();
  const [roomNameError, setRoomNameError] = useState<string | null>(null);
  const filters = useRef(new Map<number, Filter>());
  const createRoom = useCallback(async () => {
    if (!roomName) {
      setRoomNameError(translations?.FIELD_REQUIRED_ERROR!);
      return;
    }

    if (roomName) {
      dispatch({
        type: "createRoom",
        payload: {
          roomName,
          filters: [...filters.current.values()],
        },
      });
    }
  }, [roomName]);

  useEffect(() => dispatch({ type: "requestFilters" }), []);

  return (
    <Layout>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {error && <ErrorMessage message={error.message ?? error.type ?? ""} />}
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
              room?.availableFilters && (
                <FilterField
                  key={i}
                  name={String(i)}
                  onChange={(filter) =>
                    filter && filters.current.set(i, filter)}
                  filters={room.availableFilters}
                  suggestions={room?.filterValues}
                  requestSuggestions={(key: string) => {
                    dispatch({ type: "requestFilterValues", payload: { key } });
                  }}
                />
              )}
          </AddRemoveList>
        </div>

        <ButtonContainer reverseMobile paddingTop="s3">
          <Button
            appearance="Tertiary"
            onPress={() => dispatch({ type: "navigate", payload: "join" })}
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
