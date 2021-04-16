import React, { useRef, useState } from "react";
import { Formik } from "formik";
import type { Config } from "../../../../../types/moviematch";
import { AddRemoveList } from "../atoms/AddRemoveList";
import { Field } from "../molecules/Field";
import { Layout } from "../layout/Layout";
import type { ScreenProps } from "../layout/Screen";
import { Select } from "../atoms/Select";
import { Button } from "../atoms/Button";
import { ErrorMessage } from "../atoms/ErrorMessage";

export const ConfigScreenFmk = () => (
  <div>
    <h1>Anywhere in your app!</h1>
    <Formik
      initialValues={{ email: "", password: "" }}
      validate={(values) => {
        console.log(values);
        const errors: Record<string, string> = {};
        if (!values.email) {
          errors.email = "Required";
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        ) {
          errors.email = "Invalid email address";
        }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="tmp.email"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
          {errors.email && touched.email && errors.email}
          <input
            type="password"
            name="foo.password.0"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.password}
          />
          {errors.password && touched.password && errors.password}
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </form>
      )}
    </Formik>
  </div>
);

export const ConfigScreen = ({
  navigate,
  dispatch,
  store,
}: ScreenProps<{ roomName: string }>) => {
  const [error, setError] = useState("");
  return (
    <Layout>
      <Formik
        initialValues={store.config?.initialConfiguration ?? {}}
        validate={(values) => {
          console.log(values);
        }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setSubmitting(true);
          const err = await store.client.setup(values as Config);

          setError(err.message);

          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          /* and other goodies */
        }) => (
          <form name="config" className="LoginScreen_Form">
            {error && <ErrorMessage message={error} />}
            <Field
              name="hostname"
              label="Host"
              value={values.hostname}
              errorMessage={errors.hostname}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <Field
              name="port"
              label="Port"
              value={values.port}
              errorMessage={errors.port}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <Field
              name="logLevel"
              label="Log Level"
              errorMessage={errors.logLevel}
            >
              <Select
                name="logLevel"
                value={values.logLevel!}
                options={{
                  DEBUG: "Debug",
                  INFO: "Info",
                  WARNING: "Warning",
                  ERROR: "Error",
                  CRITICAL: "Critical",
                }}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Field>
            <Field
              name="rootPath"
              label="Base Path"
              value={String(values.rootPath)}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <Field name="servers" label="Servers">
              <AddRemoveList>
                {(index) => (
                  <div>
                    <Field
                      name={`servers.${index}.url`}
                      label="URL"
                      value={values.servers![index]?.url ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Field
                      name={`servers.${index}.token`}
                      label="Token"
                      value={values.servers![index]?.token ?? ""}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <Field
                      label="Library Title Filter"
                      name={`servers.${index}.titleFilter`}
                    >
                      <AddRemoveList
                        initialChildren={0}
                        onRemove={(i) => {
                          const newValue = values.servers![
                            index
                          ].libraryTitleFilter!.flatMap((
                            value: any,
                            index: any,
                          ) => index !== i ? value : []);
                          setFieldValue(
                            `servers.${index}.libraryTitleFilter`,
                            newValue,
                          );
                        }}
                      >
                        {(i) => (
                          <Field
                            name={`servers.${index}.libraryTitleFilter.${i}`}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={((values.servers![index] ?? {})
                              .libraryTitleFilter ?? [])[i] ?? ""}
                          />
                        )}
                      </AddRemoveList>
                    </Field>

                    <Field
                      label="Library Type Filter"
                      name={`servers.${index}.typeFilter`}
                    >
                      <AddRemoveList initialChildren={0}>
                        {(i) => (
                          <Select
                            name={`servers.${index}.libraryTypeFilter.${i}`}
                            value={((values.servers![index] ?? {})
                              .libraryTypeFilter ?? [])[i] ?? ""}
                            options={{
                              movie: "Movies",
                              show: "TV Shows",
                              artist: "Music",
                              photo: "Photos",
                            }}
                          />
                        )}
                      </AddRemoveList>
                    </Field>
                    <Field label="Link Type" name={`servers.${index}.linkType`}>
                      <Select
                        name={`servers.${index}.linkType`}
                        value={values.servers![index]?.linkType ?? ""}
                        options={{
                          app: "App",
                          webLocal: "Local Web app",
                          webExternal: "External Web app (plex.tv)",
                        }}
                      />
                    </Field>
                  </div>
                )}
              </AddRemoveList>
            </Field>
            {
              /* <Field name="requirePlexTvLogin" label="Require Plex TV login">
              <Switch />
            </Field> */
            }
            <Button appearance="Primary" onPress={() => handleSubmit()}>
              Configure
            </Button>
          </form>
        )}
      </Formik>
    </Layout>
  );
};
