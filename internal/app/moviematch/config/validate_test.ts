import { assert } from "/deps.ts";
import { validateConfig } from "/internal/app/moviematch/config/validate.ts";

Deno.test("validateConfig", () => {
  const cases: Array<[unknown, string[]]> = [
    [undefined, ["ConfigMustBeRecord"]],
    [{}, ["ServersMustBeArray"]],
    [{ hostname: 123 }, ["HostNameMustBeString", "ServersMustBeArray"]],
    [{ port: "123" }, ["ServersMustBeArray"]],
    [{ port: "abc" }, ["PortMustBeNumber", "ServersMustBeArray"]],
    [{ port: 123 }, ["ServersMustBeArray"]],
    [{ logLevel: "debug" }, ["ServersMustBeArray"]],
    [{ logLevel: "not a level" }, ["ServersMustBeArray", "LogLevelInvalid"]],
    [{ servers: 123 }, ["ServersMustBeArray"]],
    [{ servers: [] }, ["ServersMustNotBeEmpty"]],
    [{ servers: [undefined] }, ["ServerMustBeRecord"]],
    [{ servers: [{}] }, ["ServerUrlMustBeString", "ServerTokenMustBeString"]],
    [{ servers: [{ url: "localhost" }] }, [
      "ServerUrlInvalid",
      "ServerTokenMustBeString",
    ]],
    [{ servers: [{ url: "localhost", token: "" }] }, [
      "ServerUrlInvalid",
      "ServerTokenMustBeString",
    ]],
    [{ servers: [{ url: "localhost", token: "abc123" }] }, [
      "ServerUrlInvalid",
    ]],
    [{ servers: [{ url: "http://localhost", token: "abc123" }] }, []],
    [{
      servers: [{
        libraryTitleFilter: 123,
        url: "http://localhost",
        token: "abc123",
      }],
    }, ["ServerLibraryTitleFilterInvalid"]],
    [{
      servers: [{
        libraryTitleFilter: ["Movies"],
        url: "http://localhost",
        token: "abc123",
      }],
    }, []],
    [{
      servers: [{
        libraryTypeFilter: ["Movies"],
        url: "http://localhost",
        token: "abc123",
      }],
    }, ["ServerLibraryTypeFilterInvalid"]],
    [{
      servers: [{
        libraryTypeFilter: [123],
        url: "http://localhost",
        token: "abc123",
      }],
    }, ["ServerLibraryTypeFilterInvalid"]],
    [{
      servers: [{
        url: "http://localhost",
        token: "abc123",
        linkType: "app",
      }],
    }, []],
    [{
      servers: [{
        url: "http://localhost",
        token: "abc123",
        linkType: "app",
      }],
    }, []],
    [{
      servers: [{
        url: "http://localhost",
        token: "abc123",
        linkType: "foo",
      }],
    }, ["ServerLinkTypeInvalid"]],
    [{
      rootPath: "/",
    }, ["ServersMustBeArray", "ServerBasePathInvalid"]],
    [{
      rootPath: 123,
    }, ["ServersMustBeArray", "ServerBasePathInvalid"]],
    [{ basicAuth: "luke:test" }, ["ServersMustBeArray", "BasicAuthInvalid"]],
    [{ basicAuth: {} }, [
      "ServersMustBeArray",
      "BasicAuthUserNameInvalid",
      "BasicAuthPasswordInvalid",
    ]],
    [{ basicAuth: { userName: "luke" } }, [
      "ServersMustBeArray",
      "BasicAuthPasswordInvalid",
    ]],
    [{ basicAuth: { userName: "luke", password: "test" } }, [
      "ServersMustBeArray",
    ]],
    [{ tlsConfig: "/foo.crt" }, [
      "TlsConfigInvalid",
      "ServersMustBeArray",
    ]],
    [{ tlsConfig: {} }, [
      "TlsConfigCertFileInvalid",
      "TlsConfigKeyFileInvalid",
      "ServersMustBeArray",
    ]],
    [{ permittedAuthTypes: 123 }, [
      "PermittedAuthTypesInvalid",
      "ServersMustBeArray",
    ]],
    [{ permittedAuthTypes: { foo: "bar" } }, [
      "PermittedAuthTypeUnknownKey",
      "PermittedAuthTypeValueNotArray",
      "ServersMustBeArray",
    ]],
    [{ permittedAuthTypes: { foo: ["bar"] } }, [
      "PermittedAuthTypeUnknownKey",
      "PermittedAuthTypeUnknownPermission",
      "ServersMustBeArray",
    ]],
    [{ permittedAuthTypes: { anonymous: ["JoinRoom"] } }, [
      "ServersMustBeArray",
    ]],
  ];

  for (const [config, expectedErrors] of cases) {
    const actualErrors = (validateConfig(config)?.errors ?? []).map((err) =>
      err.name
    );
    assert(
      expectedErrors.sort().join("") === actualErrors.sort().join(""),
      `Expected ${JSON.stringify(expectedErrors)}, got ${
        JSON.stringify(actualErrors)
      } for '${JSON.stringify(config)}'`,
    );
  }
});
