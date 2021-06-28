import { assertEquals } from "/deps.ts";
import { Login, LoginError, User } from "/types/moviematch.ts";
import {
  getWebSocket,
  sendMessage,
  startMovieMatch,
  waitForMessage,
} from "../_utils.ts";

Deno.test("can't login if the server isn't set up", async () => {
  const { url, stop } = await startMovieMatch({});
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: {
        userName: "Ted",
      },
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginError");
    assertEquals((msg.payload as LoginError).name, "ServerNotSetUp");
  } finally {
    await stop();
  }
});

Deno.test("errors when the login request is invalid", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
  });
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: { badBadNotGood: true } as unknown as Login,
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginError");
    assertEquals((msg.payload as LoginError).name, "MalformedMessage");
  } finally {
    await stop();
  }
});

Deno.test("Can't login when there are no permitted auth types", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
    permittedAuthTypes: {
      anonymous: [],
      plex: [],
    },
  });
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: {
        userName: "Ted",
      },
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginError");
    assertEquals(
      (msg.payload as LoginError).name,
      "AnonymousLoginNotPermitted",
    );
  } finally {
    await stop();
  }
});

Deno.test("Can login anonymously", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
    permittedAuthTypes: {
      anonymous: ["JoinRoom"],
    },
  });
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: {
        userName: "Ted",
      },
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginSuccess");
    assertEquals(msg.payload as User, {
      id: "anonymous-ted",
      userName: "Ted",
      permissions: ["JoinRoom"],
    });
  } finally {
    await stop();
  }
});

Deno.test("Anonymous usernames are case insensitive", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
    permittedAuthTypes: {
      anonymous: ["JoinRoom"],
    },
  });
  try {
    const ws1 = await getWebSocket(url);
    sendMessage(ws1, {
      type: "login",
      payload: {
        userName: "Ted",
      },
    });
    const msg1 = await waitForMessage(ws1, ["loginSuccess", "loginError"]);
    assertEquals(msg1.type, "loginSuccess");

    const ws2 = await getWebSocket(url);
    sendMessage(ws2, {
      type: "login",
      payload: {
        userName: "Ted",
      },
    });
    const msg2 = await waitForMessage(ws2, ["loginSuccess", "loginError"]);
    assertEquals(msg2.type, "loginError");
    assertEquals((msg2.payload as LoginError).name, "AlreadyConnected");
  } finally {
    await stop();
  }
});
