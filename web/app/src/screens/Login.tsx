import React, {
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Login.css";
import { Field } from "../components/Field.tsx";
import { Button } from "../components/Button.tsx";
import { ButtonContainer } from "../components/ButtonContainer.tsx";
import { getPlexCredentials } from "../api/plex.tv.ts";
import { MovieMatchContext } from "../store.ts";
import { ScreenProps } from "../components/Screen.ts";
import { Layout } from "../components/Layout.tsx";

export const LoginScreen = ({ navigate, dispatch }: ScreenProps) => {
  const { client, config } = useContext(MovieMatchContext);
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("userName")
  );
  const [userNameError, setUserNameError] = useState<string | undefined>();

  return (
    <Layout>
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
                dispatch({ type: "setUser", payload: { userName } });
                await client.login({
                  userName,
                });
                navigate({ path: "join" });
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

                navigate({ path: "join" });
              }
            }}
          >
            Sign In with Plex
          </Button>
        </ButtonContainer>
      </form>
    </Layout>
  );
};
