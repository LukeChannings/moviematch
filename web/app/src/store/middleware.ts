import type { ServerMessage } from "../../../../types/moviematch";
import type { MovieMatchClient } from "../api/moviematch";
import type { Actions } from "./actions";
import * as plex from "../api/plex_tv";

export const middleware = (
  dispatch: React.Dispatch<Actions>,
  client: MovieMatchClient,
) =>
  async (action: Actions) => {
    dispatch(action);

    if (!client) {
      return;
    }

    if (action.type in client) {
      client[action.type as ServerMessage["type"]](
        "payload" in action ? action.payload as any : undefined,
      );
    }

    if (action.type === "plexLogin") {
      plex.signIn();
    }

    if (action.type === "loginSuccess") {
      localStorage.setItem("userName", action.payload.userName!);
    }

    if (action.type === "logout") {
      localStorage.removeItem("userName");
      localStorage.removeItem("plexClientId");
      localStorage.removeItem("plexToken");
    }
  };
