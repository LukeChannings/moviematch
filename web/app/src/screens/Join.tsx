import React, { useCallback, useContext, useEffect, useState } from "react";
import "./Join.css";
import { Field } from "../components/Field";
import { Spinner } from "../components/Spinner";
import { Button } from "../components/Button";
import { ButtonContainer } from "../components/ButtonContainer";
import type { ScreenProps } from "../components/Screen";
import { MovieMatchContext } from "../store";
import type {
  JoinRoomError,
  JoinRoomSuccess,
} from "../../../../types/moviematch";
import { Layout } from "../components/Layout";
import { ErrorMessage } from "../components/ErrorMessage";
import { Tr } from "../components/Tr";

export const JoinScreen = ({
  navigate,
  dispatch,
  params,
}: ScreenProps<{ errorMessage?: string } | undefined>) => {
  const store = useContext(MovieMatchContext);
  const [roomName, setRoomName] = useState<string | undefined>(
    store.room?.name ?? "",
  );
  const [roomNameError, setRoomNameError] = useState<string | undefined>();
  const [joinError] = useState<string | undefined>(params?.errorMessage);
  const handleJoin = useCallback(async () => {
    if (roomName) {
      navigate({ path: "loading" });
      dispatch({ type: "setRoom", payload: { name: roomName, joined: false } });
      try {
        const joinMsg: JoinRoomSuccess = await store.client.joinRoom({
          roomName,
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
        const joinRoomError: JoinRoomError = JSON.parse(err.message);

        navigate({
          path: "join",
          params: {
            errorMessage: joinRoomError.message,
          },
        });
      }
    } else {
      setRoomNameError(`Room name is required!`);
    }
  }, [roomName]);

  useEffect(() => {
    if (roomName && !roomNameError && !joinError) {
      handleJoin();
    }
  }, [store.room?.name, roomNameError, joinError]);

  if (store.room?.name && !params?.errorMessage) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <form
        className="JoinScreen_Form"
        onSubmit={(e) => {
          e.preventDefault();
          handleJoin();
        }}
      >
        {joinError && <ErrorMessage message={joinError} />}
        <Field
          label="Room Name"
          name="roomName"
          value={roomName}
          errorMessage={roomNameError}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <ButtonContainer paddingTop="s7" reverseMobile>
          <Button
            appearance="Tertiary"
            onPress={() => {
              dispatch({ type: "logout", payload: null });
            }}
          >
            <Tr name="LOGOUT" />
          </Button>
          <Button
            appearance="Secondary"
            onPress={() => {
              navigate({
                path: "createRoom",
                params: { roomName: roomName ?? "" },
              });
            }}
          >
            <Tr name="CREATE_ROOM" />
          </Button>
          <Button appearance="Primary" onPress={handleJoin} type="submit">
            <Tr name="JOIN_ROOM" />
          </Button>
        </ButtonContainer>
      </form>
    </Layout>
  );
};
