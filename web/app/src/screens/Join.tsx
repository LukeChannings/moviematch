import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Join.css";
import { Field } from "../components/Field.tsx";
import { Spinner } from "../components/Spinner.tsx";
import { Button } from "../components/Button.tsx";
import { ButtonContainer } from "../components/ButtonContainer.tsx";
import { ScreenProps } from "../components/Screen.ts";
import { MovieMatchContext } from "../store.ts";
import {
  JoinRoomError,
  JoinRoomSuccess,
} from "../../../../types/moviematch.ts";
import { Layout } from "../components/Layout.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";
import { Tr } from "../components/Tr.tsx";

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
