import {
  createContext,
  useEffect,
  useReducer,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Config } from "../../../types/moviematch.d.ts";
import { getClient, MovieMatchClient } from "./api/moviematch.ts";
import { checkPin } from "./api/plex.tv.ts";

export type ScreenName = "login" | "join" | "createRoom" | "rate";

interface User {
  name: string;
  avatar?: string;
  plexAuth?: {
    clientId: string;
    plexToken: string;
  };
}

export interface Store {
  activeScreen: ScreenName;
  client: MovieMatchClient;
  config?: Config;
  user?: User;
}

const initialState: Store = { activeScreen: "login", client: getClient() };

interface Action<K, P> {
  type: K;
  payload: P;
}

type Actions =
  | Action<"setScreen", ScreenName>
  | Action<"setConfig", Config>
  | Action<"setUser", User>;

function reducer(state: Store, action: Actions): Store {
  switch (action.type) {
    case "setScreen":
      return { ...state, activeScreen: action.payload };
    case "setConfig":
      return { ...state, config: action.payload };
    case "setUser":
      return { ...state, user: action.payload, activeScreen: "join" };
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
    name: userName,
    plexAuth: plexToken && clientId ? { plexToken, clientId } : undefined,
  };
};

export const useStore = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    state.client.waitForMessage("config").then((config) => {
      dispatch({ type: "setConfig", payload: config.payload });
    });
  }, [state.client]);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      let plexAuth: User["plexAuth"];

      if (!user.plexAuth) {
        checkPin()
          .then((_) => {
            plexAuth = _;
          })
          .catch(() => {})
          .finally(() => {
            dispatch({ type: "setUser", payload: user });
          });
      } else {
        dispatch({ type: "setUser", payload: user });
      }
    }
  }, []);

  return [state, dispatch] as const;
};
