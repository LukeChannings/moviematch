import React, {
  useCallback,
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { JoinRoomSuccess } from "../../../../types/moviematch.d.ts";
import { Button } from "../components/Button.tsx";
import { ButtonContainer } from "../components/ButtonContainer.tsx";
import { Field } from "../components/Field.tsx";
import { Layout } from "../components/Layout.tsx";
import { ScreenProps } from "../components/Screen.ts";
import { MovieMatchContext } from "../state.ts";

export const CreateScreen = ({
  navigate,
  dispatch,
  params: { roomName: initialRoomName },
}: ScreenProps<{ roomName: string }>) => {
  const state = useContext(MovieMatchContext);
  const [roomName, setRoomName] = useState(initialRoomName);
  const [createRoomError, setCreateRoomError] = useState();
  const createRoom = useCallback(async () => {
    if (roomName) {
      try {
        const joinMsg: JoinRoomSuccess = await state.client.createRoom({
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
        setCreateRoomError(err.message);
      }
    }
  }, [roomName]);

  return (
    <Layout>
      <form
        className="LoginScreen_Form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {createRoomError && <p style={{ color: "red" }}>{createRoomError}</p>}
        <Field
          label="Room Name"
          name="roomName"
          value={roomName}
          onChange={setRoomName}
        />

        <ButtonContainer>
          <Button appearance="secondary" onPress={createRoom}>
            Create
          </Button>
        </ButtonContainer>
      </form>
    </Layout>
  );
};
