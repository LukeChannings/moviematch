import { assertEquals } from "/deps.ts";
import { Login, User } from "/types/moviematch.ts";
import {
  getWebSocket,
  sendMessage,
  startMovieMatch,
  waitForMessage,
} from "../_utils.ts";
import { ExchangeError } from "../../types/_async_exchange.ts";

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
    assertEquals((msg.payload as ExchangeError).name, "ServerNotSetUp");
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
    assertEquals((msg.payload as ExchangeError).name, "MalformedRequest");
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
    assertEquals((msg2.payload as ExchangeError).name, "AlreadyConnected");
  } finally {
    await stop();
  }
});

Deno.test("Login fails for users with no auth types - anonymous", async () => {
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
      (msg.payload as ExchangeError).name,
      "AnonymousLoginNotPermitted",
    );
  } finally {
    await stop();
  }
});
Deno.test("Login fails for users with no auth types - plex", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
    permittedAuthTypes: {
      plex: [],
    },
  });
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: {
        clientId: "MovieMatch tester!",
        plexToken: Deno.env.get("PLEX_USER_ANON_TOKEN")!,
      },
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginError");
    assertEquals((msg.payload as ExchangeError).name, "PlexLoginNotPermitted");
  } finally {
    await stop();
  }
});

Deno.test(
  "Login fails for users with no auth types - plexFriends",
  async () => {
    const { url, stop } = await startMovieMatch({
      servers: [
        {
          url: Deno.env.get("TEST_PLEX_URL")!,
          token: Deno.env.get("TEST_PLEX_TOKEN")!,
          libraryTypeFilter: ["show"],
        },
      ],
      permittedAuthTypes: {
        plexFriends: [],
      },
    });
    try {
      const ws = await getWebSocket(url);
      sendMessage(ws, {
        type: "login",
        payload: {
          clientId: "MovieMatch tester!",
          plexToken: Deno.env.get("PLEX_USER_FRIEND_TOKEN")!,
        },
      });
      const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
      assertEquals(msg.type, "loginError");
      assertEquals(
        (msg.payload as ExchangeError).name,
        "PlexLoginNotPermitted",
      );
    } finally {
      await stop();
    }
  },
);

Deno.test("Login fails for users with no auth types - plexOwner", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
    permittedAuthTypes: {
      plexOwner: [],
    },
  });
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: {
        clientId: "MovieMatch tester!",
        plexToken: Deno.env.get("TEST_PLEX_TOKEN")!,
      },
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginError");
    assertEquals((msg.payload as ExchangeError).name, "PlexLoginNotPermitted");
  } finally {
    await stop();
  }
});

Deno.test("Can login - anonymous", async () => {
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

Deno.test("Can login - plexFriends", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
    permittedAuthTypes: {
      plexFriends: ["JoinRoom"],
    },
  });
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: {
        clientId: "MovieMatch tester!",
        plexToken: Deno.env.get("PLEX_USER_FRIEND_TOKEN")!,
      },
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginSuccess");
    assertEquals(msg.payload, {
      avatarImage: "https://plex.tv/users/582115e98e6a163c/avatar",
      id: "plex-582115e98e6a163c",
      permissions: ["JoinRoom"],
      userName: "CarFriend",
    });
  } finally {
    await stop();
  }
});

Deno.test("Login fails for users with no auth types - plexOwner", async () => {
  const { url, stop } = await startMovieMatch({
    servers: [
      {
        url: Deno.env.get("TEST_PLEX_URL")!,
        token: Deno.env.get("TEST_PLEX_TOKEN")!,
        libraryTypeFilter: ["show"],
      },
    ],
    permittedAuthTypes: {
      plexOwner: ["JoinRoom"],
    },
  });
  try {
    const ws = await getWebSocket(url);
    sendMessage(ws, {
      type: "login",
      payload: {
        clientId: "MovieMatch tester!",
        plexToken: Deno.env.get("TEST_PLEX_TOKEN")!,
      },
    });
    const msg = await waitForMessage(ws, ["loginSuccess", "loginError"]);
    assertEquals(msg.type, "loginSuccess");
    assertEquals(msg.payload, {
      avatarImage: "https://plex.tv/users/1a0dcfc2881c1ad1/avatar",
      id: "plex-1a0dcfc2881c1ad1",
      permissions: ["JoinRoom"],
      userName: "LukeChannings",
    });
  } finally {
    await stop();
  }
});
