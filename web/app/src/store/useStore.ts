import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { MovieMatchClient } from "../api/moviematch";
import type { ClientMessage } from "../../../../types/moviematch";
import { middleware } from "./middleware";
import { initialState, reducer, Store } from "./reducer";
import type { ClientActions } from "./actions";

const MovieMatchContext = createContext<
  { store: Store; dispatch: React.Dispatch<ClientActions> }
>({ store: initialState, dispatch: () => {} });

const client = new MovieMatchClient();

export const useCreateStore = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const dispatchWithMiddleware = middleware(dispatch, client);

  useEffect(() => {
    dispatch({ type: "updateConnectionStatus", payload: "connecting" });

    client.waitForConnected().then(() => {
      dispatch({ type: "updateConnectionStatus", payload: "connected" });
    });

    client.addEventListener("disconnected", () => {
      dispatch({ type: "updateConnectionStatus", payload: "disconnected" });
    });

    client.addEventListener("message", (e) => {
      dispatchWithMiddleware((e as MessageEvent<ClientMessage>).data);
    });
  }, [client]);

  return [state, dispatchWithMiddleware, MovieMatchContext] as const;
};

export const useStore = () => {
  const { store, dispatch } = useContext(MovieMatchContext);
  return [store, dispatch] as const;
};
