import React, { useCallback, useContext, useRef, useState } from "react";
import type {
  Filter,
  Filters,
  JoinRoomSuccess,
} from "../../../../types/moviematch";
import { Button } from "../components/Button";
import { ButtonContainer } from "../components/ButtonContainer";
import { ErrorMessage } from "../components/ErrorMessage";
import { Field } from "../components/Field";
import { FilterField } from "../components/FilterField";
import { AddRemoveList } from "../components/AddRemoveList";
import { Layout } from "../components/Layout";
import type { ScreenProps } from "../components/Screen";
import { Tr } from "../components/Tr";
import { MovieMatchContext } from "../store";
import { useAsyncEffect } from "../hooks/useAsyncEffect";

import "./Create.css";

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
        className="LoginScreen_Form"
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

        <div className="CreateScreen_Filter">
          <h2 className="CreateScreen_Filters_Title">Filters</h2>
          <AddRemoveList
            initialChildren={0}
            onRemove={(i) => filters.current.delete(i)}
          >
            {(i) =>
              availableFilters && (
                <FilterField
                  key={i}
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
          >
            <Tr name="BACK" />
          </Button>
          <Button appearance="Primary" onPress={createRoom}>
            <Tr name="CREATE_ROOM" />
          </Button>
        </ButtonContainer>
      </form>
    </Layout>
  );
};
