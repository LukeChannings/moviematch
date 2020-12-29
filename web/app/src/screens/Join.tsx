import React, { useState } from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Join.css";
import { Logo } from "../components/Logo.tsx";
import { Field } from "../components/Field.tsx";
import { Button } from "../components/Button.tsx";
import { ButtonContainer } from "../components/ButtonContainer.tsx";
import { MovieMatchClient } from "../api/moviematch.ts";

interface JoinScreenProps {
  handleDone(): void;
}

export const JoinScreen = ({ handleDone }: JoinScreenProps) => {
  const [roomName, setRoomName] = useState<string | undefined>();
  const [roomNameError, setRoomNameError] = useState<string | undefined>();

  return (
    <section className="Screen JoinScreen">
      <Logo />
      <form
        className="JoinScreen_Form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Field
          label="Room Name"
          name="roomName"
          value={roomName}
          errorMessage={roomNameError}
          onChange={setRoomName}
          paddingTop="s4"
        />
        <ButtonContainer paddingTop="s7">
          <Button
            appearance="primary"
            onPress={() => {
              if (!roomName) {
                setRoomNameError("A Room Name is required!");
                return;
              }
            }}
          >
            Join
          </Button>
          <Button appearance="secondary">Create</Button>
        </ButtonContainer>
      </form>
    </section>
  );
};
