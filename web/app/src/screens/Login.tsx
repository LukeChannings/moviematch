import React, { useContext, useState } from "react";
import "./Login.css";
import { Field } from "../components/Field";
import { Button } from "../components/Button";
import { ButtonContainer } from "../components/ButtonContainer";
import { getPlexCredentials } from "../api/plex_tv";
import { MovieMatchContext } from "../store";
import type { ScreenProps } from "../components/Screen";
import { Layout } from "../components/Layout";
import { Tr } from "../components/Tr";

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
          onChange={(e) => {
            const userName = e.target.value;
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
