import React, {
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Login.css";
import { Logo } from "../components/Logo.tsx";
import { Field } from "../components/Field.tsx";
import { Button } from "../components/Button.tsx";
import { ButtonContainer } from "../components/ButtonContainer.tsx";
import { getPlexCredentials } from "../api/plex.tv.ts";
import { MovieMatchContext } from "../state.ts";

interface LoginScreenProps {
  handleDone(): void;
}

export const LoginScreen = ({ handleDone }: LoginScreenProps) => {
  const { client, config } = useContext(MovieMatchContext);
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("userName")
  );
  const [userNameError, setUserNameError] = useState<string | undefined>();

  return (
    <section className="Screen LoginScreen">
      <Logo />
      <form
        className="LoginScreen_Form"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Field
          label="Name"
          name="userName"
          value={userName ?? ""}
          onChange={(userName: string) => {
            setUserName(userName);
            localStorage.setItem("userName", userName);
          }}
          errorMessage={userNameError}
        />

        <ButtonContainer paddingTop="s7">
          {!config?.requirePlexLogin && (
            <Button
              appearance="primary"
              onPress={async () => {
                if (!userName) {
                  setUserNameError("A Username is required!");
                  return;
                }
                await client.login({
                  userName,
                });
                handleDone();
              }}
            >
              Sign In
            </Button>
          )}
          <Button
            appearance="primary"
            color="plex-color"
            onPress={async () => {
              if (!userName) {
                setUserNameError("A Username is required!");
                return;
              }
              const plexAuth = await getPlexCredentials();

              if (plexAuth) {
                await client.login({
                  userName,
                  plexAuth,
                });

                handleDone();
              }
            }}
          >
            Sign In with Plex
          </Button>
        </ButtonContainer>
      </form>
    </section>
  );
};
