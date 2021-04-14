import React, { useState } from "react";
import { Field } from "../molecules/Field";
import { Button } from "../atoms/Button";
import { ButtonContainer } from "../layout/ButtonContainer";
import { Layout } from "../layout/Layout";
import { Tr } from "../atoms/Tr";
import styles from "./Join.module.css";
import { useStore } from "../../store/useStore";

export const JoinScreen = () => {
  const [store, dispatch] = useStore();
  const [roomName, setRoomName] = useState<string | undefined>(
    store.room?.name ?? "",
  );
  const [roomNameError] = useState<string | undefined>();
  // const [joinError] = useState<string | undefined>(params?.errorMessage);

  // if (store.room?.name && !params?.errorMessage) {
  //   return (
  //     <Layout>
  //       <Spinner />
  //     </Layout>
  //   );
  // }

  return (
    <Layout>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        {/* {joinError && <ErrorMessage message={joinError} />} */}
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
              dispatch({ type: "logout" });
            }}
            testHandle="logout"
          >
            <Tr name="LOGOUT" />
          </Button>
          <Button
            appearance="Secondary"
            onPress={() => {
              if (roomName) {
                dispatch({ type: "navigate", payload: "createRoom" });
              }
            }}
            testHandle="create-room"
          >
            <Tr name="CREATE_ROOM" />
          </Button>
          <Button
            appearance="Primary"
            onPress={() => {
              if (roomName) {
                dispatch({ type: "joinRoom", payload: { roomName } });
              }
            }}
            type="submit"
            testHandle="join-room"
          >
            <Tr name="JOIN_ROOM" />
          </Button>
        </ButtonContainer>
      </form>
    </Layout>
  );
};
