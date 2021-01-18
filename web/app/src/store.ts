import {
  createContext,
  useEffect,
  useReducer,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import {
  ClientMessage,
  Config,
  Match,
  Media,
  ServerMessage,
  Translations,
} from "../../../types/moviematch.d.ts";
import { getClient, MovieMatchClient } from "./api/moviematch.ts";
import { checkPin } from "./api/plex_tv.ts";
import { Toast } from "./components/Toast.tsx";
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
  translations?: Translations;
  config?: Config;
  user?: User;
  room?: {
    name: string;
    joined: boolean;
    media?: Media[];
    matches?: Match[];
  };
  toasts: Toast[];
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
  toasts: [],
};

interface Action<K, P = null> {
  type: K;
  payload: P;
}

export type Actions =
  | Action<"navigate", Routes>
  | Action<"setConfig", Config>
  | Action<"setUser", User>
  | Action<"setAvatar", string>
  | Action<"setRoom", Store["room"]>
  | Action<"setTranslations", Translations>
  | Action<"match", Match>
  | Action<"addToast", Toast>
  | Action<"removeToast", Toast>
  | Action<"logout">;

function reducer(state: Store, action: Actions): Store {
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
    case "setTranslations":
      return { ...state, translations: action.payload };
    case "match":
      return {
        ...state,
        room: {
          ...state.room!,
          matches: [...(state.room?.matches ?? []), action.payload],
        },
      };
    case "addToast":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
    case "removeToast":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast !== action.payload),
      };
    case "logout": {
      localStorage.removeItem("userName");
      localStorage.removeItem("plexToken");
      localStorage.removeItem("plexClientId");
      location.reload();
    }
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
  const [store, dispatch] = useReducer(reducer, initialState);

  useEffect(function setServerLocale() {
    store.client.setLocale({
      language: navigator.language,
    });
  }, []);

  useEffect(function handleServerMessage() {
    const handleMessage = (e: Event) => {
      const msg: ClientMessage = (e as MessageEvent).data;
      switch (msg.type) {
        case "match":
          dispatch({ type: "match", payload: msg.payload });
          break;
        case "translations":
          dispatch({ type: "setTranslations", payload: msg.payload });
      }
    };
    store.client.addEventListener("message", handleMessage);

    return () => {
      store.client.removeEventListener("message", handleMessage);
    };
  }, []);

  useAsyncEffect(
    async function getMovieMatchConfigFromServer() {
      const config = await store.client.waitForMessage("config");
      dispatch({ type: "setConfig", payload: config.payload });
    },
    [store.client],
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
      if (store.user?.userName) {
        try {
          const loginSuccess = await store.client.login(store.user);
          dispatch({ type: "setAvatar", payload: loginSuccess.avatarImage });
          dispatch({ type: "navigate", payload: { path: "join" } });
        } catch (loginError) {
          console.error(loginError);
        }
      }
    },
    [store.user?.userName],
  );

  return [store, dispatch] as const;
};
