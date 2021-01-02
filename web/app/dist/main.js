// src/main.tsx
import React15, {useCallback as useCallback3} from "https://cdn.skypack.dev/react@17.0.1?dts";
import {render} from "https://cdn.skypack.dev/react-dom@17.0.1?dts";

// src/screens/Login.tsx
import React6, {
  useContext,
  useState
} from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/components/Field.tsx
import React from "https://cdn.skypack.dev/react@17.0.1?dts";
var Field2 = ({
  label,
  name,
  value,
  paddingTop,
  onChange,
  errorMessage
}) => /* @__PURE__ */ React.createElement("div", {
  className: `Field ${errorMessage ? "--invalid" : ""}`,
  style: paddingTop ? {marginTop: `var(--${paddingTop})`} : {}
}, /* @__PURE__ */ React.createElement("label", {
  className: "Field_Label",
  htmlFor: `${name}-text-input`
}, label), /* @__PURE__ */ React.createElement("input", {
  className: "Field_Input",
  type: "text",
  name,
  id: `${name}-text-input`,
  value,
  onChange: (e) => {
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }
}), errorMessage && /* @__PURE__ */ React.createElement("p", {
  className: "Field_Error"
}, errorMessage));

// src/components/Button.tsx
import React2 from "https://cdn.skypack.dev/react@17.0.1?dts";
var Button2 = ({
  children,
  onPress,
  appearance,
  paddingTop,
  disabled,
  color
}) => /* @__PURE__ */ React2.createElement("button", {
  className: `Button ${appearance === "primary" ? "ButtonPrimary" : "ButtonSecondary"}`,
  style: {
    ...paddingTop ? {marginTop: `var(--${paddingTop})`} : {},
    ...color ? {"--bg-color": `var(--mm-${color})`} : {}
  },
  onClick: onPress,
  type: "button",
  disabled
}, children);

// src/components/ButtonContainer.tsx
import React3 from "https://cdn.skypack.dev/react@17.0.1?dts";
var ButtonContainer2 = ({
  children,
  paddingTop
}) => /* @__PURE__ */ React3.createElement("div", {
  className: "ButtonContainer",
  style: paddingTop ? {paddingTop: `var(--${paddingTop})`} : {}
}, children);

// src/api/plex.tv.ts
var APP_NAME = "MovieMatch";
var CLIENT_ID = localStorage.getItem("plexClientId") ?? generateClientId();
function generateClientId() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const clientId = Array.from({length: 30}).map((_) => characters[Math.floor(Math.random() * characters.length)]).join("");
  localStorage.setItem("plexClientId", clientId);
  return clientId;
}
var signIn = async () => {
  const pinReq = await fetch(`https://plex.tv/api/v2/pins`, {
    method: "POST",
    headers: {
      accept: "application/json"
    },
    body: new URLSearchParams({
      strong: "true",
      "X-Plex-Product": APP_NAME,
      "X-Plex-Client-Identifier": CLIENT_ID
    })
  });
  if (pinReq.ok) {
    const pin = await pinReq.json();
    localStorage.setItem("plexTvPin", JSON.stringify(pin));
    const search = new URLSearchParams({
      clientID: CLIENT_ID,
      code: pin.code,
      "context[device][product]": APP_NAME,
      forwardUrl: location.href
    });
    location.href = `https://app.plex.tv/auth#?${String(search)}`;
  }
};
var checkPin = async () => {
  const plexTvPin = localStorage.getItem("plexTvPin");
  const pin = JSON.parse(plexTvPin ?? "null");
  if (pin && Number(new Date(pin.expiresAt)) > Date.now() && !pin.authToken) {
    const search = new URLSearchParams({
      strong: "true",
      "X-Plex-Client-Identifier": CLIENT_ID,
      code: pin.code
    });
    const req = await fetch(`https://plex.tv/api/v2/pins/${pin.id}?${String(search)}`, {
      headers: {
        accept: "application/json"
      }
    });
    if (!req.ok) {
      throw new Error(`${req.status}: ${await req.text()}`);
    }
    const data = await req.json();
    if (!data.authToken) {
      throw new Error("Login failed...");
    } else {
      localStorage.removeItem("plexTvPin");
      localStorage.setItem("plexToken", data.authToken);
    }
    return {
      clientId: CLIENT_ID,
      plexToken: data.authToken
    };
  }
};
var getPlexCredentials = async () => {
  const plexTvPin = localStorage.getItem("plexTvPin");
  const pin = JSON.parse(plexTvPin ?? "null");
  if (!pin || Number(new Date(pin.expiresAt)) < Date.now()) {
    await signIn();
    return;
  }
  return await checkPin();
};

// src/state.ts
import {
  createContext,
  useReducer
} from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/api/moviematch.ts
var API_URL = (() => {
  const url = new URL(location.href);
  url.pathname = "/api/ws";
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
})();
var MovieMatchClient = class extends EventTarget {
  constructor() {
    super();
    this.reconnectionAttempts = 0;
    this.handleMessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        this.dispatchEvent(new MessageEvent(msg.type, {data: msg}));
      } catch (err) {
        console.error(err);
      }
    };
    this.waitForConnected = () => {
      if (this.ws.readyState === WebSocket.OPEN) {
        return true;
      }
      return new Promise((resolve) => {
        this.ws.addEventListener("open", () => resolve(true), {once: true});
      });
    };
    this.handleClose = () => {
      console.log(`WebSocket closed!`);
    };
    this.waitForMessage = (type) => {
      return new Promise((resolve) => {
        this.addEventListener(type, (e) => {
          if (e instanceof MessageEvent) {
            resolve(e.data);
          }
        }, {
          once: true
        });
      });
    };
    this.login = async (login) => {
      await this.waitForConnected();
      this.sendMessage({type: "login", payload: login});
      const msg = await Promise.race([
        this.waitForMessage("loginSuccess"),
        this.waitForMessage("loginError")
      ]);
      if (msg.type === "loginError") {
        throw new Error(JSON.stringify(msg.payload));
      }
      return msg.payload;
    };
    this.joinRoom = async (joinRoomRequest) => {
      await this.waitForConnected();
      this.sendMessage({
        type: "joinRoom",
        payload: joinRoomRequest
      });
      const msg = await Promise.race([
        this.waitForMessage("joinRoomSuccess"),
        this.waitForMessage("joinRoomError")
      ]);
      if (msg.type === "joinRoomError") {
        throw new Error(JSON.stringify(msg.payload));
      }
      return msg.payload;
    };
    this.createRoom = async (createRoomRequest) => {
      await this.waitForConnected();
      this.sendMessage({
        type: "createRoom",
        payload: createRoomRequest
      });
      const msg = await Promise.race([
        this.waitForMessage("createRoomSuccess"),
        this.waitForMessage("createRoomError")
      ]);
      if (msg.type === "createRoomError") {
        throw new Error(`${msg.payload.name}: ${msg.payload.message}`);
      }
      return msg.payload;
    };
    this.ws = new WebSocket(API_URL);
    this.ws.addEventListener("message", this.handleMessage);
    this.ws.addEventListener("close", this.handleClose);
  }
  sendMessage(msg) {
    this.ws.send(JSON.stringify(msg));
  }
};
var client;
var getClient = () => {
  if (!client) {
    client = new MovieMatchClient();
  }
  return client;
};

// src/hooks/useAsyncEffect.ts
import {useEffect} from "https://cdn.skypack.dev/react@17.0.1?dts";
var useAsyncEffect = (fn, deps) => {
  return useEffect(() => {
    fn();
  }, deps);
};

// src/state.ts
var initialState = {
  route: {path: "loading"},
  client: getClient(),
  room: (() => {
    const roomName = new URLSearchParams(location.search).get("roomName");
    if (roomName) {
      return {
        name: roomName,
        joined: false
      };
    }
  })()
};
function reducer(state6, action) {
  switch (action.type) {
    case "navigate":
      return {...state6, route: action.payload};
    case "setConfig":
      return {...state6, config: action.payload};
    case "setUser":
      return {...state6, user: action.payload};
    case "setAvatar":
      return {...state6, user: {...state6.user, avatar: action.payload}};
    case "setRoom":
      return {...state6, room: action.payload};
    default:
      return state6;
  }
}
var MovieMatchContext = createContext(initialState);
var getStoredUser = () => {
  const userName = localStorage.getItem("userName");
  const plexToken = localStorage.getItem("plexToken");
  const clientId = localStorage.getItem("plexClientId");
  if (!userName)
    return null;
  return {
    userName,
    plexAuth: plexToken && clientId ? {plexToken, clientId} : void 0
  };
};
var useStore = () => {
  const [state6, dispatch] = useReducer(reducer, initialState);
  useAsyncEffect(async function getMovieMatchConfigFromServer() {
    const config = await state6.client.waitForMessage("config");
    dispatch({type: "setConfig", payload: config.payload});
  }, [state6.client]);
  useAsyncEffect(async function setUserStateWithStoredValue() {
    const user = getStoredUser();
    if (user) {
      if (!user.plexAuth) {
        try {
          user.plexAuth = await checkPin();
        } catch (err) {
          console.error(err);
        }
      }
      dispatch({type: "setUser", payload: user});
    } else {
      dispatch({type: "navigate", payload: {path: "login"}});
    }
  }, []);
  useAsyncEffect(async function userNameWasSet() {
    if (state6.user?.userName) {
      try {
        const loginSuccess = await state6.client.login(state6.user);
        dispatch({type: "setAvatar", payload: loginSuccess.avatarImage});
        dispatch({type: "navigate", payload: {path: "join"}});
      } catch (loginError) {
        console.error(loginError);
      }
    }
  }, [state6.user?.userName]);
  return [state6, dispatch];
};

// src/components/Layout.tsx
import React5 from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/components/Logo.tsx
import React4 from "https://cdn.skypack.dev/react@17.0.1?dts";
var Logo2 = () => /* @__PURE__ */ React4.createElement("svg", {
  class: "Logo",
  viewBox: "0 0 104 20",
  xmlns: "http://www.w3.org/2000/svg"
}, /* @__PURE__ */ React4.createElement("path", {
  d: "M2.888 17V7.982h.036L6.074 17h2.178l3.15-9.108h.036V17h2.646V4.148h-3.978l-2.844 8.838h-.036L4.22 4.148H.242V17h2.646zm17.928.234c.732 0 1.395-.114 1.989-.342a4.236 4.236 0 001.521-.981c.42-.426.744-.939.972-1.539.228-.6.342-1.272.342-2.016s-.114-1.419-.342-2.025a4.358 4.358 0 00-.972-1.548 4.338 4.338 0 00-1.521-.99c-.594-.234-1.257-.351-1.989-.351-.732 0-1.392.117-1.98.351a4.356 4.356 0 00-1.512.99c-.42.426-.744.942-.972 1.548-.228.606-.342 1.281-.342 2.025s.114 1.416.342 2.016c.228.6.552 1.113.972 1.539.42.426.924.753 1.512.981.588.228 1.248.342 1.98.342zm0-1.908c-.432 0-.792-.084-1.08-.252a1.965 1.965 0 01-.693-.675 2.901 2.901 0 01-.369-.954 5.585 5.585 0 010-2.187c.072-.36.195-.678.369-.954.174-.276.405-.501.693-.675.288-.174.648-.261 1.08-.261.432 0 .795.087 1.089.261.294.174.528.399.702.675.174.276.297.594.369.954a5.585 5.585 0 010 2.187 2.901 2.901 0 01-.369.954 1.943 1.943 0 01-.702.675c-.294.168-.657.252-1.089.252zM32.444 17l3.15-9.306h-2.538l-1.962 6.354h-.036l-1.962-6.354h-2.682L29.6 17h2.844zm6.84-10.746V4.148h-2.556v2.106h2.556zm0 10.746V7.694h-2.556V17h2.556zm6.318.234c1.056 0 1.956-.24 2.7-.72.744-.48 1.296-1.278 1.656-2.394h-2.25c-.084.288-.312.561-.684.819-.372.258-.816.387-1.332.387-.72 0-1.272-.186-1.656-.558-.384-.372-.594-.972-.63-1.8h6.714a6.57 6.57 0 00-.18-2.07 5.067 5.067 0 00-.819-1.764 4.131 4.131 0 00-1.449-1.233c-.588-.306-1.278-.459-2.07-.459a4.82 4.82 0 00-1.935.378 4.575 4.575 0 00-1.503 1.035c-.42.438-.744.957-.972 1.557a5.428 5.428 0 00-.342 1.944c0 .72.111 1.38.333 1.98.222.6.537 1.116.945 1.548.408.432.906.765 1.494.999.588.234 1.248.351 1.98.351zm1.962-5.886h-4.158c.012-.18.051-.384.117-.612a1.88 1.88 0 01.99-1.161c.27-.138.609-.207 1.017-.207.624 0 1.089.168 1.395.504.306.336.519.828.639 1.476zM54.548 17V7.982h.036L57.734 17h2.178l3.15-9.108h.036V17h2.646V4.148h-3.978l-2.844 8.838h-.036L55.88 4.148h-3.978V17h2.646zm16.182.234a5.78 5.78 0 001.692-.252 3.33 3.33 0 001.44-.882 3.84 3.84 0 00.18.9h2.592c-.12-.192-.204-.48-.252-.864a9.724 9.724 0 01-.072-1.206v-4.842c0-.564-.126-1.017-.378-1.359a2.59 2.59 0 00-.972-.801 4.35 4.35 0 00-1.314-.387 10.43 10.43 0 00-1.422-.099c-.516 0-1.029.051-1.539.153-.51.102-.969.273-1.377.513-.408.24-.744.558-1.008.954-.264.396-.414.894-.45 1.494h2.556c.048-.504.216-.864.504-1.08.288-.216.684-.324 1.188-.324.228 0 .441.015.639.045s.372.09.522.18c.15.09.27.216.36.378.09.162.135.381.135.657.012.264-.066.465-.234.603-.168.138-.396.243-.684.315a6.82 6.82 0 01-.99.162c-.372.036-.75.084-1.134.144-.384.06-.765.141-1.143.243a3.226 3.226 0 00-1.008.459 2.333 2.333 0 00-.72.819c-.186.342-.279.777-.279 1.305 0 .48.081.894.243 1.242.162.348.387.636.675.864.288.228.624.396 1.008.504.384.108.798.162 1.242.162zm.954-1.692c-.204 0-.402-.018-.594-.054a1.443 1.443 0 01-.504-.189.966.966 0 01-.342-.369 1.202 1.202 0 01-.126-.576c0-.24.042-.438.126-.594.084-.156.195-.285.333-.387.138-.102.3-.183.486-.243s.375-.108.567-.144c.204-.036.408-.066.612-.09a8 8 0 00.585-.09c.186-.036.36-.081.522-.135.162-.054.297-.129.405-.225v.954c0 .144-.015.336-.045.576-.03.24-.111.477-.243.711a1.686 1.686 0 01-.612.603c-.276.168-.666.252-1.17.252zm10.224 1.548c.252 0 .51-.006.774-.018.264-.012.504-.036.72-.072v-1.98a3.58 3.58 0 01-.378.054c-.132.012-.27.018-.414.018-.432 0-.72-.072-.864-.216-.144-.144-.216-.432-.216-.864V9.404h1.872v-1.71H81.53v-2.79h-2.556v2.79h-1.548v1.71h1.548v5.49c0 .468.078.846.234 1.134.156.288.369.51.639.666.27.156.582.261.936.315.354.054.729.081 1.125.081zm7.128.144c1.236 0 2.25-.324 3.042-.972.792-.648 1.272-1.59 1.44-2.826h-2.466c-.084.576-.291 1.035-.621 1.377-.33.342-.801.513-1.413.513-.396 0-.732-.09-1.008-.27a2.017 2.017 0 01-.657-.693 3.174 3.174 0 01-.351-.945 5.055 5.055 0 010-2.079 3.11 3.11 0 01.369-.972c.174-.294.399-.534.675-.72.276-.186.618-.279 1.026-.279 1.092 0 1.722.534 1.89 1.602h2.502c-.036-.6-.18-1.119-.432-1.557a3.517 3.517 0 00-.981-1.098 4.252 4.252 0 00-1.368-.657 5.834 5.834 0 00-1.593-.216c-.756 0-1.428.126-2.016.378a4.243 4.243 0 00-1.494 1.053c-.408.45-.717.984-.927 1.602a6.2 6.2 0 00-.315 2.007c0 .696.114 1.335.342 1.917.228.582.546 1.083.954 1.503.408.42.903.747 1.485.981a5.093 5.093 0 001.917.351zM59 0c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10S53.477 0 59 0zm38.514 4.148V8.99h.054c.324-.54.738-.933 1.242-1.179s.996-.369 1.476-.369c.684 0 1.245.093 1.683.279.438.186.783.444 1.035.774.252.33.429.732.531 1.206a7.5 7.5 0 01.153 1.575V17h-2.556v-5.256c0-.768-.12-1.341-.36-1.719-.24-.378-.666-.567-1.278-.567-.696 0-1.2.207-1.512.621-.312.414-.468 1.095-.468 2.043V17h-2.556V4.148h2.556z",
  fill: "currentColor",
  "fill-rule": "nonzero"
}));

// src/components/Layout.tsx
var Layout = ({children, hideLogo = false}) => /* @__PURE__ */ React5.createElement("section", {
  className: "Screen"
}, !hideLogo && /* @__PURE__ */ React5.createElement(Logo2, null), children);

// src/screens/Login.tsx
var LoginScreen = ({navigate}) => {
  const {client: client2, config} = useContext(MovieMatchContext);
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [userNameError, setUserNameError] = useState();
  return /* @__PURE__ */ React6.createElement(Layout, null, /* @__PURE__ */ React6.createElement("form", {
    className: "LoginScreen_Form",
    onSubmit: (e) => {
      e.preventDefault();
    }
  }, /* @__PURE__ */ React6.createElement(Field2, {
    label: "Name",
    name: "userName",
    value: userName ?? "",
    onChange: (userName2) => {
      setUserName(userName2);
      localStorage.setItem("userName", userName2);
    },
    errorMessage: userNameError
  }), /* @__PURE__ */ React6.createElement(ButtonContainer2, {
    paddingTop: "s7"
  }, !config?.requirePlexLogin && /* @__PURE__ */ React6.createElement(Button2, {
    appearance: "primary",
    onPress: async () => {
      if (!userName) {
        setUserNameError("A Username is required!");
        return;
      }
      await client2.login({
        userName
      });
      navigate({path: "join"});
    }
  }, "Sign In"), /* @__PURE__ */ React6.createElement(Button2, {
    appearance: "primary",
    color: "plex-color",
    onPress: async () => {
      if (!userName) {
        setUserNameError("A Username is required!");
        return;
      }
      const plexAuth = await getPlexCredentials();
      if (plexAuth) {
        await client2.login({
          userName,
          plexAuth
        });
        navigate({path: "join"});
      }
    }
  }, "Sign In with Plex"))));
};

// src/screens/Join.tsx
import React8, {
  useCallback,
  useContext as useContext2,
  useEffect as useEffect2,
  useState as useState2
} from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/components/Spinner.tsx
import React7 from "https://cdn.skypack.dev/react@17.0.1?dts";
var Spinner2 = () => /* @__PURE__ */ React7.createElement("div", {
  className: "Spinner"
});

// src/screens/Join.tsx
var JoinScreen = ({navigate, dispatch}) => {
  const store = useContext2(MovieMatchContext);
  const [roomName, setRoomName] = useState2(store.room?.name ?? "");
  const [roomNameError, setRoomNameError] = useState2();
  const [joinError, setJoinError] = useState2();
  const handleJoin = useCallback(async () => {
    if (roomName) {
      navigate({path: "loading"});
      dispatch({type: "setRoom", payload: {name: roomName, joined: false}});
      try {
        const joinMsg = await store.client.joinRoom({
          roomName
        });
        dispatch({
          type: "setRoom",
          payload: {
            name: roomName,
            joined: true,
            media: joinMsg.media,
            matches: joinMsg.previousMatches
          }
        });
        navigate({path: "rate"});
      } catch (err) {
        setJoinError(err.message);
        navigate({path: "join"});
      }
    } else {
      setRoomNameError(`Room name is required!`);
    }
  }, [roomName]);
  useEffect2(() => {
    if (roomName && !roomNameError) {
      handleJoin();
    }
  }, [store.room?.name, roomNameError]);
  if (store.room?.name) {
    return /* @__PURE__ */ React8.createElement(Layout, null, /* @__PURE__ */ React8.createElement(Spinner2, null));
  }
  return /* @__PURE__ */ React8.createElement(Layout, null, /* @__PURE__ */ React8.createElement("form", {
    className: "JoinScreen_Form",
    onSubmit: (e) => {
      e.preventDefault();
    }
  }, joinError && /* @__PURE__ */ React8.createElement("p", {
    style: {color: "red"}
  }, joinError), /* @__PURE__ */ React8.createElement(Field2, {
    label: "Room Name",
    name: "roomName",
    value: roomName,
    errorMessage: roomNameError,
    onChange: setRoomName,
    paddingTop: "s4"
  }), /* @__PURE__ */ React8.createElement(ButtonContainer2, {
    paddingTop: "s7"
  }, /* @__PURE__ */ React8.createElement(Button2, {
    appearance: "primary",
    onPress: handleJoin
  }, "Join"), /* @__PURE__ */ React8.createElement(Button2, {
    appearance: "secondary",
    onPress: () => {
      navigate({
        path: "createRoom",
        params: {roomName: roomName ?? ""}
      });
    }
  }, "Create"))));
};

// src/screens/Create.tsx
import React9, {
  useCallback as useCallback2,
  useContext as useContext3,
  useState as useState3
} from "https://cdn.skypack.dev/react@17.0.1?dts";
var CreateScreen = ({
  navigate,
  dispatch,
  params: {roomName: initialRoomName}
}) => {
  const state6 = useContext3(MovieMatchContext);
  const [roomName, setRoomName] = useState3(initialRoomName);
  const [createRoomError, setCreateRoomError] = useState3();
  const createRoom = useCallback2(async () => {
    if (roomName) {
      try {
        const joinMsg = await state6.client.createRoom({
          roomName
        });
        dispatch({
          type: "setRoom",
          payload: {
            name: roomName,
            joined: true,
            media: joinMsg.media,
            matches: joinMsg.previousMatches
          }
        });
        navigate({path: "rate"});
      } catch (err) {
        setCreateRoomError(err.message);
      }
    }
  }, [roomName]);
  return /* @__PURE__ */ React9.createElement(Layout, null, /* @__PURE__ */ React9.createElement("form", {
    className: "LoginScreen_Form",
    onSubmit: (e) => {
      e.preventDefault();
    }
  }, createRoomError && /* @__PURE__ */ React9.createElement("p", {
    style: {color: "red"}
  }, createRoomError), /* @__PURE__ */ React9.createElement(Field2, {
    label: "Room Name",
    name: "roomName",
    value: roomName,
    onChange: setRoomName
  }), /* @__PURE__ */ React9.createElement(ButtonContainer2, null, /* @__PURE__ */ React9.createElement(Button2, {
    appearance: "secondary",
    onPress: createRoom
  }, "Create"))));
};

// src/screens/Rate.tsx
import React13, {
  useContext as useContext4,
  useState as useState6
} from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/components/Card.tsx
import React11, {
  forwardRef,
  useState as useState4
} from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/components/InfoIcon.tsx
import React10 from "https://cdn.skypack.dev/react@17.0.1?dts";
var InfoIcon2 = () => /* @__PURE__ */ React10.createElement("svg", {
  className: "InfoIcon",
  viewBox: "0 0 36 37",
  xmlns: "http://www.w3.org/2000/svg"
}, /* @__PURE__ */ React10.createElement("path", {
  d: "M18.016 2.963c2.746 0 5.308.692 7.687 2.075 2.4 1.394 4.28 3.274 5.643 5.64 1.373 2.421 2.06 4.988 2.06 7.7 0 2.745-.687 5.306-2.06 7.683-1.373 2.356-3.254 4.23-5.643 5.624a14.886 14.886 0 01-7.687 2.091c-1.384 0-2.708-.17-3.973-.51a16.102 16.102 0 01-3.713-1.532c-2.357-1.34-4.238-3.22-5.644-5.64-1.394-2.367-2.091-4.939-2.091-7.716 0-2.756.686-5.327 2.06-7.716a15.706 15.706 0 012.44-3.193c.935-.94 2.002-1.75 3.202-2.431a15.148 15.148 0 017.72-2.075zm0 33.407c3.222 0 6.222-.805 9-2.415a17.783 17.783 0 003.722-2.861 18.484 18.484 0 002.846-3.736c1.61-2.756 2.416-5.75 2.416-8.98 0-3.21-.805-6.203-2.416-8.98a18.69 18.69 0 00-2.846-3.744 17.636 17.636 0 00-3.722-2.87 17.646 17.646 0 00-9-2.414c-3.254 0-6.265.805-9.032 2.415a18.13 18.13 0 00-3.73 2.853A17.768 17.768 0 002.4 9.398C.8 12.175 0 15.168 0 18.378c0 3.242.81 6.251 2.432 9.028a17.63 17.63 0 002.87 3.72 18.696 18.696 0 003.747 2.845c2.789 1.6 5.778 2.399 8.967 2.399zM16.168 9.17v13.47h3.68V9.17h-3.68zm1.848 18.722c1.33 0 1.995-.6 1.995-1.8 0-1.2-.665-1.799-1.995-1.799s-1.994.6-1.994 1.8c0 1.199.664 1.799 1.994 1.799z",
  fill: "currentColor",
  fillRule: "nonzero"
}));

// src/components/Card.tsx
var Card2 = forwardRef(({media, index = 0}, ref) => {
  const [showMoreInfo, setShowMoreInfo] = useState4(false);
  const srcSet = [
    `${media.posterUrl}&w=300`,
    `${media.posterUrl}&w=450 1.5x`,
    `${media.posterUrl}&w=600 2x`,
    `${media.posterUrl}&w=900 3x`
  ];
  return /* @__PURE__ */ React11.createElement("div", {
    ref,
    className: "Card",
    style: {"--i": index}
  }, /* @__PURE__ */ React11.createElement("img", {
    className: "Card_Poster",
    src: srcSet[0],
    srcSet: srcSet.join(", "),
    alt: `${media.title} poster`
  }), showMoreInfo ? /* @__PURE__ */ React11.createElement("div", {
    className: "Card_MoreInfo"
  }, /* @__PURE__ */ React11.createElement("p", {
    className: "Card_MoreInfo_Title"
  }, `${media.title}${media.type === "movie" ? ` (${media.year})` : ""}`), /* @__PURE__ */ React11.createElement("p", {
    className: "Card_MoreInfo_Description"
  }, media.description)) : /* @__PURE__ */ React11.createElement("div", {
    className: "Card_Info"
  }, /* @__PURE__ */ React11.createElement("p", {
    className: "Card_Info_Title"
  }, `${media.title}${media.type === "movie" ? ` (${media.year})` : ""}`)), /* @__PURE__ */ React11.createElement("button", {
    className: "Card_MoreInfoButton",
    onClick: () => setShowMoreInfo(!showMoreInfo)
  }, /* @__PURE__ */ React11.createElement(InfoIcon2, null)));
});
Card2.displayName = "Card";

// src/components/CardStack.tsx
import React12, {
  Children,
  useRef as useRef2,
  cloneElement,
  isValidElement,
  useEffect as useEffect4,
  useState as useState5
} from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/hooks/useAnimationFrame.ts
import {useRef, useEffect as useEffect3} from "https://cdn.skypack.dev/react@17.0.1?dts";
var useAnimationFrame = (callback, disabled = false) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();
  const animate = (time) => {
    if (previousTimeRef.current != void 0) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };
  useEffect3(() => {
    if (disabled) {
      return;
    }
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (typeof requestRef.current === "number") {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [disabled]);
};

// src/components/CardStack.tsx
var CardStack2 = ({children, onRate}) => {
  const [swipedCards, setSwipedCards] = useState5(0);
  const cardEls = useRef2(new Map());
  const cardAnimations = useRef2(null);
  const topCardAnimation = useRef2(null);
  const animationTime = useRef2(null);
  useAnimationFrame(() => {
    if (animationTime.current !== null) {
      if (cardAnimations.current !== null) {
        for (const animation of cardAnimations.current) {
          animation.currentTime = animationTime.current;
        }
      }
      if (topCardAnimation.current) {
        topCardAnimation.current.currentTime = animationTime.current;
      }
    }
  });
  useEffect4(function setAnimations() {
    console.log("setting animations", [...cardEls.current.values()]);
    cardAnimations.current = [...cardEls.current.values()].flatMap((cardEl) => cardEl.getAnimations());
    console.log(cardAnimations.current);
    cardAnimations.current.forEach((animation) => animation.pause());
  }, [swipedCards]);
  useEffect4(function handleSwipe() {
    const topCardEl = cardEls?.current.get(0);
    if (!topCardEl) {
      console.error("no top card!");
      return;
    }
    const handlePointerDown = (startEvent) => {
      if (startEvent.pointerType === "mouse" && startEvent.button !== 0 || startEvent.target instanceof HTMLButtonElement) {
        return;
      }
      startEvent.preventDefault();
      topCardEl.setPointerCapture(startEvent.pointerId);
      const animationDuration = 1e3;
      const maxX = window.innerWidth;
      let currentDirection;
      let position = 0;
      const handleMove = (e) => {
        const direction = e.clientX < startEvent.clientX ? "left" : "right";
        const delta = e.clientX - startEvent.clientX;
        position = Math.max(0, Math.min(1, direction === "left" ? Math.abs(delta) / startEvent.clientX : delta / (maxX - startEvent.clientX)));
        if (currentDirection != direction) {
          currentDirection = direction;
          const animation = topCardEl.animate({
            transform: [
              `translate3d(
                    0,
                    calc(var(--y) * var(--i)),
                    calc(var(--z) * var(--i))
                  )
                  rotateX(var(--rotX))`,
              `translate3d(
                    ${direction === "left" ? "-50vw" : "50vw"},
                    calc(var(--y) * var(--i)),
                    calc(var(--z) * var(--i))
                  )
                  rotateX(var(--rotX))`
            ],
            opacity: ["1", "0.8", "0"]
          }, {
            duration: animationDuration,
            easing: "ease-in-out",
            fill: "both"
          });
          animation.pause();
          topCardAnimation.current = animation;
        }
        animationTime.current = position * animationDuration;
      };
      topCardEl.addEventListener("pointermove", handleMove, {
        passive: true
      });
      topCardEl.addEventListener("lostpointercapture", async () => {
        topCardEl.removeEventListener("pointermove", handleMove);
        animationTime.current = null;
        cardAnimations.current?.forEach((animation) => {
          animation.reverse();
        });
        topCardAnimation.current?.play();
        await topCardAnimation.current?.finish();
        onRate("like");
        setSwipedCards(swipedCards + 1);
        console.log("rating");
      }, {once: true});
    };
    const handleTouchStart = (e) => e.preventDefault();
    topCardEl.addEventListener("touchstart", handleTouchStart);
    topCardEl.addEventListener("pointerdown", handlePointerDown);
    return () => {
      topCardEl.removeEventListener("pointerdown", handlePointerDown);
      topCardEl.removeEventListener("touchstart", handleTouchStart);
    };
  }, [swipedCards]);
  return /* @__PURE__ */ React12.createElement("div", {
    className: "CardStack"
  }, Children.map(children, (child, index) => {
    if (isValidElement(child)) {
      if (child.type?.displayName === "Card") {
        return cloneElement(child, {
          ref: (cardEl) => {
            cardEls.current.set(index, cardEl);
          }
        });
      }
      return child;
    }
    return null;
  }));
};

// src/screens/Rate.tsx
var RateScreen = () => {
  const state6 = useContext4(MovieMatchContext);
  const [currentIndex, setIndex] = useState6(0);
  if (!state6.room || !state6.room.media) {
    return /* @__PURE__ */ React13.createElement("p", {
      style: {color: "red"}
    }, "No Room!");
  }
  return /* @__PURE__ */ React13.createElement(Layout, {
    hideLogo: true
  }, /* @__PURE__ */ React13.createElement(CardStack2, {
    onRate: () => {
      setIndex(currentIndex + 1);
    }
  }, state6.room.media.slice(currentIndex, currentIndex + 5).map((media, i) => /* @__PURE__ */ React13.createElement(Card2, {
    media,
    key: media.id,
    index: i
  }))));
};

// src/screens/Loading.tsx
import React14 from "https://cdn.skypack.dev/react@17.0.1?dts";
var Loading = () => /* @__PURE__ */ React14.createElement(Layout, null, /* @__PURE__ */ React14.createElement(Spinner2, null));

// src/main.tsx
var MovieMatch = () => {
  const [store, dispatch] = useStore();
  const navigate = useCallback3(async function navigate2(route) {
    dispatch({type: "navigate", payload: route});
  }, []);
  return /* @__PURE__ */ React15.createElement(MovieMatchContext.Provider, {
    value: store
  }, (() => {
    const routes = {
      loading: Loading,
      login: LoginScreen,
      join: JoinScreen,
      createRoom: CreateScreen,
      rate: RateScreen
    };
    const CurrentComponent = routes[store.route.path];
    return /* @__PURE__ */ React15.createElement(CurrentComponent, {
      navigate,
      dispatch,
      params: "params" in store.route ? store.route.params : void 0
    });
  })());
};
render(/* @__PURE__ */ React15.createElement(MovieMatch, null), document.getElementById("app"));
if (window.innerHeight !== document.querySelector("body")?.getBoundingClientRect().height) {
  document.body.style.setProperty("--vh", window.innerHeight / 100 + "px");
  window.addEventListener("resize", () => {
    document.body.style.setProperty("--vh", window.innerHeight / 100 + "px");
  });
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL21haW4udHN4IiwgIi4uL3NyYy9zY3JlZW5zL0xvZ2luLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9GaWVsZC50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvQnV0dG9uLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9CdXR0b25Db250YWluZXIudHN4IiwgIi4uL3NyYy9hcGkvcGxleC50di50cyIsICIuLi9zcmMvc3RhdGUudHMiLCAiLi4vc3JjL2FwaS9tb3ZpZW1hdGNoLnRzIiwgIi4uL3NyYy9ob29rcy91c2VBc3luY0VmZmVjdC50cyIsICIuLi9zcmMvY29tcG9uZW50cy9MYXlvdXQudHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL0xvZ28udHN4IiwgIi4uL3NyYy9zY3JlZW5zL0pvaW4udHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL1NwaW5uZXIudHN4IiwgIi4uL3NyYy9zY3JlZW5zL0NyZWF0ZS50c3giLCAiLi4vc3JjL3NjcmVlbnMvUmF0ZS50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvQ2FyZC50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvSW5mb0ljb24udHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL0NhcmRTdGFjay50c3giLCAiLi4vc3JjL2hvb2tzL3VzZUFuaW1hdGlvbkZyYW1lLnRzIiwgIi4uL3NyYy9zY3JlZW5zL0xvYWRpbmcudHN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2sgfSBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuaW1wb3J0IHsgcmVuZGVyIH0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0LWRvbUAxNy4wLjE/ZHRzXCI7XG5cbmltcG9ydCBcIi4vbWFpbi5jc3NcIjtcblxuaW1wb3J0IFwiLi9jb21wb25lbnRzL1NjcmVlbi50c1wiO1xuXG5pbXBvcnQgeyBMb2dpblNjcmVlbiB9IGZyb20gXCIuL3NjcmVlbnMvTG9naW4udHN4XCI7XG5pbXBvcnQgeyBKb2luU2NyZWVuIH0gZnJvbSBcIi4vc2NyZWVucy9Kb2luLnRzeFwiO1xuaW1wb3J0IHsgQ3JlYXRlU2NyZWVuIH0gZnJvbSBcIi4vc2NyZWVucy9DcmVhdGUudHN4XCI7XG5pbXBvcnQgeyBSYXRlU2NyZWVuIH0gZnJvbSBcIi4vc2NyZWVucy9SYXRlLnRzeFwiO1xuaW1wb3J0IHsgTW92aWVNYXRjaENvbnRleHQsIFJvdXRlcywgdXNlU3RvcmUgfSBmcm9tIFwiLi9zdGF0ZS50c1wiO1xuaW1wb3J0IHsgU2NyZWVuUHJvcHMgfSBmcm9tIFwiLi9jb21wb25lbnRzL1NjcmVlbi50c1wiO1xuaW1wb3J0IHsgTG9hZGluZyB9IGZyb20gXCIuL3NjcmVlbnMvTG9hZGluZy50c3hcIjtcblxuY29uc3QgTW92aWVNYXRjaCA9ICgpID0+IHtcbiAgY29uc3QgW3N0b3JlLCBkaXNwYXRjaF0gPSB1c2VTdG9yZSgpO1xuICBjb25zdCBuYXZpZ2F0ZSA9IHVzZUNhbGxiYWNrKGFzeW5jIGZ1bmN0aW9uIG5hdmlnYXRlKHJvdXRlOiBSb3V0ZXMpIHtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IFwibmF2aWdhdGVcIiwgcGF5bG9hZDogcm91dGUgfSk7XG4gIH0sIFtdKTtcblxuICByZXR1cm4gKFxuICAgIDxNb3ZpZU1hdGNoQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17c3RvcmV9PlxuICAgICAgeygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvdXRlczogUmVjb3JkPFxuICAgICAgICAgIFJvdXRlc1tcInBhdGhcIl0sXG4gICAgICAgICAgKHByb3BzOiBTY3JlZW5Qcm9wczxhbnk+KSA9PiBKU1guRWxlbWVudFxuICAgICAgICA+ID0ge1xuICAgICAgICAgIGxvYWRpbmc6IExvYWRpbmcsXG4gICAgICAgICAgbG9naW46IExvZ2luU2NyZWVuLFxuICAgICAgICAgIGpvaW46IEpvaW5TY3JlZW4sXG4gICAgICAgICAgY3JlYXRlUm9vbTogQ3JlYXRlU2NyZWVuLFxuICAgICAgICAgIHJhdGU6IFJhdGVTY3JlZW4sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IEN1cnJlbnRDb21wb25lbnQgPSByb3V0ZXNbc3RvcmUucm91dGUucGF0aF07XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPEN1cnJlbnRDb21wb25lbnRcbiAgICAgICAgICAgIG5hdmlnYXRlPXtuYXZpZ2F0ZX1cbiAgICAgICAgICAgIGRpc3BhdGNoPXtkaXNwYXRjaH1cbiAgICAgICAgICAgIHBhcmFtcz17XCJwYXJhbXNcIiBpbiBzdG9yZS5yb3V0ZSA/IHN0b3JlLnJvdXRlLnBhcmFtcyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgfSkoKX1cbiAgICA8L01vdmllTWF0Y2hDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufTtcblxucmVuZGVyKDxNb3ZpZU1hdGNoIC8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKSk7XG5cbmlmIChcbiAgd2luZG93LmlubmVySGVpZ2h0ICE9PVxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKT8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0XG4pIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdmhcIiwgd2luZG93LmlubmVySGVpZ2h0IC8gMTAwICsgXCJweFwiKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoXCItLXZoXCIsIHdpbmRvdy5pbm5lckhlaWdodCAvIDEwMCArIFwicHhcIik7XG4gIH0pO1xufVxuIiwgImltcG9ydCBSZWFjdCwge1xuICB1c2VDb250ZXh0LFxuICB1c2VTdGF0ZSxcbn0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcbmltcG9ydCBcIi4vTG9naW4uY3NzXCI7XG5pbXBvcnQgeyBGaWVsZCB9IGZyb20gXCIuLi9jb21wb25lbnRzL0ZpZWxkLnRzeFwiO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvQnV0dG9uLnRzeFwiO1xuaW1wb3J0IHsgQnV0dG9uQ29udGFpbmVyIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvQnV0dG9uQ29udGFpbmVyLnRzeFwiO1xuaW1wb3J0IHsgZ2V0UGxleENyZWRlbnRpYWxzIH0gZnJvbSBcIi4uL2FwaS9wbGV4LnR2LnRzXCI7XG5pbXBvcnQgeyBNb3ZpZU1hdGNoQ29udGV4dCB9IGZyb20gXCIuLi9zdGF0ZS50c1wiO1xuaW1wb3J0IHsgU2NyZWVuUHJvcHMgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9TY3JlZW4udHNcIjtcbmltcG9ydCB7IExheW91dCB9IGZyb20gXCIuLi9jb21wb25lbnRzL0xheW91dC50c3hcIjtcblxuZXhwb3J0IGNvbnN0IExvZ2luU2NyZWVuID0gKHsgbmF2aWdhdGUgfTogU2NyZWVuUHJvcHMpID0+IHtcbiAgY29uc3QgeyBjbGllbnQsIGNvbmZpZyB9ID0gdXNlQ29udGV4dChNb3ZpZU1hdGNoQ29udGV4dCk7XG4gIGNvbnN0IFt1c2VyTmFtZSwgc2V0VXNlck5hbWVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4oXG4gICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyTmFtZVwiKVxuICApO1xuICBjb25zdCBbdXNlck5hbWVFcnJvciwgc2V0VXNlck5hbWVFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCB1bmRlZmluZWQ+KCk7XG5cbiAgcmV0dXJuIChcbiAgICA8TGF5b3V0PlxuICAgICAgPGZvcm1cbiAgICAgICAgY2xhc3NOYW1lPVwiTG9naW5TY3JlZW5fRm9ybVwiXG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPEZpZWxkXG4gICAgICAgICAgbGFiZWw9XCJOYW1lXCJcbiAgICAgICAgICBuYW1lPVwidXNlck5hbWVcIlxuICAgICAgICAgIHZhbHVlPXt1c2VyTmFtZSA/PyBcIlwifVxuICAgICAgICAgIG9uQ2hhbmdlPXsodXNlck5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgc2V0VXNlck5hbWUodXNlck5hbWUpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyTmFtZVwiLCB1c2VyTmFtZSk7XG4gICAgICAgICAgfX1cbiAgICAgICAgICBlcnJvck1lc3NhZ2U9e3VzZXJOYW1lRXJyb3J9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPEJ1dHRvbkNvbnRhaW5lciBwYWRkaW5nVG9wPVwiczdcIj5cbiAgICAgICAgICB7IWNvbmZpZz8ucmVxdWlyZVBsZXhMb2dpbiAmJiAoXG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGFwcGVhcmFuY2U9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgb25QcmVzcz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdXNlck5hbWUpIHtcbiAgICAgICAgICAgICAgICAgIHNldFVzZXJOYW1lRXJyb3IoXCJBIFVzZXJuYW1lIGlzIHJlcXVpcmVkIVwiKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LmxvZ2luKHtcbiAgICAgICAgICAgICAgICAgIHVzZXJOYW1lLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG5hdmlnYXRlKHsgcGF0aDogXCJqb2luXCIgfSk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFNpZ24gSW5cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICl9XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgYXBwZWFyYW5jZT1cInByaW1hcnlcIlxuICAgICAgICAgICAgY29sb3I9XCJwbGV4LWNvbG9yXCJcbiAgICAgICAgICAgIG9uUHJlc3M9e2FzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKCF1c2VyTmFtZSkge1xuICAgICAgICAgICAgICAgIHNldFVzZXJOYW1lRXJyb3IoXCJBIFVzZXJuYW1lIGlzIHJlcXVpcmVkIVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY29uc3QgcGxleEF1dGggPSBhd2FpdCBnZXRQbGV4Q3JlZGVudGlhbHMoKTtcblxuICAgICAgICAgICAgICBpZiAocGxleEF1dGgpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQubG9naW4oe1xuICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXG4gICAgICAgICAgICAgICAgICBwbGV4QXV0aCxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIG5hdmlnYXRlKHsgcGF0aDogXCJqb2luXCIgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgU2lnbiBJbiB3aXRoIFBsZXhcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9CdXR0b25Db250YWluZXI+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9MYXlvdXQ+XG4gICk7XG59O1xuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuaW1wb3J0IFwiLi9GaWVsZC5jc3NcIjtcblxuaW50ZXJmYWNlIEZpZWxkUHJvcHMge1xuICBuYW1lOiBzdHJpbmc7XG4gIHZhbHVlPzogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xuICBwYWRkaW5nVG9wPzogXCJzMVwiIHwgXCJzMlwiIHwgXCJzM1wiIHwgXCJzNFwiIHwgXCJzNVwiIHwgXCJzNlwiIHwgXCJzN1wiO1xuICBvbkNoYW5nZT8odmFsdWU6IHN0cmluZyk6IHZvaWQ7XG4gIGVycm9yTWVzc2FnZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGNvbnN0IEZpZWxkID0gKHtcbiAgbGFiZWwsXG4gIG5hbWUsXG4gIHZhbHVlLFxuICBwYWRkaW5nVG9wLFxuICBvbkNoYW5nZSxcbiAgZXJyb3JNZXNzYWdlLFxufTogRmllbGRQcm9wcykgPT4gKFxuICA8ZGl2XG4gICAgY2xhc3NOYW1lPXtgRmllbGQgJHtlcnJvck1lc3NhZ2UgPyBcIi0taW52YWxpZFwiIDogXCJcIn1gfVxuICAgIHN0eWxlPXtwYWRkaW5nVG9wID8geyBtYXJnaW5Ub3A6IGB2YXIoLS0ke3BhZGRpbmdUb3B9KWAgfSA6IHt9fVxuICA+XG4gICAgPGxhYmVsIGNsYXNzTmFtZT1cIkZpZWxkX0xhYmVsXCIgaHRtbEZvcj17YCR7bmFtZX0tdGV4dC1pbnB1dGB9PlxuICAgICAge2xhYmVsfVxuICAgIDwvbGFiZWw+XG4gICAgPGlucHV0XG4gICAgICBjbGFzc05hbWU9XCJGaWVsZF9JbnB1dFwiXG4gICAgICB0eXBlPVwidGV4dFwiXG4gICAgICBuYW1lPXtuYW1lfVxuICAgICAgaWQ9e2Ake25hbWV9LXRleHQtaW5wdXRgfVxuICAgICAgdmFsdWU9e3ZhbHVlfVxuICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2Ygb25DaGFuZ2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIG9uQ2hhbmdlKGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfX1cbiAgICAvPlxuICAgIHtlcnJvck1lc3NhZ2UgJiYgPHAgY2xhc3NOYW1lPVwiRmllbGRfRXJyb3JcIj57ZXJyb3JNZXNzYWdlfTwvcD59XG4gIDwvZGl2PlxuKTtcbiIsICJpbXBvcnQgUmVhY3QgZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcbmltcG9ydCB7IENvbG9yLCBTcGFjaW5nIH0gZnJvbSBcIi4uL3R5cGVzLnRzXCI7XG5pbXBvcnQgXCIuL0J1dHRvbi5jc3NcIjtcblxuaW50ZXJmYWNlIEJ1dHRvblByb3BzIHtcbiAgYXBwZWFyYW5jZTogXCJwcmltYXJ5XCIgfCBcInNlY29uZGFyeVwiO1xuICBjaGlsZHJlbjogc3RyaW5nO1xuICBwYWRkaW5nVG9wPzogU3BhY2luZztcbiAgb25QcmVzcz8oZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQ7XG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgY29sb3I/OiBDb2xvcjtcbn1cblxuZXhwb3J0IGNvbnN0IEJ1dHRvbiA9ICh7XG4gIGNoaWxkcmVuLFxuICBvblByZXNzLFxuICBhcHBlYXJhbmNlLFxuICBwYWRkaW5nVG9wLFxuICBkaXNhYmxlZCxcbiAgY29sb3IsXG59OiBCdXR0b25Qcm9wcykgPT4gKFxuICA8YnV0dG9uXG4gICAgY2xhc3NOYW1lPXtgQnV0dG9uICR7XG4gICAgICBhcHBlYXJhbmNlID09PSBcInByaW1hcnlcIiA/IFwiQnV0dG9uUHJpbWFyeVwiIDogXCJCdXR0b25TZWNvbmRhcnlcIlxuICAgIH1gfVxuICAgIHN0eWxlPXt7XG4gICAgICAuLi4ocGFkZGluZ1RvcCA/IHsgbWFyZ2luVG9wOiBgdmFyKC0tJHtwYWRkaW5nVG9wfSlgIH0gOiB7fSksXG4gICAgICAuLi4oY29sb3IgPyB7IFwiLS1iZy1jb2xvclwiOiBgdmFyKC0tbW0tJHtjb2xvcn0pYCB9IDoge30pLFxuICAgIH19XG4gICAgb25DbGljaz17b25QcmVzc31cbiAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gID5cbiAgICB7Y2hpbGRyZW59XG4gIDwvYnV0dG9uPlxuKTtcbiIsICJpbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcblxuaW1wb3J0IFwiLi9CdXR0b25Db250YWluZXIuY3NzXCI7XG5cbmludGVyZmFjZSBCdXR0b25Db250YWluZXJQcm9wcyB7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG4gIHBhZGRpbmdUb3A/OiBcInMxXCIgfCBcInMyXCIgfCBcInMzXCIgfCBcInM0XCIgfCBcInM1XCIgfCBcInM2XCIgfCBcInM3XCI7XG59XG5cbmV4cG9ydCBjb25zdCBCdXR0b25Db250YWluZXIgPSAoe1xuICBjaGlsZHJlbixcbiAgcGFkZGluZ1RvcCxcbn06IEJ1dHRvbkNvbnRhaW5lclByb3BzKSA9PiAoXG4gIDxkaXZcbiAgICBjbGFzc05hbWU9XCJCdXR0b25Db250YWluZXJcIlxuICAgIHN0eWxlPXtwYWRkaW5nVG9wID8geyBwYWRkaW5nVG9wOiBgdmFyKC0tJHtwYWRkaW5nVG9wfSlgIH0gOiB7fX1cbiAgPlxuICAgIHtjaGlsZHJlbn1cbiAgPC9kaXY+XG4pO1xuIiwgIi8qKlxuICogcGxleC50diBBdXRoZW50aWNhdGlvblxuICogU2VlIC0gaHR0cHM6Ly9mb3J1bXMucGxleC50di90L2F1dGhlbnRpY2F0aW5nLXdpdGgtcGxleC82MDkzNzBcbiAqL1xuaW1wb3J0IHsgTG9naW4gfSBmcm9tIFwiLi4vLi4vLi4vLi4vdHlwZXMvbW92aWVtYXRjaC5kLnRzXCI7XG5cbmNvbnN0IEFQUF9OQU1FID0gXCJNb3ZpZU1hdGNoXCI7XG5jb25zdCBDTElFTlRfSUQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInBsZXhDbGllbnRJZFwiKSA/PyBnZW5lcmF0ZUNsaWVudElkKCk7XG5cbmludGVyZmFjZSBQbGV4UElOIHtcbiAgaWQ6IHN0cmluZztcbiAgY29kZTogc3RyaW5nO1xuICBhdXRoVG9rZW46IHN0cmluZyB8IG51bGw7XG4gIGV4cGlyZXNBdDogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUNsaWVudElkKCkge1xuICBjb25zdCBjaGFyYWN0ZXJzID1cbiAgICBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCI7XG4gIGNvbnN0IGNsaWVudElkID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMzAgfSlcbiAgICAubWFwKChfKSA9PiBjaGFyYWN0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJhY3RlcnMubGVuZ3RoKV0pXG4gICAgLmpvaW4oXCJcIik7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwicGxleENsaWVudElkXCIsIGNsaWVudElkKTtcbiAgcmV0dXJuIGNsaWVudElkO1xufVxuXG5leHBvcnQgY29uc3Qgc2lnbkluID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCBwaW5SZXEgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9wbGV4LnR2L2FwaS92Mi9waW5zYCwge1xuICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgaGVhZGVyczoge1xuICAgICAgYWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICB9LFxuICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuICAgICAgc3Ryb25nOiBcInRydWVcIixcbiAgICAgIFwiWC1QbGV4LVByb2R1Y3RcIjogQVBQX05BTUUsXG4gICAgICBcIlgtUGxleC1DbGllbnQtSWRlbnRpZmllclwiOiBDTElFTlRfSUQsXG4gICAgfSksXG4gIH0pO1xuXG4gIGlmIChwaW5SZXEub2spIHtcbiAgICBjb25zdCBwaW46IFBsZXhQSU4gPSBhd2FpdCBwaW5SZXEuanNvbigpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwbGV4VHZQaW5cIiwgSlNPTi5zdHJpbmdpZnkocGluKSk7XG5cbiAgICBjb25zdCBzZWFyY2ggPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgIGNsaWVudElEOiBDTElFTlRfSUQsXG4gICAgICBjb2RlOiBwaW4uY29kZSxcbiAgICAgIFwiY29udGV4dFtkZXZpY2VdW3Byb2R1Y3RdXCI6IEFQUF9OQU1FLFxuICAgICAgZm9yd2FyZFVybDogbG9jYXRpb24uaHJlZixcbiAgICB9KTtcblxuICAgIGxvY2F0aW9uLmhyZWYgPSBgaHR0cHM6Ly9hcHAucGxleC50di9hdXRoIz8ke1N0cmluZyhzZWFyY2gpfWA7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja1BpbiA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgcGxleFR2UGluID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJwbGV4VHZQaW5cIik7XG4gIGNvbnN0IHBpbjogUGxleFBJTiA9IEpTT04ucGFyc2UocGxleFR2UGluID8/IFwibnVsbFwiKTtcblxuICBpZiAocGluICYmIE51bWJlcihuZXcgRGF0ZShwaW4uZXhwaXJlc0F0KSkgPiBEYXRlLm5vdygpICYmICFwaW4uYXV0aFRva2VuKSB7XG4gICAgY29uc3Qgc2VhcmNoID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICBzdHJvbmc6IFwidHJ1ZVwiLFxuICAgICAgXCJYLVBsZXgtQ2xpZW50LUlkZW50aWZpZXJcIjogQ0xJRU5UX0lELFxuICAgICAgY29kZTogcGluLmNvZGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXEgPSBhd2FpdCBmZXRjaChcbiAgICAgIGBodHRwczovL3BsZXgudHYvYXBpL3YyL3BpbnMvJHtwaW4uaWR9PyR7U3RyaW5nKHNlYXJjaCl9YCxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICk7XG5cbiAgICBpZiAoIXJlcS5vaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke3JlcS5zdGF0dXN9OiAke2F3YWl0IHJlcS50ZXh0KCl9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YTogUGxleFBJTiA9IGF3YWl0IHJlcS5qc29uKCk7XG5cbiAgICBpZiAoIWRhdGEuYXV0aFRva2VuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJMb2dpbiBmYWlsZWQuLi5cIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwicGxleFR2UGluXCIpO1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwbGV4VG9rZW5cIiwgZGF0YS5hdXRoVG9rZW4pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjbGllbnRJZDogQ0xJRU5UX0lELFxuICAgICAgcGxleFRva2VuOiBkYXRhLmF1dGhUb2tlbixcbiAgICB9O1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0UGxleENyZWRlbnRpYWxzID0gYXN5bmMgKCk6IFByb21pc2U8TG9naW5bXCJwbGV4QXV0aFwiXT4gPT4ge1xuICBjb25zdCBwbGV4VHZQaW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInBsZXhUdlBpblwiKTtcblxuICBjb25zdCBwaW46IFBsZXhQSU4gPSBKU09OLnBhcnNlKHBsZXhUdlBpbiA/PyBcIm51bGxcIik7XG5cbiAgaWYgKCFwaW4gfHwgTnVtYmVyKG5ldyBEYXRlKHBpbi5leHBpcmVzQXQpKSA8IERhdGUubm93KCkpIHtcbiAgICBhd2FpdCBzaWduSW4oKTtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gYXdhaXQgY2hlY2tQaW4oKTtcbn07XG4iLCAiaW1wb3J0IHtcbiAgY3JlYXRlQ29udGV4dCxcbiAgdXNlUmVkdWNlcixcbn0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcbmltcG9ydCB7IENvbmZpZywgTWF0Y2gsIE1lZGlhIH0gZnJvbSBcIi4uLy4uLy4uL3R5cGVzL21vdmllbWF0Y2guZC50c1wiO1xuaW1wb3J0IHsgZ2V0Q2xpZW50LCBNb3ZpZU1hdGNoQ2xpZW50IH0gZnJvbSBcIi4vYXBpL21vdmllbWF0Y2gudHNcIjtcbmltcG9ydCB7IGNoZWNrUGluIH0gZnJvbSBcIi4vYXBpL3BsZXgudHYudHNcIjtcbmltcG9ydCB7IHVzZUFzeW5jRWZmZWN0IH0gZnJvbSBcIi4vaG9va3MvdXNlQXN5bmNFZmZlY3QudHNcIjtcbmltcG9ydCB7IFJhdGVTY3JlZW4gfSBmcm9tIFwiLi9zY3JlZW5zL1JhdGUudHN4XCI7XG5cbmludGVyZmFjZSBVc2VyIHtcbiAgdXNlck5hbWU6IHN0cmluZztcbiAgYXZhdGFyPzogc3RyaW5nO1xuICBwbGV4QXV0aD86IHtcbiAgICBjbGllbnRJZDogc3RyaW5nO1xuICAgIHBsZXhUb2tlbjogc3RyaW5nO1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBSb3V0ZXMgPVxuICB8IHsgcGF0aDogXCJsb2FkaW5nXCIgfVxuICB8IHsgcGF0aDogXCJsb2dpblwiIH1cbiAgfCB7IHBhdGg6IFwiam9pblwiIH1cbiAgfCB7IHBhdGg6IFwiY3JlYXRlUm9vbVwiOyBwYXJhbXM6IHsgcm9vbU5hbWU6IHN0cmluZyB9IH1cbiAgfCB7IHBhdGg6IFwicmF0ZVwiIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvcmUge1xuICByb3V0ZTogUm91dGVzO1xuICBjbGllbnQ6IE1vdmllTWF0Y2hDbGllbnQ7XG4gIGNvbmZpZz86IENvbmZpZztcbiAgdXNlcj86IFVzZXI7XG4gIHJvb20/OiB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGpvaW5lZDogYm9vbGVhbjtcbiAgICBtZWRpYT86IE1lZGlhW107XG4gICAgbWF0Y2hlcz86IE1hdGNoW107XG4gIH07XG59XG5cbmNvbnN0IGluaXRpYWxTdGF0ZTogU3RvcmUgPSB7XG4gIHJvdXRlOiB7IHBhdGg6IFwibG9hZGluZ1wiIH0sXG4gIGNsaWVudDogZ2V0Q2xpZW50KCksXG4gIHJvb206ICgoKSA9PiB7XG4gICAgY29uc3Qgcm9vbU5hbWUgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwicm9vbU5hbWVcIik7XG4gICAgaWYgKHJvb21OYW1lKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBuYW1lOiByb29tTmFtZSxcbiAgICAgICAgam9pbmVkOiBmYWxzZSxcbiAgICAgIH07XG4gICAgfVxuICB9KSgpLFxufTtcblxuaW50ZXJmYWNlIEFjdGlvbjxLLCBQPiB7XG4gIHR5cGU6IEs7XG4gIHBheWxvYWQ6IFA7XG59XG5cbmV4cG9ydCB0eXBlIEFjdGlvbnMgPVxuICB8IEFjdGlvbjxcIm5hdmlnYXRlXCIsIFJvdXRlcz5cbiAgfCBBY3Rpb248XCJzZXRDb25maWdcIiwgQ29uZmlnPlxuICB8IEFjdGlvbjxcInNldFVzZXJcIiwgVXNlcj5cbiAgfCBBY3Rpb248XCJzZXRBdmF0YXJcIiwgc3RyaW5nPlxuICB8IEFjdGlvbjxcInNldFJvb21cIiwgU3RvcmVbXCJyb29tXCJdPjtcblxuZnVuY3Rpb24gcmVkdWNlcihzdGF0ZTogU3RvcmUsIGFjdGlvbjogQWN0aW9ucyk6IFN0b3JlIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJuYXZpZ2F0ZVwiOlxuICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIHJvdXRlOiBhY3Rpb24ucGF5bG9hZCB9O1xuICAgIGNhc2UgXCJzZXRDb25maWdcIjpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBjb25maWc6IGFjdGlvbi5wYXlsb2FkIH07XG4gICAgY2FzZSBcInNldFVzZXJcIjpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCB1c2VyOiBhY3Rpb24ucGF5bG9hZCB9O1xuICAgIGNhc2UgXCJzZXRBdmF0YXJcIjpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCB1c2VyOiB7IC4uLnN0YXRlLnVzZXIhLCBhdmF0YXI6IGFjdGlvbi5wYXlsb2FkIH0gfTtcbiAgICBjYXNlIFwic2V0Um9vbVwiOlxuICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIHJvb206IGFjdGlvbi5wYXlsb2FkIH07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTW92aWVNYXRjaENvbnRleHQgPSBjcmVhdGVDb250ZXh0PFN0b3JlPihpbml0aWFsU3RhdGUpO1xuXG5jb25zdCBnZXRTdG9yZWRVc2VyID0gKCk6IFVzZXIgfCBudWxsID0+IHtcbiAgY29uc3QgdXNlck5hbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJOYW1lXCIpO1xuICBjb25zdCBwbGV4VG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInBsZXhUb2tlblwiKTtcbiAgY29uc3QgY2xpZW50SWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInBsZXhDbGllbnRJZFwiKTtcblxuICBpZiAoIXVzZXJOYW1lKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIHVzZXJOYW1lOiB1c2VyTmFtZSxcbiAgICBwbGV4QXV0aDogcGxleFRva2VuICYmIGNsaWVudElkID8geyBwbGV4VG9rZW4sIGNsaWVudElkIH0gOiB1bmRlZmluZWQsXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgdXNlU3RvcmUgPSAoKSA9PiB7XG4gIGNvbnN0IFtzdGF0ZSwgZGlzcGF0Y2hdID0gdXNlUmVkdWNlcihyZWR1Y2VyLCBpbml0aWFsU3RhdGUpO1xuXG4gIHVzZUFzeW5jRWZmZWN0KFxuICAgIGFzeW5jIGZ1bmN0aW9uIGdldE1vdmllTWF0Y2hDb25maWdGcm9tU2VydmVyKCkge1xuICAgICAgY29uc3QgY29uZmlnID0gYXdhaXQgc3RhdGUuY2xpZW50LndhaXRGb3JNZXNzYWdlKFwiY29uZmlnXCIpO1xuICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcInNldENvbmZpZ1wiLCBwYXlsb2FkOiBjb25maWcucGF5bG9hZCB9KTtcbiAgICB9LFxuICAgIFtzdGF0ZS5jbGllbnRdXG4gICk7XG5cbiAgdXNlQXN5bmNFZmZlY3QoYXN5bmMgZnVuY3Rpb24gc2V0VXNlclN0YXRlV2l0aFN0b3JlZFZhbHVlKCkge1xuICAgIGNvbnN0IHVzZXIgPSBnZXRTdG9yZWRVc2VyKCk7XG4gICAgaWYgKHVzZXIpIHtcbiAgICAgIC8vIFRoZSBwbGV4LnR2IGxvZ2luIGlzIGEgbXVsdGktc3RlcCBwcm9jZXNzIGFuZFxuICAgICAgLy8gd2UgbWlnaHQgaGF2ZSBhIHZhbGlkIFBJTiBidXQgbm90IGhhdmUgYSBwbGV4VG9rZW4geWV0LlxuICAgICAgLy8gSGVyZSB3ZSdyZSBjaGVja2luZyBmb3IgYSBQSU4gaW4gdGhlIGNhc2UgdGhhdCBhIFBJTiBrZXkvdmFsdWUgaXMgc3RvcmVkXG4gICAgICAvLyBidXQgd2UgZG9uJ3QgeWV0IGhhdmUgYSB0b2tlbi5cbiAgICAgIGlmICghdXNlci5wbGV4QXV0aCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHVzZXIucGxleEF1dGggPSBhd2FpdCBjaGVja1BpbigpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJzZXRVc2VyXCIsIHBheWxvYWQ6IHVzZXIgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJuYXZpZ2F0ZVwiLCBwYXlsb2FkOiB7IHBhdGg6IFwibG9naW5cIiB9IH0pO1xuICAgIH1cbiAgfSwgW10pO1xuXG4gIHVzZUFzeW5jRWZmZWN0KFxuICAgIGFzeW5jIGZ1bmN0aW9uIHVzZXJOYW1lV2FzU2V0KCkge1xuICAgICAgaWYgKHN0YXRlLnVzZXI/LnVzZXJOYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgbG9naW5TdWNjZXNzID0gYXdhaXQgc3RhdGUuY2xpZW50LmxvZ2luKHN0YXRlLnVzZXIpO1xuICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJzZXRBdmF0YXJcIiwgcGF5bG9hZDogbG9naW5TdWNjZXNzLmF2YXRhckltYWdlIH0pO1xuICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJuYXZpZ2F0ZVwiLCBwYXlsb2FkOiB7IHBhdGg6IFwiam9pblwiIH0gfSk7XG4gICAgICAgIH0gY2F0Y2ggKGxvZ2luRXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGxvZ2luRXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBbc3RhdGUudXNlcj8udXNlck5hbWVdXG4gICk7XG5cbiAgcmV0dXJuIFtzdGF0ZSwgZGlzcGF0Y2hdIGFzIGNvbnN0O1xufTtcbiIsICJpbXBvcnQge1xuICBDbGllbnRNZXNzYWdlLFxuICBDcmVhdGVSb29tUmVxdWVzdCxcbiAgSm9pblJvb21SZXF1ZXN0LFxuICBKb2luUm9vbVN1Y2Nlc3MsXG4gIExvZ2luLFxuICBTZXJ2ZXJNZXNzYWdlLFxufSBmcm9tIFwiLi4vLi4vLi4vLi4vdHlwZXMvbW92aWVtYXRjaC5kLnRzXCI7XG5cbmNvbnN0IEFQSV9VUkwgPSAoKCkgPT4ge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICB1cmwucGF0aG5hbWUgPSBcIi9hcGkvd3NcIjtcbiAgdXJsLnByb3RvY29sID0gdXJsLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gXCJ3c3M6XCIgOiBcIndzOlwiO1xuICByZXR1cm4gdXJsLmhyZWY7XG59KSgpO1xuXG50eXBlIEZpbHRlckNsaWVudE1lc3NhZ2VCeVR5cGU8XG4gIEEgZXh0ZW5kcyBDbGllbnRNZXNzYWdlLFxuICBDbGllbnRNZXNzYWdlVHlwZSBleHRlbmRzIHN0cmluZyxcbj4gPSBBIGV4dGVuZHMgeyB0eXBlOiBDbGllbnRNZXNzYWdlVHlwZSB9ID8gQSA6IG5ldmVyO1xuXG5leHBvcnQgY2xhc3MgTW92aWVNYXRjaENsaWVudCBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcbiAgd3M6IFdlYlNvY2tldDtcbiAgcmVjb25uZWN0aW9uQXR0ZW1wdHMgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy53cyA9IG5ldyBXZWJTb2NrZXQoQVBJX1VSTCk7XG4gICAgdGhpcy53cy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLmhhbmRsZU1lc3NhZ2UpO1xuICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcihcImNsb3NlXCIsIHRoaXMuaGFuZGxlQ2xvc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVNZXNzYWdlID0gKGU6IE1lc3NhZ2VFdmVudDxzdHJpbmc+KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1zZzogQ2xpZW50TWVzc2FnZSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgTWVzc2FnZUV2ZW50KG1zZy50eXBlLCB7IGRhdGE6IG1zZyB9KSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfVxuICB9O1xuXG4gIHdhaXRGb3JDb25uZWN0ZWQgPSAoKSA9PiB7XG4gICAgaWYgKHRoaXMud3MucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy53cy5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCAoKSA9PiByZXNvbHZlKHRydWUpLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVDbG9zZSA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgV2ViU29ja2V0IGNsb3NlZCFgKTtcbiAgfTtcblxuICB3YWl0Rm9yTWVzc2FnZSA9IDxLIGV4dGVuZHMgQ2xpZW50TWVzc2FnZVtcInR5cGVcIl0+KFxuICAgIHR5cGU6IEssXG4gICk6IFByb21pc2U8RmlsdGVyQ2xpZW50TWVzc2FnZUJ5VHlwZTxDbGllbnRNZXNzYWdlLCBLPj4gPT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE1lc3NhZ2VFdmVudCkge1xuICAgICAgICAgICAgcmVzb2x2ZShlLmRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIG9uY2U6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH0pO1xuICB9O1xuXG4gIGxvZ2luID0gYXN5bmMgKGxvZ2luOiBMb2dpbikgPT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckNvbm5lY3RlZCgpO1xuXG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7IHR5cGU6IFwibG9naW5cIiwgcGF5bG9hZDogbG9naW4gfSk7XG5cbiAgICBjb25zdCBtc2cgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgdGhpcy53YWl0Rm9yTWVzc2FnZShcImxvZ2luU3VjY2Vzc1wiKSxcbiAgICAgIHRoaXMud2FpdEZvck1lc3NhZ2UoXCJsb2dpbkVycm9yXCIpLFxuICAgIF0pO1xuXG4gICAgaWYgKG1zZy50eXBlID09PSBcImxvZ2luRXJyb3JcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KG1zZy5wYXlsb2FkKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1zZy5wYXlsb2FkO1xuICB9O1xuXG4gIGpvaW5Sb29tID0gYXN5bmMgKFxuICAgIGpvaW5Sb29tUmVxdWVzdDogSm9pblJvb21SZXF1ZXN0LFxuICApOiBQcm9taXNlPEpvaW5Sb29tU3VjY2Vzcz4gPT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckNvbm5lY3RlZCgpO1xuXG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiBcImpvaW5Sb29tXCIsXG4gICAgICBwYXlsb2FkOiBqb2luUm9vbVJlcXVlc3QsXG4gICAgfSk7XG5cbiAgICBjb25zdCBtc2cgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgdGhpcy53YWl0Rm9yTWVzc2FnZShcImpvaW5Sb29tU3VjY2Vzc1wiKSxcbiAgICAgIHRoaXMud2FpdEZvck1lc3NhZ2UoXCJqb2luUm9vbUVycm9yXCIpLFxuICAgIF0pO1xuXG4gICAgaWYgKG1zZy50eXBlID09PSBcImpvaW5Sb29tRXJyb3JcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KG1zZy5wYXlsb2FkKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1zZy5wYXlsb2FkO1xuICB9O1xuXG4gIGNyZWF0ZVJvb20gPSBhc3luYyAoY3JlYXRlUm9vbVJlcXVlc3Q6IENyZWF0ZVJvb21SZXF1ZXN0KSA9PiB7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yQ29ubmVjdGVkKCk7XG5cbiAgICB0aGlzLnNlbmRNZXNzYWdlKHtcbiAgICAgIHR5cGU6IFwiY3JlYXRlUm9vbVwiLFxuICAgICAgcGF5bG9hZDogY3JlYXRlUm9vbVJlcXVlc3QsXG4gICAgfSk7XG5cbiAgICBjb25zdCBtc2cgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgdGhpcy53YWl0Rm9yTWVzc2FnZShcImNyZWF0ZVJvb21TdWNjZXNzXCIpLFxuICAgICAgdGhpcy53YWl0Rm9yTWVzc2FnZShcImNyZWF0ZVJvb21FcnJvclwiKSxcbiAgICBdKTtcblxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJjcmVhdGVSb29tRXJyb3JcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAke21zZy5wYXlsb2FkLm5hbWV9OiAke21zZy5wYXlsb2FkLm1lc3NhZ2V9YCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1zZy5wYXlsb2FkO1xuICB9O1xuXG4gIHNlbmRNZXNzYWdlKG1zZzogU2VydmVyTWVzc2FnZSkge1xuICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKTtcbiAgfVxufVxuXG5sZXQgY2xpZW50OiBNb3ZpZU1hdGNoQ2xpZW50O1xuXG5leHBvcnQgY29uc3QgZ2V0Q2xpZW50ID0gKCk6IE1vdmllTWF0Y2hDbGllbnQgPT4ge1xuICBpZiAoIWNsaWVudCkge1xuICAgIGNsaWVudCA9IG5ldyBNb3ZpZU1hdGNoQ2xpZW50KCk7XG4gIH1cblxuICByZXR1cm4gY2xpZW50O1xufTtcbiIsICJpbXBvcnQgeyB1c2VFZmZlY3QgfSBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuXG5leHBvcnQgY29uc3QgdXNlQXN5bmNFZmZlY3QgPSAoXG4gIGZuOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiBQcm9taXNlPHVua25vd24+LFxuICBkZXBzOiB1bmtub3duW10sXG4pID0+IHtcbiAgcmV0dXJuIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZm4oKTtcbiAgfSwgZGVwcyk7XG59O1xuIiwgImltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuaW1wb3J0IHsgTG9nbyB9IGZyb20gXCIuL0xvZ28udHN4XCI7XG5cbmludGVyZmFjZSBMYXlvdXRQcm9wcyB7XG4gIGhpZGVMb2dvPzogYm9vbGVhbjtcbiAgY2hpbGRyZW46IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGNvbnN0IExheW91dCA9ICh7IGNoaWxkcmVuLCBoaWRlTG9nbyA9IGZhbHNlIH06IExheW91dFByb3BzKSA9PiAoXG4gIDxzZWN0aW9uIGNsYXNzTmFtZT1cIlNjcmVlblwiPlxuICAgIHshaGlkZUxvZ28gJiYgPExvZ28gLz59XG4gICAge2NoaWxkcmVufVxuICA8L3NlY3Rpb24+XG4pO1xuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuXG5pbXBvcnQgXCIuL0xvZ28uY3NzXCI7XG5cbmV4cG9ydCBjb25zdCBMb2dvID0gKCkgPT4gKFxuICA8c3ZnIGNsYXNzPVwiTG9nb1wiIHZpZXdCb3g9XCIwIDAgMTA0IDIwXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuICAgIDxwYXRoXG4gICAgICBkPVwiTTIuODg4IDE3VjcuOTgyaC4wMzZMNi4wNzQgMTdoMi4xNzhsMy4xNS05LjEwOGguMDM2VjE3aDIuNjQ2VjQuMTQ4aC0zLjk3OGwtMi44NDQgOC44MzhoLS4wMzZMNC4yMiA0LjE0OEguMjQyVjE3aDIuNjQ2em0xNy45MjguMjM0Yy43MzIgMCAxLjM5NS0uMTE0IDEuOTg5LS4zNDJhNC4yMzYgNC4yMzYgMCAwMDEuNTIxLS45ODFjLjQyLS40MjYuNzQ0LS45MzkuOTcyLTEuNTM5LjIyOC0uNi4zNDItMS4yNzIuMzQyLTIuMDE2cy0uMTE0LTEuNDE5LS4zNDItMi4wMjVhNC4zNTggNC4zNTggMCAwMC0uOTcyLTEuNTQ4IDQuMzM4IDQuMzM4IDAgMDAtMS41MjEtLjk5Yy0uNTk0LS4yMzQtMS4yNTctLjM1MS0xLjk4OS0uMzUxLS43MzIgMC0xLjM5Mi4xMTctMS45OC4zNTFhNC4zNTYgNC4zNTYgMCAwMC0xLjUxMi45OWMtLjQyLjQyNi0uNzQ0Ljk0Mi0uOTcyIDEuNTQ4LS4yMjguNjA2LS4zNDIgMS4yODEtLjM0MiAyLjAyNXMuMTE0IDEuNDE2LjM0MiAyLjAxNmMuMjI4LjYuNTUyIDEuMTEzLjk3MiAxLjUzOS40Mi40MjYuOTI0Ljc1MyAxLjUxMi45ODEuNTg4LjIyOCAxLjI0OC4zNDIgMS45OC4zNDJ6bTAtMS45MDhjLS40MzIgMC0uNzkyLS4wODQtMS4wOC0uMjUyYTEuOTY1IDEuOTY1IDAgMDEtLjY5My0uNjc1IDIuOTAxIDIuOTAxIDAgMDEtLjM2OS0uOTU0IDUuNTg1IDUuNTg1IDAgMDEwLTIuMTg3Yy4wNzItLjM2LjE5NS0uNjc4LjM2OS0uOTU0LjE3NC0uMjc2LjQwNS0uNTAxLjY5My0uNjc1LjI4OC0uMTc0LjY0OC0uMjYxIDEuMDgtLjI2MS40MzIgMCAuNzk1LjA4NyAxLjA4OS4yNjEuMjk0LjE3NC41MjguMzk5LjcwMi42NzUuMTc0LjI3Ni4yOTcuNTk0LjM2OS45NTRhNS41ODUgNS41ODUgMCAwMTAgMi4xODcgMi45MDEgMi45MDEgMCAwMS0uMzY5Ljk1NCAxLjk0MyAxLjk0MyAwIDAxLS43MDIuNjc1Yy0uMjk0LjE2OC0uNjU3LjI1Mi0xLjA4OS4yNTJ6TTMyLjQ0NCAxN2wzLjE1LTkuMzA2aC0yLjUzOGwtMS45NjIgNi4zNTRoLS4wMzZsLTEuOTYyLTYuMzU0aC0yLjY4MkwyOS42IDE3aDIuODQ0em02Ljg0LTEwLjc0NlY0LjE0OGgtMi41NTZ2Mi4xMDZoMi41NTZ6bTAgMTAuNzQ2VjcuNjk0aC0yLjU1NlYxN2gyLjU1NnptNi4zMTguMjM0YzEuMDU2IDAgMS45NTYtLjI0IDIuNy0uNzIuNzQ0LS40OCAxLjI5Ni0xLjI3OCAxLjY1Ni0yLjM5NGgtMi4yNWMtLjA4NC4yODgtLjMxMi41NjEtLjY4NC44MTktLjM3Mi4yNTgtLjgxNi4zODctMS4zMzIuMzg3LS43MiAwLTEuMjcyLS4xODYtMS42NTYtLjU1OC0uMzg0LS4zNzItLjU5NC0uOTcyLS42My0xLjhoNi43MTRhNi41NyA2LjU3IDAgMDAtLjE4LTIuMDcgNS4wNjcgNS4wNjcgMCAwMC0uODE5LTEuNzY0IDQuMTMxIDQuMTMxIDAgMDAtMS40NDktMS4yMzNjLS41ODgtLjMwNi0xLjI3OC0uNDU5LTIuMDctLjQ1OWE0LjgyIDQuODIgMCAwMC0xLjkzNS4zNzggNC41NzUgNC41NzUgMCAwMC0xLjUwMyAxLjAzNWMtLjQyLjQzOC0uNzQ0Ljk1Ny0uOTcyIDEuNTU3YTUuNDI4IDUuNDI4IDAgMDAtLjM0MiAxLjk0NGMwIC43Mi4xMTEgMS4zOC4zMzMgMS45OC4yMjIuNi41MzcgMS4xMTYuOTQ1IDEuNTQ4LjQwOC40MzIuOTA2Ljc2NSAxLjQ5NC45OTkuNTg4LjIzNCAxLjI0OC4zNTEgMS45OC4zNTF6bTEuOTYyLTUuODg2aC00LjE1OGMuMDEyLS4xOC4wNTEtLjM4NC4xMTctLjYxMmExLjg4IDEuODggMCAwMS45OS0xLjE2MWMuMjctLjEzOC42MDktLjIwNyAxLjAxNy0uMjA3LjYyNCAwIDEuMDg5LjE2OCAxLjM5NS41MDQuMzA2LjMzNi41MTkuODI4LjYzOSAxLjQ3NnpNNTQuNTQ4IDE3VjcuOTgyaC4wMzZMNTcuNzM0IDE3aDIuMTc4bDMuMTUtOS4xMDhoLjAzNlYxN2gyLjY0NlY0LjE0OGgtMy45NzhsLTIuODQ0IDguODM4aC0uMDM2TDU1Ljg4IDQuMTQ4aC0zLjk3OFYxN2gyLjY0NnptMTYuMTgyLjIzNGE1Ljc4IDUuNzggMCAwMDEuNjkyLS4yNTIgMy4zMyAzLjMzIDAgMDAxLjQ0LS44ODIgMy44NCAzLjg0IDAgMDAuMTguOWgyLjU5MmMtLjEyLS4xOTItLjIwNC0uNDgtLjI1Mi0uODY0YTkuNzI0IDkuNzI0IDAgMDEtLjA3Mi0xLjIwNnYtNC44NDJjMC0uNTY0LS4xMjYtMS4wMTctLjM3OC0xLjM1OWEyLjU5IDIuNTkgMCAwMC0uOTcyLS44MDEgNC4zNSA0LjM1IDAgMDAtMS4zMTQtLjM4NyAxMC40MyAxMC40MyAwIDAwLTEuNDIyLS4wOTljLS41MTYgMC0xLjAyOS4wNTEtMS41MzkuMTUzLS41MS4xMDItLjk2OS4yNzMtMS4zNzcuNTEzLS40MDguMjQtLjc0NC41NTgtMS4wMDguOTU0LS4yNjQuMzk2LS40MTQuODk0LS40NSAxLjQ5NGgyLjU1NmMuMDQ4LS41MDQuMjE2LS44NjQuNTA0LTEuMDguMjg4LS4yMTYuNjg0LS4zMjQgMS4xODgtLjMyNC4yMjggMCAuNDQxLjAxNS42MzkuMDQ1cy4zNzIuMDkuNTIyLjE4Yy4xNS4wOS4yNy4yMTYuMzYuMzc4LjA5LjE2Mi4xMzUuMzgxLjEzNS42NTcuMDEyLjI2NC0uMDY2LjQ2NS0uMjM0LjYwMy0uMTY4LjEzOC0uMzk2LjI0My0uNjg0LjMxNWE2LjgyIDYuODIgMCAwMS0uOTkuMTYyYy0uMzcyLjAzNi0uNzUuMDg0LTEuMTM0LjE0NC0uMzg0LjA2LS43NjUuMTQxLTEuMTQzLjI0M2EzLjIyNiAzLjIyNiAwIDAwLTEuMDA4LjQ1OSAyLjMzMyAyLjMzMyAwIDAwLS43Mi44MTljLS4xODYuMzQyLS4yNzkuNzc3LS4yNzkgMS4zMDUgMCAuNDguMDgxLjg5NC4yNDMgMS4yNDIuMTYyLjM0OC4zODcuNjM2LjY3NS44NjQuMjg4LjIyOC42MjQuMzk2IDEuMDA4LjUwNC4zODQuMTA4Ljc5OC4xNjIgMS4yNDIuMTYyem0uOTU0LTEuNjkyYy0uMjA0IDAtLjQwMi0uMDE4LS41OTQtLjA1NGExLjQ0MyAxLjQ0MyAwIDAxLS41MDQtLjE4OS45NjYuOTY2IDAgMDEtLjM0Mi0uMzY5IDEuMjAyIDEuMjAyIDAgMDEtLjEyNi0uNTc2YzAtLjI0LjA0Mi0uNDM4LjEyNi0uNTk0LjA4NC0uMTU2LjE5NS0uMjg1LjMzMy0uMzg3LjEzOC0uMTAyLjMtLjE4My40ODYtLjI0M3MuMzc1LS4xMDguNTY3LS4xNDRjLjIwNC0uMDM2LjQwOC0uMDY2LjYxMi0uMDlhOCA4IDAgMDAuNTg1LS4wOWMuMTg2LS4wMzYuMzYtLjA4MS41MjItLjEzNS4xNjItLjA1NC4yOTctLjEyOS40MDUtLjIyNXYuOTU0YzAgLjE0NC0uMDE1LjMzNi0uMDQ1LjU3Ni0uMDMuMjQtLjExMS40NzctLjI0My43MTFhMS42ODYgMS42ODYgMCAwMS0uNjEyLjYwM2MtLjI3Ni4xNjgtLjY2Ni4yNTItMS4xNy4yNTJ6bTEwLjIyNCAxLjU0OGMuMjUyIDAgLjUxLS4wMDYuNzc0LS4wMTguMjY0LS4wMTIuNTA0LS4wMzYuNzItLjA3MnYtMS45OGEzLjU4IDMuNTggMCAwMS0uMzc4LjA1NGMtLjEzMi4wMTItLjI3LjAxOC0uNDE0LjAxOC0uNDMyIDAtLjcyLS4wNzItLjg2NC0uMjE2LS4xNDQtLjE0NC0uMjE2LS40MzItLjIxNi0uODY0VjkuNDA0aDEuODcydi0xLjcxSDgxLjUzdi0yLjc5aC0yLjU1NnYyLjc5aC0xLjU0OHYxLjcxaDEuNTQ4djUuNDljMCAuNDY4LjA3OC44NDYuMjM0IDEuMTM0LjE1Ni4yODguMzY5LjUxLjYzOS42NjYuMjcuMTU2LjU4Mi4yNjEuOTM2LjMxNS4zNTQuMDU0LjcyOS4wODEgMS4xMjUuMDgxem03LjEyOC4xNDRjMS4yMzYgMCAyLjI1LS4zMjQgMy4wNDItLjk3Mi43OTItLjY0OCAxLjI3Mi0xLjU5IDEuNDQtMi44MjZoLTIuNDY2Yy0uMDg0LjU3Ni0uMjkxIDEuMDM1LS42MjEgMS4zNzctLjMzLjM0Mi0uODAxLjUxMy0xLjQxMy41MTMtLjM5NiAwLS43MzItLjA5LTEuMDA4LS4yN2EyLjAxNyAyLjAxNyAwIDAxLS42NTctLjY5MyAzLjE3NCAzLjE3NCAwIDAxLS4zNTEtLjk0NSA1LjA1NSA1LjA1NSAwIDAxMC0yLjA3OSAzLjExIDMuMTEgMCAwMS4zNjktLjk3MmMuMTc0LS4yOTQuMzk5LS41MzQuNjc1LS43Mi4yNzYtLjE4Ni42MTgtLjI3OSAxLjAyNi0uMjc5IDEuMDkyIDAgMS43MjIuNTM0IDEuODkgMS42MDJoMi41MDJjLS4wMzYtLjYtLjE4LTEuMTE5LS40MzItMS41NTdhMy41MTcgMy41MTcgMCAwMC0uOTgxLTEuMDk4IDQuMjUyIDQuMjUyIDAgMDAtMS4zNjgtLjY1NyA1LjgzNCA1LjgzNCAwIDAwLTEuNTkzLS4yMTZjLS43NTYgMC0xLjQyOC4xMjYtMi4wMTYuMzc4YTQuMjQzIDQuMjQzIDAgMDAtMS40OTQgMS4wNTNjLS40MDguNDUtLjcxNy45ODQtLjkyNyAxLjYwMmE2LjIgNi4yIDAgMDAtLjMxNSAyLjAwN2MwIC42OTYuMTE0IDEuMzM1LjM0MiAxLjkxNy4yMjguNTgyLjU0NiAxLjA4My45NTQgMS41MDMuNDA4LjQyLjkwMy43NDcgMS40ODUuOTgxYTUuMDkzIDUuMDkzIDAgMDAxLjkxNy4zNTF6TTU5IDBjNS41MjMgMCAxMCA0LjQ3NyAxMCAxMHMtNC40NzcgMTAtMTAgMTAtMTAtNC40NzctMTAtMTBTNTMuNDc3IDAgNTkgMHptMzguNTE0IDQuMTQ4VjguOTloLjA1NGMuMzI0LS41NC43MzgtLjkzMyAxLjI0Mi0xLjE3OXMuOTk2LS4zNjkgMS40NzYtLjM2OWMuNjg0IDAgMS4yNDUuMDkzIDEuNjgzLjI3OS40MzguMTg2Ljc4My40NDQgMS4wMzUuNzc0LjI1Mi4zMy40MjkuNzMyLjUzMSAxLjIwNmE3LjUgNy41IDAgMDEuMTUzIDEuNTc1VjE3aC0yLjU1NnYtNS4yNTZjMC0uNzY4LS4xMi0xLjM0MS0uMzYtMS43MTktLjI0LS4zNzgtLjY2Ni0uNTY3LTEuMjc4LS41NjctLjY5NiAwLTEuMi4yMDctMS41MTIuNjIxLS4zMTIuNDE0LS40NjggMS4wOTUtLjQ2OCAyLjA0M1YxN2gtMi41NTZWNC4xNDhoMi41NTZ6XCJcbiAgICAgIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgZmlsbC1ydWxlPVwibm9uemVyb1wiXG4gICAgLz5cbiAgPC9zdmc+XG4pO1xuIiwgImltcG9ydCBSZWFjdCwge1xuICB1c2VDYWxsYmFjayxcbiAgdXNlQ29udGV4dCxcbiAgdXNlRWZmZWN0LFxuICB1c2VTdGF0ZSxcbn0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcbmltcG9ydCBcIi4vSm9pbi5jc3NcIjtcbmltcG9ydCB7IEZpZWxkIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvRmllbGQudHN4XCI7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvU3Bpbm5lci50c3hcIjtcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gXCIuLi9jb21wb25lbnRzL0J1dHRvbi50c3hcIjtcbmltcG9ydCB7IEJ1dHRvbkNvbnRhaW5lciB9IGZyb20gXCIuLi9jb21wb25lbnRzL0J1dHRvbkNvbnRhaW5lci50c3hcIjtcbmltcG9ydCB7IFNjcmVlblByb3BzIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvU2NyZWVuLnRzXCI7XG5pbXBvcnQgeyBNb3ZpZU1hdGNoQ29udGV4dCB9IGZyb20gXCIuLi9zdGF0ZS50c1wiO1xuaW1wb3J0IHsgSm9pblJvb21TdWNjZXNzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3R5cGVzL21vdmllbWF0Y2guZC50c1wiO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvTGF5b3V0LnRzeFwiO1xuXG5leHBvcnQgY29uc3QgSm9pblNjcmVlbiA9ICh7IG5hdmlnYXRlLCBkaXNwYXRjaCB9OiBTY3JlZW5Qcm9wcykgPT4ge1xuICBjb25zdCBzdG9yZSA9IHVzZUNvbnRleHQoTW92aWVNYXRjaENvbnRleHQpO1xuICBjb25zdCBbcm9vbU5hbWUsIHNldFJvb21OYW1lXSA9IHVzZVN0YXRlPHN0cmluZyB8IHVuZGVmaW5lZD4oXG4gICAgc3RvcmUucm9vbT8ubmFtZSA/PyBcIlwiXG4gICk7XG4gIGNvbnN0IFtyb29tTmFtZUVycm9yLCBzZXRSb29tTmFtZUVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IHVuZGVmaW5lZD4oKTtcbiAgY29uc3QgW2pvaW5FcnJvciwgc2V0Sm9pbkVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IHVuZGVmaW5lZD4oKTtcbiAgY29uc3QgaGFuZGxlSm9pbiA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICBpZiAocm9vbU5hbWUpIHtcbiAgICAgIG5hdmlnYXRlKHsgcGF0aDogXCJsb2FkaW5nXCIgfSk7XG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwic2V0Um9vbVwiLCBwYXlsb2FkOiB7IG5hbWU6IHJvb21OYW1lLCBqb2luZWQ6IGZhbHNlIH0gfSk7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBqb2luTXNnOiBKb2luUm9vbVN1Y2Nlc3MgPSBhd2FpdCBzdG9yZS5jbGllbnQuam9pblJvb20oe1xuICAgICAgICAgIHJvb21OYW1lLFxuICAgICAgICB9KTtcbiAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgIHR5cGU6IFwic2V0Um9vbVwiLFxuICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgIG5hbWU6IHJvb21OYW1lLFxuICAgICAgICAgICAgam9pbmVkOiB0cnVlLFxuICAgICAgICAgICAgbWVkaWE6IGpvaW5Nc2cubWVkaWEsXG4gICAgICAgICAgICBtYXRjaGVzOiBqb2luTXNnLnByZXZpb3VzTWF0Y2hlcyxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbmF2aWdhdGUoeyBwYXRoOiBcInJhdGVcIiB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRKb2luRXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgICBuYXZpZ2F0ZSh7IHBhdGg6IFwiam9pblwiIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRSb29tTmFtZUVycm9yKGBSb29tIG5hbWUgaXMgcmVxdWlyZWQhYCk7XG4gICAgfVxuICB9LCBbcm9vbU5hbWVdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChyb29tTmFtZSAmJiAhcm9vbU5hbWVFcnJvcikge1xuICAgICAgaGFuZGxlSm9pbigpO1xuICAgIH1cbiAgfSwgW3N0b3JlLnJvb20/Lm5hbWUsIHJvb21OYW1lRXJyb3JdKTtcblxuICBpZiAoc3RvcmUucm9vbT8ubmFtZSkge1xuICAgIHJldHVybiAoXG4gICAgICA8TGF5b3V0PlxuICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgPC9MYXlvdXQ+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPExheW91dD5cbiAgICAgIDxmb3JtXG4gICAgICAgIGNsYXNzTmFtZT1cIkpvaW5TY3JlZW5fRm9ybVwiXG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2pvaW5FcnJvciAmJiA8cCBzdHlsZT17eyBjb2xvcjogXCJyZWRcIiB9fT57am9pbkVycm9yfTwvcD59XG4gICAgICAgIDxGaWVsZFxuICAgICAgICAgIGxhYmVsPVwiUm9vbSBOYW1lXCJcbiAgICAgICAgICBuYW1lPVwicm9vbU5hbWVcIlxuICAgICAgICAgIHZhbHVlPXtyb29tTmFtZX1cbiAgICAgICAgICBlcnJvck1lc3NhZ2U9e3Jvb21OYW1lRXJyb3J9XG4gICAgICAgICAgb25DaGFuZ2U9e3NldFJvb21OYW1lfVxuICAgICAgICAgIHBhZGRpbmdUb3A9XCJzNFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxCdXR0b25Db250YWluZXIgcGFkZGluZ1RvcD1cInM3XCI+XG4gICAgICAgICAgPEJ1dHRvbiBhcHBlYXJhbmNlPVwicHJpbWFyeVwiIG9uUHJlc3M9e2hhbmRsZUpvaW59PlxuICAgICAgICAgICAgSm9pblxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGFwcGVhcmFuY2U9XCJzZWNvbmRhcnlcIlxuICAgICAgICAgICAgb25QcmVzcz17KCkgPT4ge1xuICAgICAgICAgICAgICBuYXZpZ2F0ZSh7XG4gICAgICAgICAgICAgICAgcGF0aDogXCJjcmVhdGVSb29tXCIsXG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7IHJvb21OYW1lOiByb29tTmFtZSA/PyBcIlwiIH0sXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBDcmVhdGVcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9CdXR0b25Db250YWluZXI+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9MYXlvdXQ+XG4gICk7XG59O1xuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuXG5pbXBvcnQgXCIuL1NwaW5uZXIuY3NzXCI7XG5cbmV4cG9ydCBjb25zdCBTcGlubmVyID0gKCkgPT4gPGRpdiBjbGFzc05hbWU9XCJTcGlubmVyXCI+PC9kaXY+O1xuIiwgImltcG9ydCBSZWFjdCwge1xuICB1c2VDYWxsYmFjayxcbiAgdXNlQ29udGV4dCxcbiAgdXNlU3RhdGUsXG59IGZyb20gXCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9yZWFjdEAxNy4wLjE/ZHRzXCI7XG5pbXBvcnQgeyBKb2luUm9vbVN1Y2Nlc3MgfSBmcm9tIFwiLi4vLi4vLi4vLi4vdHlwZXMvbW92aWVtYXRjaC5kLnRzXCI7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiLi4vY29tcG9uZW50cy9CdXR0b24udHN4XCI7XG5pbXBvcnQgeyBCdXR0b25Db250YWluZXIgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9CdXR0b25Db250YWluZXIudHN4XCI7XG5pbXBvcnQgeyBGaWVsZCB9IGZyb20gXCIuLi9jb21wb25lbnRzL0ZpZWxkLnRzeFwiO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvTGF5b3V0LnRzeFwiO1xuaW1wb3J0IHsgU2NyZWVuUHJvcHMgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9TY3JlZW4udHNcIjtcbmltcG9ydCB7IE1vdmllTWF0Y2hDb250ZXh0IH0gZnJvbSBcIi4uL3N0YXRlLnRzXCI7XG5cbmV4cG9ydCBjb25zdCBDcmVhdGVTY3JlZW4gPSAoe1xuICBuYXZpZ2F0ZSxcbiAgZGlzcGF0Y2gsXG4gIHBhcmFtczogeyByb29tTmFtZTogaW5pdGlhbFJvb21OYW1lIH0sXG59OiBTY3JlZW5Qcm9wczx7IHJvb21OYW1lOiBzdHJpbmcgfT4pID0+IHtcbiAgY29uc3Qgc3RhdGUgPSB1c2VDb250ZXh0KE1vdmllTWF0Y2hDb250ZXh0KTtcbiAgY29uc3QgW3Jvb21OYW1lLCBzZXRSb29tTmFtZV0gPSB1c2VTdGF0ZShpbml0aWFsUm9vbU5hbWUpO1xuICBjb25zdCBbY3JlYXRlUm9vbUVycm9yLCBzZXRDcmVhdGVSb29tRXJyb3JdID0gdXNlU3RhdGUoKTtcbiAgY29uc3QgY3JlYXRlUm9vbSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICBpZiAocm9vbU5hbWUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGpvaW5Nc2c6IEpvaW5Sb29tU3VjY2VzcyA9IGF3YWl0IHN0YXRlLmNsaWVudC5jcmVhdGVSb29tKHtcbiAgICAgICAgICByb29tTmFtZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgIHR5cGU6IFwic2V0Um9vbVwiLFxuICAgICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICAgIG5hbWU6IHJvb21OYW1lLFxuICAgICAgICAgICAgam9pbmVkOiB0cnVlLFxuICAgICAgICAgICAgbWVkaWE6IGpvaW5Nc2cubWVkaWEsXG4gICAgICAgICAgICBtYXRjaGVzOiBqb2luTXNnLnByZXZpb3VzTWF0Y2hlcyxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbmF2aWdhdGUoeyBwYXRoOiBcInJhdGVcIiB9KTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBzZXRDcmVhdGVSb29tRXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgfSwgW3Jvb21OYW1lXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8TGF5b3V0PlxuICAgICAgPGZvcm1cbiAgICAgICAgY2xhc3NOYW1lPVwiTG9naW5TY3JlZW5fRm9ybVwiXG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAge2NyZWF0ZVJvb21FcnJvciAmJiA8cCBzdHlsZT17eyBjb2xvcjogXCJyZWRcIiB9fT57Y3JlYXRlUm9vbUVycm9yfTwvcD59XG4gICAgICAgIDxGaWVsZFxuICAgICAgICAgIGxhYmVsPVwiUm9vbSBOYW1lXCJcbiAgICAgICAgICBuYW1lPVwicm9vbU5hbWVcIlxuICAgICAgICAgIHZhbHVlPXtyb29tTmFtZX1cbiAgICAgICAgICBvbkNoYW5nZT17c2V0Um9vbU5hbWV9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPEJ1dHRvbkNvbnRhaW5lcj5cbiAgICAgICAgICA8QnV0dG9uIGFwcGVhcmFuY2U9XCJzZWNvbmRhcnlcIiBvblByZXNzPXtjcmVhdGVSb29tfT5cbiAgICAgICAgICAgIENyZWF0ZVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L0J1dHRvbkNvbnRhaW5lcj5cbiAgICAgIDwvZm9ybT5cbiAgICA8L0xheW91dD5cbiAgKTtcbn07XG4iLCAiaW1wb3J0IFJlYWN0LCB7XG4gIHVzZUNvbnRleHQsXG4gIHVzZVN0YXRlLFxufSBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuaW1wb3J0IHsgQ2FyZCB9IGZyb20gXCIuLi9jb21wb25lbnRzL0NhcmQudHN4XCI7XG5pbXBvcnQgeyBDYXJkU3RhY2sgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9DYXJkU3RhY2sudHN4XCI7XG5pbXBvcnQgeyBMYXlvdXQgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9MYXlvdXQudHN4XCI7XG5pbXBvcnQgeyBNb3ZpZU1hdGNoQ29udGV4dCB9IGZyb20gXCIuLi9zdGF0ZS50c1wiO1xuXG5pbXBvcnQgXCIuL1JhdGUuY3NzXCI7XG5cbmV4cG9ydCBjb25zdCBSYXRlU2NyZWVuID0gKCkgPT4ge1xuICBjb25zdCBzdGF0ZSA9IHVzZUNvbnRleHQoTW92aWVNYXRjaENvbnRleHQpO1xuICBjb25zdCBbY3VycmVudEluZGV4LCBzZXRJbmRleF0gPSB1c2VTdGF0ZTxudW1iZXI+KDApO1xuXG4gIGlmICghc3RhdGUucm9vbSB8fCAhc3RhdGUucm9vbS5tZWRpYSkge1xuICAgIHJldHVybiA8cCBzdHlsZT17eyBjb2xvcjogXCJyZWRcIiB9fT5ObyBSb29tITwvcD47XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxMYXlvdXQgaGlkZUxvZ28+XG4gICAgICA8Q2FyZFN0YWNrXG4gICAgICAgIG9uUmF0ZT17KCkgPT4ge1xuICAgICAgICAgIHNldEluZGV4KGN1cnJlbnRJbmRleCArIDEpO1xuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7c3RhdGUucm9vbS5tZWRpYVxuICAgICAgICAgIC5zbGljZShjdXJyZW50SW5kZXgsIGN1cnJlbnRJbmRleCArIDUpXG4gICAgICAgICAgLm1hcCgobWVkaWEsIGkpID0+IChcbiAgICAgICAgICAgIDxDYXJkIG1lZGlhPXttZWRpYX0ga2V5PXttZWRpYS5pZH0gaW5kZXg9e2l9IC8+XG4gICAgICAgICAgKSl9XG4gICAgICA8L0NhcmRTdGFjaz5cbiAgICA8L0xheW91dD5cbiAgKTtcbn07XG4iLCAiaW1wb3J0IFJlYWN0LCB7XG4gIGZvcndhcmRSZWYsXG4gIHVzZVN0YXRlLFxufSBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuaW1wb3J0IHsgTWVkaWEgfSBmcm9tIFwiLi4vLi4vLi4vLi4vdHlwZXMvbW92aWVtYXRjaC5kLnRzXCI7XG5cbmltcG9ydCBcIi4vQ2FyZC5jc3NcIjtcbmltcG9ydCB7IEluZm9JY29uIH0gZnJvbSBcIi4vSW5mb0ljb24udHN4XCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2FyZFByb3BzIHtcbiAgbWVkaWE6IE1lZGlhO1xuICBpbmRleDogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgQ2FyZCA9IGZvcndhcmRSZWY8SFRNTERpdkVsZW1lbnQsIENhcmRQcm9wcz4oXG4gICh7IG1lZGlhLCBpbmRleCA9IDAgfSwgcmVmKSA9PiB7XG4gICAgY29uc3QgW3Nob3dNb3JlSW5mbywgc2V0U2hvd01vcmVJbmZvXSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKTtcblxuICAgIGNvbnN0IHNyY1NldCA9IFtcbiAgICAgIGAke21lZGlhLnBvc3RlclVybH0mdz0zMDBgLFxuICAgICAgYCR7bWVkaWEucG9zdGVyVXJsfSZ3PTQ1MCAxLjV4YCxcbiAgICAgIGAke21lZGlhLnBvc3RlclVybH0mdz02MDAgMnhgLFxuICAgICAgYCR7bWVkaWEucG9zdGVyVXJsfSZ3PTkwMCAzeGAsXG4gICAgXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHJlZj17cmVmfSBjbGFzc05hbWU9XCJDYXJkXCIgc3R5bGU9e3sgXCItLWlcIjogaW5kZXggfX0+XG4gICAgICAgIDxpbWdcbiAgICAgICAgICBjbGFzc05hbWU9XCJDYXJkX1Bvc3RlclwiXG4gICAgICAgICAgc3JjPXtzcmNTZXRbMF19XG4gICAgICAgICAgc3JjU2V0PXtzcmNTZXQuam9pbihcIiwgXCIpfVxuICAgICAgICAgIGFsdD17YCR7bWVkaWEudGl0bGV9IHBvc3RlcmB9XG4gICAgICAgIC8+XG4gICAgICAgIHtzaG93TW9yZUluZm8gPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJDYXJkX01vcmVJbmZvXCI+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJDYXJkX01vcmVJbmZvX1RpdGxlXCI+e2Ake21lZGlhLnRpdGxlfSR7XG4gICAgICAgICAgICAgIG1lZGlhLnR5cGUgPT09IFwibW92aWVcIiA/IGAgKCR7bWVkaWEueWVhcn0pYCA6IFwiXCJcbiAgICAgICAgICAgIH1gfTwvcD5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIkNhcmRfTW9yZUluZm9fRGVzY3JpcHRpb25cIj57bWVkaWEuZGVzY3JpcHRpb259PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiQ2FyZF9JbmZvXCI+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJDYXJkX0luZm9fVGl0bGVcIj57YCR7bWVkaWEudGl0bGV9JHtcbiAgICAgICAgICAgICAgbWVkaWEudHlwZSA9PT0gXCJtb3ZpZVwiID8gYCAoJHttZWRpYS55ZWFyfSlgIDogXCJcIlxuICAgICAgICAgICAgfWB9PC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwiQ2FyZF9Nb3JlSW5mb0J1dHRvblwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd01vcmVJbmZvKCFzaG93TW9yZUluZm8pfVxuICAgICAgICA+XG4gICAgICAgICAgPEluZm9JY29uIC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuKTtcblxuQ2FyZC5kaXNwbGF5TmFtZSA9IFwiQ2FyZFwiO1xuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuXG5pbXBvcnQgXCIuL0luZm9JY29uLmNzc1wiO1xuXG5leHBvcnQgY29uc3QgSW5mb0ljb24gPSAoKSA9PiAoXG4gIDxzdmdcbiAgICBjbGFzc05hbWU9XCJJbmZvSWNvblwiXG4gICAgdmlld0JveD1cIjAgMCAzNiAzN1wiXG4gICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gID5cbiAgICA8cGF0aFxuICAgICAgZD1cIk0xOC4wMTYgMi45NjNjMi43NDYgMCA1LjMwOC42OTIgNy42ODcgMi4wNzUgMi40IDEuMzk0IDQuMjggMy4yNzQgNS42NDMgNS42NCAxLjM3MyAyLjQyMSAyLjA2IDQuOTg4IDIuMDYgNy43IDAgMi43NDUtLjY4NyA1LjMwNi0yLjA2IDcuNjgzLTEuMzczIDIuMzU2LTMuMjU0IDQuMjMtNS42NDMgNS42MjRhMTQuODg2IDE0Ljg4NiAwIDAxLTcuNjg3IDIuMDkxYy0xLjM4NCAwLTIuNzA4LS4xNy0zLjk3My0uNTFhMTYuMTAyIDE2LjEwMiAwIDAxLTMuNzEzLTEuNTMyYy0yLjM1Ny0xLjM0LTQuMjM4LTMuMjItNS42NDQtNS42NC0xLjM5NC0yLjM2Ny0yLjA5MS00LjkzOS0yLjA5MS03LjcxNiAwLTIuNzU2LjY4Ni01LjMyNyAyLjA2LTcuNzE2YTE1LjcwNiAxNS43MDYgMCAwMTIuNDQtMy4xOTNjLjkzNS0uOTQgMi4wMDItMS43NSAzLjIwMi0yLjQzMWExNS4xNDggMTUuMTQ4IDAgMDE3LjcyLTIuMDc1em0wIDMzLjQwN2MzLjIyMiAwIDYuMjIyLS44MDUgOS0yLjQxNWExNy43ODMgMTcuNzgzIDAgMDAzLjcyMi0yLjg2MSAxOC40ODQgMTguNDg0IDAgMDAyLjg0Ni0zLjczNmMxLjYxLTIuNzU2IDIuNDE2LTUuNzUgMi40MTYtOC45OCAwLTMuMjEtLjgwNS02LjIwMy0yLjQxNi04Ljk4YTE4LjY5IDE4LjY5IDAgMDAtMi44NDYtMy43NDQgMTcuNjM2IDE3LjYzNiAwIDAwLTMuNzIyLTIuODcgMTcuNjQ2IDE3LjY0NiAwIDAwLTktMi40MTRjLTMuMjU0IDAtNi4yNjUuODA1LTkuMDMyIDIuNDE1YTE4LjEzIDE4LjEzIDAgMDAtMy43MyAyLjg1M0ExNy43NjggMTcuNzY4IDAgMDAyLjQgOS4zOThDLjggMTIuMTc1IDAgMTUuMTY4IDAgMTguMzc4YzAgMy4yNDIuODEgNi4yNTEgMi40MzIgOS4wMjhhMTcuNjMgMTcuNjMgMCAwMDIuODcgMy43MiAxOC42OTYgMTguNjk2IDAgMDAzLjc0NyAyLjg0NWMyLjc4OSAxLjYgNS43NzggMi4zOTkgOC45NjcgMi4zOTl6TTE2LjE2OCA5LjE3djEzLjQ3aDMuNjhWOS4xN2gtMy42OHptMS44NDggMTguNzIyYzEuMzMgMCAxLjk5NS0uNiAxLjk5NS0xLjggMC0xLjItLjY2NS0xLjc5OS0xLjk5NS0xLjc5OXMtMS45OTQuNi0xLjk5NCAxLjhjMCAxLjE5OS42NjQgMS43OTkgMS45OTQgMS43OTl6XCJcbiAgICAgIGZpbGw9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgZmlsbFJ1bGU9XCJub256ZXJvXCJcbiAgICAvPlxuICA8L3N2Zz5cbik7XG4iLCAiaW1wb3J0IFJlYWN0LCB7XG4gIFJlYWN0Tm9kZSxcbiAgQ2hpbGRyZW4sXG4gIHVzZVJlZixcbiAgY2xvbmVFbGVtZW50LFxuICBpc1ZhbGlkRWxlbWVudCxcbiAgdXNlRWZmZWN0LFxuICBOYW1lZEV4b3RpY0NvbXBvbmVudCxcbiAgdXNlU3RhdGUsXG59IGZyb20gXCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9yZWFjdEAxNy4wLjE/ZHRzXCI7XG5pbXBvcnQgeyBSYXRlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3R5cGVzL21vdmllbWF0Y2guZC50c1wiO1xuaW1wb3J0IHsgdXNlQW5pbWF0aW9uRnJhbWUgfSBmcm9tIFwiLi4vaG9va3MvdXNlQW5pbWF0aW9uRnJhbWUudHNcIjtcblxuaW1wb3J0IFwiLi9DYXJkU3RhY2suY3NzXCI7XG5cbmludGVyZmFjZSBDYXJkU3RhY2tQcm9wcyB7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG4gIG9uUmF0ZShyYXRpbmc6IFJhdGVbXCJyYXRpbmdcIl0pOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgQ2FyZFN0YWNrID0gKHsgY2hpbGRyZW4sIG9uUmF0ZSB9OiBDYXJkU3RhY2tQcm9wcykgPT4ge1xuICBjb25zdCBbc3dpcGVkQ2FyZHMsIHNldFN3aXBlZENhcmRzXSA9IHVzZVN0YXRlPG51bWJlcj4oMCk7XG4gIGNvbnN0IGNhcmRFbHMgPSB1c2VSZWYobmV3IE1hcDxudW1iZXIsIEhUTUxEaXZFbGVtZW50PigpKTtcbiAgY29uc3QgY2FyZEFuaW1hdGlvbnMgPSB1c2VSZWY8QW5pbWF0aW9uW10gfCBudWxsPihudWxsKTtcbiAgY29uc3QgdG9wQ2FyZEFuaW1hdGlvbiA9IHVzZVJlZjxBbmltYXRpb24gfCBudWxsPihudWxsKTtcbiAgY29uc3QgYW5pbWF0aW9uVGltZSA9IHVzZVJlZjxudW1iZXIgfCBudWxsPihudWxsKTtcblxuICB1c2VBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgaWYgKGFuaW1hdGlvblRpbWUuY3VycmVudCAhPT0gbnVsbCkge1xuICAgICAgaWYgKGNhcmRBbmltYXRpb25zLmN1cnJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgZm9yIChjb25zdCBhbmltYXRpb24gb2YgY2FyZEFuaW1hdGlvbnMuY3VycmVudCkge1xuICAgICAgICAgIGFuaW1hdGlvbi5jdXJyZW50VGltZSA9IGFuaW1hdGlvblRpbWUuY3VycmVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRvcENhcmRBbmltYXRpb24uY3VycmVudCkge1xuICAgICAgICB0b3BDYXJkQW5pbWF0aW9uLmN1cnJlbnQuY3VycmVudFRpbWUgPSBhbmltYXRpb25UaW1lLmN1cnJlbnQ7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICB1c2VFZmZlY3QoXG4gICAgZnVuY3Rpb24gc2V0QW5pbWF0aW9ucygpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwic2V0dGluZyBhbmltYXRpb25zXCIsIFsuLi5jYXJkRWxzLmN1cnJlbnQudmFsdWVzKCldKTtcbiAgICAgIGNhcmRBbmltYXRpb25zLmN1cnJlbnQgPSBbLi4uY2FyZEVscy5jdXJyZW50LnZhbHVlcygpXS5mbGF0TWFwKChjYXJkRWwpID0+XG4gICAgICAgIGNhcmRFbC5nZXRBbmltYXRpb25zKClcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhjYXJkQW5pbWF0aW9ucy5jdXJyZW50KTtcbiAgICAgIGNhcmRBbmltYXRpb25zLmN1cnJlbnQuZm9yRWFjaCgoYW5pbWF0aW9uKSA9PiBhbmltYXRpb24ucGF1c2UoKSk7XG4gICAgfSxcbiAgICBbc3dpcGVkQ2FyZHNdXG4gICk7XG5cbiAgdXNlRWZmZWN0KFxuICAgIGZ1bmN0aW9uIGhhbmRsZVN3aXBlKCkge1xuICAgICAgY29uc3QgdG9wQ2FyZEVsID0gY2FyZEVscz8uY3VycmVudC5nZXQoMCk7XG4gICAgICBpZiAoIXRvcENhcmRFbCkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwibm8gdG9wIGNhcmQhXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGhhbmRsZVBvaW50ZXJEb3duID0gKHN0YXJ0RXZlbnQ6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgKHN0YXJ0RXZlbnQucG9pbnRlclR5cGUgPT09IFwibW91c2VcIiAmJiBzdGFydEV2ZW50LmJ1dHRvbiAhPT0gMCkgfHxcbiAgICAgICAgICBzdGFydEV2ZW50LnRhcmdldCBpbnN0YW5jZW9mIEhUTUxCdXR0b25FbGVtZW50XG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXJ0RXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdG9wQ2FyZEVsLnNldFBvaW50ZXJDYXB0dXJlKHN0YXJ0RXZlbnQucG9pbnRlcklkKTtcblxuICAgICAgICBjb25zdCBhbmltYXRpb25EdXJhdGlvbiA9IDFfMDAwO1xuICAgICAgICBjb25zdCBtYXhYID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIGxldCBjdXJyZW50RGlyZWN0aW9uOiBcImxlZnRcIiB8IFwicmlnaHRcIiB8IG51bGw7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IDA7XG5cbiAgICAgICAgY29uc3QgaGFuZGxlTW92ZSA9IChlOiBQb2ludGVyRXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBkaXJlY3Rpb24gPSBlLmNsaWVudFggPCBzdGFydEV2ZW50LmNsaWVudFggPyBcImxlZnRcIiA6IFwicmlnaHRcIjtcbiAgICAgICAgICBjb25zdCBkZWx0YSA9IGUuY2xpZW50WCAtIHN0YXJ0RXZlbnQuY2xpZW50WDtcbiAgICAgICAgICBwb3NpdGlvbiA9IE1hdGgubWF4KFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIE1hdGgubWluKFxuICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICBkaXJlY3Rpb24gPT09IFwibGVmdFwiXG4gICAgICAgICAgICAgICAgPyBNYXRoLmFicyhkZWx0YSkgLyBzdGFydEV2ZW50LmNsaWVudFhcbiAgICAgICAgICAgICAgICA6IGRlbHRhIC8gKG1heFggLSBzdGFydEV2ZW50LmNsaWVudFgpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChjdXJyZW50RGlyZWN0aW9uICE9IGRpcmVjdGlvbikge1xuICAgICAgICAgICAgY3VycmVudERpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgICAgIGNvbnN0IGFuaW1hdGlvbiA9IHRvcENhcmRFbC5hbmltYXRlKFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBbXG4gICAgICAgICAgICAgICAgICBgdHJhbnNsYXRlM2QoXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIGNhbGModmFyKC0teSkgKiB2YXIoLS1pKSksXG4gICAgICAgICAgICAgICAgICAgIGNhbGModmFyKC0teikgKiB2YXIoLS1pKSlcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIHJvdGF0ZVgodmFyKC0tcm90WCkpYCxcbiAgICAgICAgICAgICAgICAgIGB0cmFuc2xhdGUzZChcbiAgICAgICAgICAgICAgICAgICAgJHtkaXJlY3Rpb24gPT09IFwibGVmdFwiID8gXCItNTB2d1wiIDogXCI1MHZ3XCJ9LFxuICAgICAgICAgICAgICAgICAgICBjYWxjKHZhcigtLXkpICogdmFyKC0taSkpLFxuICAgICAgICAgICAgICAgICAgICBjYWxjKHZhcigtLXopICogdmFyKC0taSkpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICByb3RhdGVYKHZhcigtLXJvdFgpKWAsXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBbXCIxXCIsIFwiMC44XCIsIFwiMFwiXSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBhbmltYXRpb25EdXJhdGlvbixcbiAgICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZS1pbi1vdXRcIixcbiAgICAgICAgICAgICAgICBmaWxsOiBcImJvdGhcIixcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgYW5pbWF0aW9uLnBhdXNlKCk7XG4gICAgICAgICAgICB0b3BDYXJkQW5pbWF0aW9uLmN1cnJlbnQgPSBhbmltYXRpb247XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgdGhlIG51bWJlciBpcyBtb3JlIHByZWNpc2UgdGhhbiA1XG4gICAgICAgICAgYW5pbWF0aW9uVGltZS5jdXJyZW50ID0gcG9zaXRpb24gKiBhbmltYXRpb25EdXJhdGlvbjtcbiAgICAgICAgfTtcblxuICAgICAgICB0b3BDYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsIGhhbmRsZU1vdmUsIHtcbiAgICAgICAgICBwYXNzaXZlOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0b3BDYXJkRWwuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICBcImxvc3Rwb2ludGVyY2FwdHVyZVwiLFxuICAgICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHRvcENhcmRFbC5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgaGFuZGxlTW92ZSk7XG4gICAgICAgICAgICBhbmltYXRpb25UaW1lLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICAgICAgY2FyZEFuaW1hdGlvbnMuY3VycmVudD8uZm9yRWFjaCgoYW5pbWF0aW9uKSA9PiB7XG4gICAgICAgICAgICAgIGFuaW1hdGlvbi5yZXZlcnNlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdG9wQ2FyZEFuaW1hdGlvbi5jdXJyZW50Py5wbGF5KCk7XG4gICAgICAgICAgICBhd2FpdCB0b3BDYXJkQW5pbWF0aW9uLmN1cnJlbnQ/LmZpbmlzaCgpO1xuICAgICAgICAgICAgb25SYXRlKFwibGlrZVwiKTtcbiAgICAgICAgICAgIHNldFN3aXBlZENhcmRzKHN3aXBlZENhcmRzICsgMSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInJhdGluZ1wiKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHsgb25jZTogdHJ1ZSB9XG4gICAgICAgICk7XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBoYW5kbGVUb3VjaFN0YXJ0ID0gKGU6IEV2ZW50KSA9PiBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHRvcENhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLCBoYW5kbGVUb3VjaFN0YXJ0KTtcbiAgICAgIHRvcENhcmRFbC5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgaGFuZGxlUG9pbnRlckRvd24pO1xuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICB0b3BDYXJkRWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIGhhbmRsZVBvaW50ZXJEb3duKTtcbiAgICAgICAgdG9wQ2FyZEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIGhhbmRsZVRvdWNoU3RhcnQpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIFtzd2lwZWRDYXJkc11cbiAgKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiQ2FyZFN0YWNrXCI+XG4gICAgICB7Q2hpbGRyZW4ubWFwKGNoaWxkcmVuLCAoY2hpbGQsIGluZGV4KSA9PiB7XG4gICAgICAgIGlmIChpc1ZhbGlkRWxlbWVudChjaGlsZCkpIHtcbiAgICAgICAgICBpZiAoKGNoaWxkLnR5cGUgYXMgTmFtZWRFeG90aWNDb21wb25lbnQpPy5kaXNwbGF5TmFtZSA9PT0gXCJDYXJkXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBjbG9uZUVsZW1lbnQoY2hpbGQsIHtcbiAgICAgICAgICAgICAgcmVmOiAoY2FyZEVsOiBIVE1MRGl2RWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNhcmRFbHMuY3VycmVudC5zZXQoaW5kZXgsIGNhcmRFbCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSl9XG4gICAgPC9kaXY+XG4gICk7XG59O1xuIiwgImltcG9ydCB7IHVzZVJlZiwgdXNlRWZmZWN0IH0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcblxuZXhwb3J0IGNvbnN0IHVzZUFuaW1hdGlvbkZyYW1lID0gKFxuICBjYWxsYmFjazogKGRlbHRhVGltZTogbnVtYmVyKSA9PiB1bmtub3duLFxuICBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlXG4pID0+IHtcbiAgY29uc3QgcmVxdWVzdFJlZiA9IHVzZVJlZjxudW1iZXI+KCk7XG4gIGNvbnN0IHByZXZpb3VzVGltZVJlZiA9IHVzZVJlZjxudW1iZXI+KCk7XG5cbiAgY29uc3QgYW5pbWF0ZSA9ICh0aW1lOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgICBpZiAocHJldmlvdXNUaW1lUmVmLmN1cnJlbnQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBkZWx0YVRpbWUgPSB0aW1lIC0gcHJldmlvdXNUaW1lUmVmLmN1cnJlbnQ7XG4gICAgICBjYWxsYmFjayhkZWx0YVRpbWUpO1xuICAgIH1cbiAgICBwcmV2aW91c1RpbWVSZWYuY3VycmVudCA9IHRpbWU7XG4gICAgcmVxdWVzdFJlZi5jdXJyZW50ID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRpc2FibGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlcXVlc3RSZWYuY3VycmVudCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiByZXF1ZXN0UmVmLmN1cnJlbnQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUocmVxdWVzdFJlZi5jdXJyZW50KTtcbiAgICAgIH1cbiAgICB9O1xuICB9LCBbZGlzYWJsZWRdKTtcbn07XG4iLCAiaW1wb3J0IFJlYWN0IGZyb20gXCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9yZWFjdEAxNy4wLjE/ZHRzXCI7XG5pbXBvcnQgeyBMYXlvdXQgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9MYXlvdXQudHN4XCI7XG5pbXBvcnQgeyBTcGlubmVyIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvU3Bpbm5lci50c3hcIjtcblxuZXhwb3J0IGNvbnN0IExvYWRpbmcgPSAoKSA9PiAoXG4gIDxMYXlvdXQ+XG4gICAgPFNwaW5uZXIgLz5cbiAgPC9MYXlvdXQ+XG4pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQ0E7OztBQ0RBO0FBQUE7QUFBQTtBQUFBOzs7QUNBQTtBQVlPLElBQU0sU0FBUTtBQUFBLEVBQ25CO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxNQUVBLG9DQUFD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
