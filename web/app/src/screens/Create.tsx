import React, {
  useCallback,
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { JoinRoomSuccess } from "../../../../types/moviematch.d.ts";
import { Button } from "../components/Button.tsx";
import { ButtonContainer } from "../components/ButtonContainer.tsx";
import { ErrorMessage } from "../components/ErrorMessage.tsx";
import { Field } from "../components/Field.tsx";
import { FilterField } from "../components/FilterField.tsx";
import { AddRemoveList } from "../components/AddRemoveList.tsx";
import { Layout } from "../components/Layout.tsx";
import { ScreenProps } from "../components/Screen.ts";
import { Tr } from "../components/Tr.tsx";
import { MovieMatchContext } from "../store.ts";

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
  const createRoom = useCallback(async () => {
    if (!roomName) {
      setRoomNameError(translations?.FIELD_REQUIRED_ERROR!);
      return;
    }

    if (roomName) {
      try {
        const joinMsg: JoinRoomSuccess = await client.createRoom({
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
        {createRoomError && <ErrorMessage message={createRoomError} />}
        <Field
          label={<Tr name="LOGIN_ROOM_NAME" />}
          name="roomName"
          value={roomName}
          errorMessage={roomNameError}
          onChange={setRoomName}
        />

        <div className="CreateScreen_Filter">
          <h2 className="CreateScreen_Filters_Title">Filters</h2>
          <AddRemoveList>
            {() => <FilterField onChange={(filter) => console.log(filter)} />}
          </AddRemoveList>
        </div>

        <ButtonContainer reverseMobile>
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
