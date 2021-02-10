import {
  createContext,
  useEffect,
  useReducer,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import {
  ClientMessage,
  Config,
  Login,
  Match,
  Media,
  ServerMessage,
  Translations,
} from "../../../types/moviematch.d.ts";
import { getClient, MovieMatchClient } from "./api/moviematch.ts";
import { checkPin, PlexPIN, PlexPINExpiredError } from "./api/plex_tv.ts";
import { Toast } from "./components/Toast.tsx";
import { useAsyncEffect } from "./hooks/useAsyncEffect.ts";

interface User {
  userName: string;
  avatar?: string;
  plexAuth?: { clientId: string; plexToken: string } | { pin: PlexPIN };
}

export type Routes =
  | { path: "loading" }
  | { path: "login" }
  | { path: "join"; params?: { errorMessage?: string } }
  | { path: "createRoom"; params: { roomName: string } }
  | { path: "rate" }
  | { path: "config" };

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
  user: ((): User | undefined => {
    const userName = localStorage.getItem("userName");
    const plexToken = localStorage.getItem("plexToken");
    const clientId = localStorage.getItem("plexClientId");
    const plexTvPin = localStorage.getItem("plexTvPin");
    const pin: PlexPIN = JSON.parse(plexTvPin ?? "null");

    if (!userName) return;

    return {
      userName: userName,
      plexAuth: plexToken && clientId
        ? { plexToken, clientId }
        : pin
        ? { pin }
        : undefined,
    };
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

export const useStore = () => {
  const [store, dispatch] = useReducer(reducer, initialState);

  useEffect(function configureClient() {
    store.client.setLocale({ language: navigator.language });

    const handleMessage = (e: Event) => {
      const msg: ClientMessage = (e as MessageEvent).data;
      switch (msg.type) {
        case "config":
          dispatch({ type: "setConfig", payload: msg.payload });
          break;
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
  }, [store.client]);

  useAsyncEffect(async () => {
    if (store.user?.plexAuth && "pin" in store.user.plexAuth) {
      // The plex.tv login is a multi-step process and
      // we might have a valid PIN but not have a plexToken yet.
      // Here we're checking for a PIN in the case that a PIN key/value is stored
      // but we don't yet have a token.
      try {
        store.user!.plexAuth = await checkPin(store.user.plexAuth.pin);
      } catch (err) {
        if (err instanceof PlexPINExpiredError) {
          localStorage.removeItem("plexTvPin");
          alert("The Plex PIN has expired. Please log into Plex again.");
          location.reload();
        }

        console.error(err);
      }
    }

    if (store.user?.userName) {
      try {
        const loginSuccess = await store.client.login(store.user as Login);
        dispatch({
          type: "setUser",
          payload: { ...store.user, avatar: loginSuccess.avatarImage },
        });
        dispatch({ type: "navigate", payload: { path: "join" } });
      } catch (loginError) {
        console.error(loginError);
      }
    }
  }, []);

  useEffect(function setInitialScreen() {
    if (store.user && store.config) {
      let path: Routes["path"];

      if (store.config.requiresConfiguration) {
        path = "config";
      } else if (store.user.userName) {
        path = "join";
      } else {
        path = "login";
      }

      dispatch({ type: "navigate", payload: { path } });
    }
  }, [store.user, store.config]);

  return [store, dispatch] as const;
};
