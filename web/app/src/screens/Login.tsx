import React, {
  useContext,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import "./Login.css";
import { Field } from "../components/Field.tsx";
import { Button } from "../components/Button.tsx";
import { ButtonContainer } from "../components/ButtonContainer.tsx";
import { getPlexCredentials } from "../api/plex_tv.ts";
import { MovieMatchContext } from "../store.ts";
import { ScreenProps } from "../components/Screen.ts";
import { Layout } from "../components/Layout.tsx";
import { Tr } from "../components/Tr.tsx";

export const LoginScreen = ({ navigate, dispatch }: ScreenProps) => {
  const { client, config, translations } = useContext(MovieMatchContext);
  const [userName, setUserName] = useState<string | null>(
    localStorage.getItem("userName"),
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
          label={<Tr name="LOGIN_NAME" />}
          name="userName"
          autoComplete="given-name"
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
              appearance="Primary"
              onPress={async () => {
                if (!userName) {
                  setUserNameError(translations?.FIELD_REQUIRED_ERROR!);
                  return;
                }
                dispatch({ type: "setUser", payload: { userName } });
                await client.login({
                  userName,
                });
                navigate({ path: "join" });
              }}
            >
              <Tr name="LOGIN_SIGN_IN" />
            </Button>
          )}
          <Button
            appearance="Primary"
            color="plex-color"
            onPress={async () => {
              if (!userName) {
                setUserNameError(translations?.FIELD_REQUIRED_ERROR!);
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
            <Tr name="LOGIN_SIGN_IN_PLEX" />
          </Button>
        </ButtonContainer>
      </form>
    </Layout>
  );
};
