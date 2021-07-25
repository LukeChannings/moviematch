import { assertEquals } from "/deps.ts";
import { ListRoomsSuccess } from "/types/moviematch.ts";
import {
  getWebSocket,
  sendMessage,
  startMovieMatch,
  waitForMessage,
} from "../_utils.ts";

Deno.test("can delete rooms", async () => {
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
      payload: {
        clientId: "tester!",
        plexToken: Deno.env.get("TEST_PLEX_TOKEN")!,
      },
    });
    assertEquals(
      (await waitForMessage(ws, ["loginSuccess", "loginError"])).type,
      "loginSuccess",
    );
    const roomName = "Test";
    sendMessage(ws, {
      type: "createRoom",
      payload: {
        roomName,
      },
    });
    assertEquals(
      (await waitForMessage(ws, ["createRoomSuccess", "createRoomError"])).type,
      "createRoomSuccess",
    );
    sendMessage(ws, {
      type: "listRooms",
      payload: undefined,
    });
    const listRoomsResponse = await waitForMessage(ws, [
      "listRoomsSuccess",
      "listRoomsError",
    ]);
    assertEquals(listRoomsResponse.type, "listRoomsSuccess");
    assertEquals(
      (listRoomsResponse.payload as ListRoomsSuccess).rooms.length,
      1,
    );
    assertEquals(
      (listRoomsResponse.payload as ListRoomsSuccess).rooms[0].name,
      roomName,
    );

    sendMessage(ws, {
      type: "deleteRoom",
      payload: {
        roomName,
      },
    });
    assertEquals(
      (await waitForMessage(ws, ["deleteRoomSuccess", "deleteRoomError"])).type,
      "deleteRoomSuccess",
    );

    sendMessage(ws, {
      type: "listRooms",
      payload: undefined,
    });
    const listRoomsAgainResponse = await waitForMessage(ws, [
      "listRoomsSuccess",
      "listRoomsError",
    ]);
    assertEquals(listRoomsAgainResponse.type, "listRoomsSuccess");
    assertEquals(
      (listRoomsAgainResponse.payload as ListRoomsSuccess).rooms.length,
      0,
    );
  } finally {
    await stop();
  }
});

Deno.test("can list rooms", async () => {
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
      payload: {
        clientId: "tester!",
        plexToken: Deno.env.get("TEST_PLEX_TOKEN")!,
      },
    });
    assertEquals(
      (await waitForMessage(ws, ["loginSuccess", "loginError"])).type,
      "loginSuccess",
    );
    const roomName = "Test";
    sendMessage(ws, {
      type: "createRoom",
      payload: {
        roomName,
      },
    });
    assertEquals(
      (await waitForMessage(ws, ["createRoomSuccess", "createRoomError"])).type,
      "createRoomSuccess",
    );
    sendMessage(ws, {
      type: "listRooms",
      payload: undefined,
    });
    const listRoomsResponse = await waitForMessage(ws, [
      "listRoomsSuccess",
      "listRoomsError",
    ]);
    assertEquals(listRoomsResponse.type, "listRoomsSuccess");
    assertEquals(
      (listRoomsResponse.payload as ListRoomsSuccess).rooms.length,
      1,
    );
    assertEquals(
      (listRoomsResponse.payload as ListRoomsSuccess).rooms[0].name,
      roomName,
    );
  } finally {
    await stop();
  }
});
