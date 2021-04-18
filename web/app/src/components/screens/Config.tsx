import React, { useState } from "react";
import { Formik } from "formik";
import { useDispatch } from "react-redux";
import type { Config } from "../../../../../types/moviematch";
import { AddRemoveList } from "../atoms/AddRemoveList";
import { Field } from "../molecules/Field";
import { Layout } from "../layout/Layout";
import { Select } from "../atoms/Select";
import { Button } from "../atoms/Button";
import { ErrorMessage } from "../atoms/ErrorMessage";
import { Dispatch, useSelector } from "../../store";
import styles from "./Config.module.css";

export const ConfigScreen = () => {
  const { config } = useSelector(["config"]);
  const dispatch = useDispatch<Dispatch>();

  const [error] = useState("");
  return (
    <Layout>
      <Formik
        initialValues={config?.initialConfiguration ?? {}}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          dispatch({ type: "setup", payload: values as Config });

          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => (
          <form name="config" className={styles.form}>
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
            <Button appearance="Primary" onPress={() => handleSubmit()}>
              Configure
            </Button>
          </form>
        )}
      </Formik>
    </Layout>
  );
};
