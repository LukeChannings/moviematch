import {
  createContext,
  useEffect,
  useReducer,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Config, Match, Media } from "../../../types/moviematch.d.ts";
import { getClient, MovieMatchClient } from "./api/moviematch.ts";
import { checkPin } from "./api/plex.tv.ts";
import { useAsyncEffect } from "./hooks/useAsyncEffect.ts";

interface User {
  userName: string;
  avatar?: string;
  plexAuth?: {
    clientId: string;
    plexToken: string;
  };
}

export type Routes =
  | { path: "loading" }
  | { path: "login" }
  | { path: "join"; params?: { errorMessage?: string } }
  | { path: "createRoom"; params: { roomName: string } }
  | { path: "rate" };

export interface Store {
  route: Routes;
  client: MovieMatchClient;
  config?: Config;
  user?: User;
  room?: {
    name: string;
    joined: boolean;
    media?: Media[];
    matches?: Match[];
  };
}

const initialState: Store = {
  route: { path: "loading" },
  client: getClient(),
  room: (() => {
    const roomName = new URLSearchParams(location.search).get("roomName");
    if (roomName) {
      return {
        name: roomName,
        joined: false,
      };
    }
  })(),
};

interface Action<K, P> {
  type: K;
  payload: P;
}

export type Actions =
  | Action<"navigate", Routes>
  | Action<"setConfig", Config>
  | Action<"setUser", User>
  | Action<"setAvatar", string>
  | Action<"setRoom", Store["room"]>
  | Action<"match", Match>;

function reducer(state: Store, action: Actions): Store {
  console.log(action);
  switch (action.type) {
    case "navigate":
      return { ...state, route: action.payload };
    case "setConfig":
      return { ...state, config: action.payload };
    case "setUser":
      return { ...state, user: action.payload };
    case "setAvatar":
      return { ...state, user: { ...state.user!, avatar: action.payload } };
    case "setRoom":
      return { ...state, room: action.payload };
    case "match":
      return {
        ...state,
        room: {
          ...state.room!,
          matches: [...(state.room?.matches ?? []), action.payload],
        },
      };
    default:
      return state;
  }
}

export const MovieMatchContext = createContext<Store>(initialState);

const getStoredUser = (): User | null => {
  const userName = localStorage.getItem("userName");
  const plexToken = localStorage.getItem("plexToken");
  const clientId = localStorage.getItem("plexClientId");

  if (!userName) return null;

  return {
    userName: userName,
    plexAuth: plexToken && clientId ? { plexToken, clientId } : undefined,
  };
};

export const useStore = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const handleMatch = (e: Event) => {
      if (e instanceof MessageEvent) {
        dispatch({ type: "match", payload: e.data.payload });
      }
    };
    state.client.addEventListener("match", handleMatch);
    return () => {
      state.client.removeEventListener("match", handleMatch);
    };
  }, []);
  useAsyncEffect(
    async function getMovieMatchConfigFromServer() {
      const config = await state.client.waitForMessage("config");
      dispatch({ type: "setConfig", payload: config.payload });
    },
    [state.client]
  );

  useAsyncEffect(async function setUserStateWithStoredValue() {
    const user = getStoredUser();
    if (user) {
      // The plex.tv login is a multi-step process and
      // we might have a valid PIN but not have a plexToken yet.
      // Here we're checking for a PIN in the case that a PIN key/value is stored
      // but we don't yet have a token.
      if (!user.plexAuth) {
        try {
          user.plexAuth = await checkPin();
        } catch (err) {
          console.error(err);
        }
      }
      dispatch({ type: "setUser", payload: user });
    } else {
      dispatch({ type: "navigate", payload: { path: "login" } });
    }
  }, []);

  useAsyncEffect(
    async function userNameWasSet() {
      if (state.user?.userName) {
        try {
          const loginSuccess = await state.client.login(state.user);
          dispatch({ type: "setAvatar", payload: loginSuccess.avatarImage });
          dispatch({ type: "navigate", payload: { path: "join" } });
        } catch (loginError) {
          console.error(loginError);
        }
      }
    },
    [state.user?.userName]
  );

  return [state, dispatch] as const;
};
