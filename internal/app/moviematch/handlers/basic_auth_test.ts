import { assert, assertEquals, Response, ServerRequest } from "/deps.ts";
import {
  isAuthorized,
  respondRequiringAuth,
} from "/internal/app/moviematch/handlers/basic_auth.ts";

Deno.test("basicAuth -> isAuthorized", () => {
  const req = {
    headers: new Headers([["Authorization", "Basic Zm9vOmJhcg=="]]),
  };

  assert(
    isAuthorized({ userName: "foo", password: "bar" }, req as ServerRequest),
  );

  assert(
    !isAuthorized({ userName: "foo", password: "baz" }, req as ServerRequest),
  );
});

Deno.test("basicAuth -> respondRequiringAuth", () => {
  const response: Response = respondRequiringAuth();

  assert(!!response!);

  assertEquals(response.status, 401);
  assert(response?.headers?.get("WWW-Authenticate"));
});
