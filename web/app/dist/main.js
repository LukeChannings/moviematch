// src/main.tsx
import React10 from "https://cdn.skypack.dev/react@17.0.1?dts";
import {render} from "https://cdn.skypack.dev/react-dom@17.0.1?dts";

// src/components/Spinner.tsx
import React from "https://cdn.skypack.dev/react@17.0.1?dts";
var Spinner2 = () => /* @__PURE__ */ React.createElement("div", {
  className: "Spinner"
});

// src/screens/Login.tsx
import React6, {
  useContext,
  useState
} from "https://cdn.skypack.dev/react@17.0.1?dts";

// src/components/Logo.tsx
import React2 from "https://cdn.skypack.dev/react@17.0.1?dts";
var Logo2 = () => /* @__PURE__ */ React2.createElement("svg", {
  class: "Logo",
  viewBox: "0 0 104 20",
  xmlns: "http://www.w3.org/2000/svg"
}, /* @__PURE__ */ React2.createElement("path", {
  d: "M2.888 17V7.982h.036L6.074 17h2.178l3.15-9.108h.036V17h2.646V4.148h-3.978l-2.844 8.838h-.036L4.22 4.148H.242V17h2.646zm17.928.234c.732 0 1.395-.114 1.989-.342a4.236 4.236 0 001.521-.981c.42-.426.744-.939.972-1.539.228-.6.342-1.272.342-2.016s-.114-1.419-.342-2.025a4.358 4.358 0 00-.972-1.548 4.338 4.338 0 00-1.521-.99c-.594-.234-1.257-.351-1.989-.351-.732 0-1.392.117-1.98.351a4.356 4.356 0 00-1.512.99c-.42.426-.744.942-.972 1.548-.228.606-.342 1.281-.342 2.025s.114 1.416.342 2.016c.228.6.552 1.113.972 1.539.42.426.924.753 1.512.981.588.228 1.248.342 1.98.342zm0-1.908c-.432 0-.792-.084-1.08-.252a1.965 1.965 0 01-.693-.675 2.901 2.901 0 01-.369-.954 5.585 5.585 0 010-2.187c.072-.36.195-.678.369-.954.174-.276.405-.501.693-.675.288-.174.648-.261 1.08-.261.432 0 .795.087 1.089.261.294.174.528.399.702.675.174.276.297.594.369.954a5.585 5.585 0 010 2.187 2.901 2.901 0 01-.369.954 1.943 1.943 0 01-.702.675c-.294.168-.657.252-1.089.252zM32.444 17l3.15-9.306h-2.538l-1.962 6.354h-.036l-1.962-6.354h-2.682L29.6 17h2.844zm6.84-10.746V4.148h-2.556v2.106h2.556zm0 10.746V7.694h-2.556V17h2.556zm6.318.234c1.056 0 1.956-.24 2.7-.72.744-.48 1.296-1.278 1.656-2.394h-2.25c-.084.288-.312.561-.684.819-.372.258-.816.387-1.332.387-.72 0-1.272-.186-1.656-.558-.384-.372-.594-.972-.63-1.8h6.714a6.57 6.57 0 00-.18-2.07 5.067 5.067 0 00-.819-1.764 4.131 4.131 0 00-1.449-1.233c-.588-.306-1.278-.459-2.07-.459a4.82 4.82 0 00-1.935.378 4.575 4.575 0 00-1.503 1.035c-.42.438-.744.957-.972 1.557a5.428 5.428 0 00-.342 1.944c0 .72.111 1.38.333 1.98.222.6.537 1.116.945 1.548.408.432.906.765 1.494.999.588.234 1.248.351 1.98.351zm1.962-5.886h-4.158c.012-.18.051-.384.117-.612a1.88 1.88 0 01.99-1.161c.27-.138.609-.207 1.017-.207.624 0 1.089.168 1.395.504.306.336.519.828.639 1.476zM54.548 17V7.982h.036L57.734 17h2.178l3.15-9.108h.036V17h2.646V4.148h-3.978l-2.844 8.838h-.036L55.88 4.148h-3.978V17h2.646zm16.182.234a5.78 5.78 0 001.692-.252 3.33 3.33 0 001.44-.882 3.84 3.84 0 00.18.9h2.592c-.12-.192-.204-.48-.252-.864a9.724 9.724 0 01-.072-1.206v-4.842c0-.564-.126-1.017-.378-1.359a2.59 2.59 0 00-.972-.801 4.35 4.35 0 00-1.314-.387 10.43 10.43 0 00-1.422-.099c-.516 0-1.029.051-1.539.153-.51.102-.969.273-1.377.513-.408.24-.744.558-1.008.954-.264.396-.414.894-.45 1.494h2.556c.048-.504.216-.864.504-1.08.288-.216.684-.324 1.188-.324.228 0 .441.015.639.045s.372.09.522.18c.15.09.27.216.36.378.09.162.135.381.135.657.012.264-.066.465-.234.603-.168.138-.396.243-.684.315a6.82 6.82 0 01-.99.162c-.372.036-.75.084-1.134.144-.384.06-.765.141-1.143.243a3.226 3.226 0 00-1.008.459 2.333 2.333 0 00-.72.819c-.186.342-.279.777-.279 1.305 0 .48.081.894.243 1.242.162.348.387.636.675.864.288.228.624.396 1.008.504.384.108.798.162 1.242.162zm.954-1.692c-.204 0-.402-.018-.594-.054a1.443 1.443 0 01-.504-.189.966.966 0 01-.342-.369 1.202 1.202 0 01-.126-.576c0-.24.042-.438.126-.594.084-.156.195-.285.333-.387.138-.102.3-.183.486-.243s.375-.108.567-.144c.204-.036.408-.066.612-.09a8 8 0 00.585-.09c.186-.036.36-.081.522-.135.162-.054.297-.129.405-.225v.954c0 .144-.015.336-.045.576-.03.24-.111.477-.243.711a1.686 1.686 0 01-.612.603c-.276.168-.666.252-1.17.252zm10.224 1.548c.252 0 .51-.006.774-.018.264-.012.504-.036.72-.072v-1.98a3.58 3.58 0 01-.378.054c-.132.012-.27.018-.414.018-.432 0-.72-.072-.864-.216-.144-.144-.216-.432-.216-.864V9.404h1.872v-1.71H81.53v-2.79h-2.556v2.79h-1.548v1.71h1.548v5.49c0 .468.078.846.234 1.134.156.288.369.51.639.666.27.156.582.261.936.315.354.054.729.081 1.125.081zm7.128.144c1.236 0 2.25-.324 3.042-.972.792-.648 1.272-1.59 1.44-2.826h-2.466c-.084.576-.291 1.035-.621 1.377-.33.342-.801.513-1.413.513-.396 0-.732-.09-1.008-.27a2.017 2.017 0 01-.657-.693 3.174 3.174 0 01-.351-.945 5.055 5.055 0 010-2.079 3.11 3.11 0 01.369-.972c.174-.294.399-.534.675-.72.276-.186.618-.279 1.026-.279 1.092 0 1.722.534 1.89 1.602h2.502c-.036-.6-.18-1.119-.432-1.557a3.517 3.517 0 00-.981-1.098 4.252 4.252 0 00-1.368-.657 5.834 5.834 0 00-1.593-.216c-.756 0-1.428.126-2.016.378a4.243 4.243 0 00-1.494 1.053c-.408.45-.717.984-.927 1.602a6.2 6.2 0 00-.315 2.007c0 .696.114 1.335.342 1.917.228.582.546 1.083.954 1.503.408.42.903.747 1.485.981a5.093 5.093 0 001.917.351zM59 0c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10S53.477 0 59 0zm38.514 4.148V8.99h.054c.324-.54.738-.933 1.242-1.179s.996-.369 1.476-.369c.684 0 1.245.093 1.683.279.438.186.783.444 1.035.774.252.33.429.732.531 1.206a7.5 7.5 0 01.153 1.575V17h-2.556v-5.256c0-.768-.12-1.341-.36-1.719-.24-.378-.666-.567-1.278-.567-.696 0-1.2.207-1.512.621-.312.414-.468 1.095-.468 2.043V17h-2.556V4.148h2.556z",
  fill: "currentColor",
  "fill-rule": "nonzero"
}));

// src/components/Field.tsx
import React3 from "https://cdn.skypack.dev/react@17.0.1?dts";
var Field2 = ({
  label,
  name,
  value,
  paddingTop,
  onChange,
  errorMessage
}) => /* @__PURE__ */ React3.createElement("div", {
  className: `Field ${errorMessage ? "--invalid" : ""}`,
  style: paddingTop ? {marginTop: `var(--${paddingTop})`} : {}
}, /* @__PURE__ */ React3.createElement("label", {
  className: "Field_Label",
  htmlFor: `${name}-text-input`
}, label), /* @__PURE__ */ React3.createElement("input", {
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
}), errorMessage && /* @__PURE__ */ React3.createElement("p", {
  className: "Field_Error"
}, errorMessage));

// src/components/Button.tsx
import React4 from "https://cdn.skypack.dev/react@17.0.1?dts";
var Button2 = ({
  children,
  onPress,
  appearance,
  paddingTop,
  disabled,
  color
}) => /* @__PURE__ */ React4.createElement("button", {
  className: `Button ${appearance === "primary" ? "ButtonPrimary" : "ButtonSecondary"}`,
  style: {
    ...paddingTop ? {marginTop: `var(--${paddingTop})`} : {},
    ...color ? {"--bg-color": `var(--mm-${color})`} : {}
  },
  onClick: onPress,
  disabled
}, children);

// src/components/ButtonContainer.tsx
import React5 from "https://cdn.skypack.dev/react@17.0.1?dts";
var ButtonContainer2 = ({
  children,
  paddingTop
}) => /* @__PURE__ */ React5.createElement("div", {
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
  useEffect,
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
      console.log(e.data);
      try {
        const msg = JSON.parse(e.data);
        this.dispatchEvent(new MessageEvent(msg.type, {data: msg}));
      } catch (err) {
        console.error(err);
      }
    };
    this.waitForConnected = async () => {
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
    this.waitForMessage = async (type) => {
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

// src/state.ts
var initialState = {activeScreen: "login", client: getClient()};
function reducer(state3, action) {
  switch (action.type) {
    case "setScreen":
      return {...state3, activeScreen: action.payload};
    case "setConfig":
      return {...state3, config: action.payload};
    case "setUser":
      return {...state3, user: action.payload, activeScreen: "join"};
    default:
      return state3;
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
    name: userName,
    plexAuth: plexToken && clientId ? {plexToken, clientId} : void 0
  };
};
var useStore = () => {
  const [state3, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    state3.client.waitForMessage("config").then((config) => {
      dispatch({type: "setConfig", payload: config.payload});
    });
  }, [state3.client]);
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      let plexAuth;
      if (!user.plexAuth) {
        checkPin().then((_) => {
          plexAuth = _;
        }).catch(() => {
        }).finally(() => {
          dispatch({type: "setUser", payload: user});
        });
      } else {
        dispatch({type: "setUser", payload: user});
      }
    }
  }, []);
  return [state3, dispatch];
};

// src/screens/Login.tsx
var LoginScreen = ({handleDone}) => {
  const {client: client2, config} = useContext(MovieMatchContext);
  const [userName, setUserName] = useState(localStorage.getItem("userName"));
  const [userNameError, setUserNameError] = useState();
  return /* @__PURE__ */ React6.createElement("section", {
    className: "Screen LoginScreen"
  }, /* @__PURE__ */ React6.createElement(Logo2, null), /* @__PURE__ */ React6.createElement("form", {
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
      handleDone();
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
        handleDone();
      }
    }
  }, "Sign In with Plex"))));
};

// src/screens/Join.tsx
import React7, {useState as useState2} from "https://cdn.skypack.dev/react@17.0.1?dts";
var JoinScreen = ({handleDone}) => {
  const [roomName, setRoomName] = useState2();
  const [roomNameError, setRoomNameError] = useState2();
  return /* @__PURE__ */ React7.createElement("section", {
    className: "Screen JoinScreen"
  }, /* @__PURE__ */ React7.createElement(Logo2, null), /* @__PURE__ */ React7.createElement("form", {
    className: "JoinScreen_Form",
    onSubmit: (e) => {
      e.preventDefault();
    }
  }, /* @__PURE__ */ React7.createElement(Field2, {
    label: "Room Name",
    name: "roomName",
    value: roomName,
    errorMessage: roomNameError,
    onChange: setRoomName,
    paddingTop: "s4"
  }), /* @__PURE__ */ React7.createElement(ButtonContainer2, {
    paddingTop: "s7"
  }, /* @__PURE__ */ React7.createElement(Button2, {
    appearance: "primary",
    onPress: () => {
      if (!roomName) {
        setRoomNameError("A Room Name is required!");
        return;
      }
    }
  }, "Join"), /* @__PURE__ */ React7.createElement(Button2, {
    appearance: "secondary"
  }, "Create"))));
};

// src/screens/Create.tsx
import React8 from "https://cdn.skypack.dev/react@17.0.1?dts";
var CreateScreen = () => /* @__PURE__ */ React8.createElement("section", {
  className: "CreateScreen"
});

// src/screens/Rate.tsx
import React9 from "https://cdn.skypack.dev/react@17.0.1?dts";
var RateScreen = () => /* @__PURE__ */ React9.createElement("section", {
  className: "RateScreen"
});

// src/main.tsx
var MovieMatch = () => {
  const [store, dispatch] = useStore();
  if (!store.config) {
    return /* @__PURE__ */ React10.createElement("section", {
      className: "Screen"
    }, /* @__PURE__ */ React10.createElement(Spinner2, null));
  }
  return /* @__PURE__ */ React10.createElement(MovieMatchContext.Provider, {
    value: store
  }, (() => {
    switch (store.activeScreen) {
      case "login":
        return /* @__PURE__ */ React10.createElement(LoginScreen, {
          handleDone: () => {
            dispatch({type: "setScreen", payload: "join"});
          }
        });
      case "join":
        return /* @__PURE__ */ React10.createElement(JoinScreen, {
          handleDone: () => {
            dispatch({type: "setScreen", payload: "rate"});
          }
        });
      case "createRoom":
        return /* @__PURE__ */ React10.createElement(CreateScreen, null);
      case "rate":
        return /* @__PURE__ */ React10.createElement(RateScreen, null);
    }
  })());
};
render(/* @__PURE__ */ React10.createElement(MovieMatch, null), document.getElementById("app"));
if (window.innerHeight !== document.querySelector("body")?.getBoundingClientRect().height) {
  document.body.style.setProperty("--vh", window.innerHeight / 100 + "px");
  window.addEventListener("resize", () => {
    document.body.style.setProperty("--vh", window.innerHeight / 100 + "px");
  });
}
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL21haW4udHN4IiwgIi4uL3NyYy9jb21wb25lbnRzL1NwaW5uZXIudHN4IiwgIi4uL3NyYy9zY3JlZW5zL0xvZ2luLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9Mb2dvLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9GaWVsZC50c3giLCAiLi4vc3JjL2NvbXBvbmVudHMvQnV0dG9uLnRzeCIsICIuLi9zcmMvY29tcG9uZW50cy9CdXR0b25Db250YWluZXIudHN4IiwgIi4uL3NyYy9hcGkvcGxleC50di50cyIsICIuLi9zcmMvc3RhdGUudHMiLCAiLi4vc3JjL2FwaS9tb3ZpZW1hdGNoLnRzIiwgIi4uL3NyYy9zY3JlZW5zL0pvaW4udHN4IiwgIi4uL3NyYy9zY3JlZW5zL0NyZWF0ZS50c3giLCAiLi4vc3JjL3NjcmVlbnMvUmF0ZS50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0IH0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gXCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9yZWFjdC1kb21AMTcuMC4xP2R0c1wiO1xuXG5pbXBvcnQgXCIuL21haW4uY3NzXCI7XG5cbmltcG9ydCB7IFNwaW5uZXIgfSBmcm9tIFwiLi9jb21wb25lbnRzL1NwaW5uZXIudHN4XCI7XG5cbmltcG9ydCB7IExvZ2luU2NyZWVuIH0gZnJvbSBcIi4vc2NyZWVucy9Mb2dpbi50c3hcIjtcbmltcG9ydCB7IEpvaW5TY3JlZW4gfSBmcm9tIFwiLi9zY3JlZW5zL0pvaW4udHN4XCI7XG5pbXBvcnQgeyBDcmVhdGVTY3JlZW4gfSBmcm9tIFwiLi9zY3JlZW5zL0NyZWF0ZS50c3hcIjtcbmltcG9ydCB7IFJhdGVTY3JlZW4gfSBmcm9tIFwiLi9zY3JlZW5zL1JhdGUudHN4XCI7XG5pbXBvcnQgeyBNb3ZpZU1hdGNoQ29udGV4dCwgdXNlU3RvcmUgfSBmcm9tIFwiLi9zdGF0ZS50c1wiO1xuXG5jb25zdCBNb3ZpZU1hdGNoID0gKCkgPT4ge1xuICBjb25zdCBbc3RvcmUsIGRpc3BhdGNoXSA9IHVzZVN0b3JlKCk7XG5cbiAgaWYgKCFzdG9yZS5jb25maWcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiU2NyZWVuXCI+XG4gICAgICAgIDxTcGlubmVyIC8+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPE1vdmllTWF0Y2hDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtzdG9yZX0+XG4gICAgICB7KCgpID0+IHtcbiAgICAgICAgc3dpdGNoIChzdG9yZS5hY3RpdmVTY3JlZW4pIHtcbiAgICAgICAgICBjYXNlIFwibG9naW5cIjpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxMb2dpblNjcmVlblxuICAgICAgICAgICAgICAgIGhhbmRsZURvbmU9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJzZXRTY3JlZW5cIiwgcGF5bG9hZDogXCJqb2luXCIgfSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgY2FzZSBcImpvaW5cIjpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxKb2luU2NyZWVuXG4gICAgICAgICAgICAgICAgaGFuZGxlRG9uZT17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgZGlzcGF0Y2goeyB0eXBlOiBcInNldFNjcmVlblwiLCBwYXlsb2FkOiBcInJhdGVcIiB9KTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICBjYXNlIFwiY3JlYXRlUm9vbVwiOlxuICAgICAgICAgICAgcmV0dXJuIDxDcmVhdGVTY3JlZW4gLz47XG4gICAgICAgICAgY2FzZSBcInJhdGVcIjpcbiAgICAgICAgICAgIHJldHVybiA8UmF0ZVNjcmVlbiAvPjtcbiAgICAgICAgfVxuICAgICAgfSkoKX1cbiAgICA8L01vdmllTWF0Y2hDb250ZXh0LlByb3ZpZGVyPlxuICApO1xufTtcblxucmVuZGVyKDxNb3ZpZU1hdGNoIC8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFwcFwiKSk7XG5cbmlmIChcbiAgd2luZG93LmlubmVySGVpZ2h0ICE9PVxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKT8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0XG4pIHtcbiAgZG9jdW1lbnQuYm9keS5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdmhcIiwgd2luZG93LmlubmVySGVpZ2h0IC8gMTAwICsgXCJweFwiKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuc2V0UHJvcGVydHkoXCItLXZoXCIsIHdpbmRvdy5pbm5lckhlaWdodCAvIDEwMCArIFwicHhcIik7XG4gIH0pO1xufVxuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuXG5pbXBvcnQgXCIuL1NwaW5uZXIuY3NzXCI7XG5cbmV4cG9ydCBjb25zdCBTcGlubmVyID0gKCkgPT4gPGRpdiBjbGFzc05hbWU9XCJTcGlubmVyXCI+PC9kaXY+O1xuIiwgImltcG9ydCBSZWFjdCwge1xuICB1c2VDb250ZXh0LFxuICB1c2VTdGF0ZSxcbn0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcbmltcG9ydCBcIi4vTG9naW4uY3NzXCI7XG5pbXBvcnQgeyBMb2dvIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvTG9nby50c3hcIjtcbmltcG9ydCB7IEZpZWxkIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvRmllbGQudHN4XCI7XG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tIFwiLi4vY29tcG9uZW50cy9CdXR0b24udHN4XCI7XG5pbXBvcnQgeyBCdXR0b25Db250YWluZXIgfSBmcm9tIFwiLi4vY29tcG9uZW50cy9CdXR0b25Db250YWluZXIudHN4XCI7XG5pbXBvcnQgeyBnZXRQbGV4Q3JlZGVudGlhbHMgfSBmcm9tIFwiLi4vYXBpL3BsZXgudHYudHNcIjtcbmltcG9ydCB7IE1vdmllTWF0Y2hDb250ZXh0IH0gZnJvbSBcIi4uL3N0YXRlLnRzXCI7XG5cbmludGVyZmFjZSBMb2dpblNjcmVlblByb3BzIHtcbiAgaGFuZGxlRG9uZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgTG9naW5TY3JlZW4gPSAoeyBoYW5kbGVEb25lIH06IExvZ2luU2NyZWVuUHJvcHMpID0+IHtcbiAgY29uc3QgeyBjbGllbnQsIGNvbmZpZyB9ID0gdXNlQ29udGV4dChNb3ZpZU1hdGNoQ29udGV4dCk7XG4gIGNvbnN0IFt1c2VyTmFtZSwgc2V0VXNlck5hbWVdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4oXG4gICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyTmFtZVwiKVxuICApO1xuICBjb25zdCBbdXNlck5hbWVFcnJvciwgc2V0VXNlck5hbWVFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCB1bmRlZmluZWQ+KCk7XG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJTY3JlZW4gTG9naW5TY3JlZW5cIj5cbiAgICAgIDxMb2dvIC8+XG4gICAgICA8Zm9ybVxuICAgICAgICBjbGFzc05hbWU9XCJMb2dpblNjcmVlbl9Gb3JtXCJcbiAgICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8RmllbGRcbiAgICAgICAgICBsYWJlbD1cIk5hbWVcIlxuICAgICAgICAgIG5hbWU9XCJ1c2VyTmFtZVwiXG4gICAgICAgICAgdmFsdWU9e3VzZXJOYW1lID8/IFwiXCJ9XG4gICAgICAgICAgb25DaGFuZ2U9eyh1c2VyTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBzZXRVc2VyTmFtZSh1c2VyTmFtZSk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJOYW1lXCIsIHVzZXJOYW1lKTtcbiAgICAgICAgICB9fVxuICAgICAgICAgIGVycm9yTWVzc2FnZT17dXNlck5hbWVFcnJvcn1cbiAgICAgICAgLz5cblxuICAgICAgICA8QnV0dG9uQ29udGFpbmVyIHBhZGRpbmdUb3A9XCJzN1wiPlxuICAgICAgICAgIHshY29uZmlnPy5yZXF1aXJlUGxleExvZ2luICYmIChcbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgYXBwZWFyYW5jZT1cInByaW1hcnlcIlxuICAgICAgICAgICAgICBvblByZXNzPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF1c2VyTmFtZSkge1xuICAgICAgICAgICAgICAgICAgc2V0VXNlck5hbWVFcnJvcihcIkEgVXNlcm5hbWUgaXMgcmVxdWlyZWQhXCIpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQubG9naW4oe1xuICAgICAgICAgICAgICAgICAgdXNlck5hbWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlRG9uZSgpO1xuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBTaWduIEluXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGFwcGVhcmFuY2U9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIGNvbG9yPVwicGxleC1jb2xvclwiXG4gICAgICAgICAgICBvblByZXNzPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghdXNlck5hbWUpIHtcbiAgICAgICAgICAgICAgICBzZXRVc2VyTmFtZUVycm9yKFwiQSBVc2VybmFtZSBpcyByZXF1aXJlZCFcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNvbnN0IHBsZXhBdXRoID0gYXdhaXQgZ2V0UGxleENyZWRlbnRpYWxzKCk7XG5cbiAgICAgICAgICAgICAgaWYgKHBsZXhBdXRoKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LmxvZ2luKHtcbiAgICAgICAgICAgICAgICAgIHVzZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgcGxleEF1dGgsXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBoYW5kbGVEb25lKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgU2lnbiBJbiB3aXRoIFBsZXhcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9CdXR0b25Db250YWluZXI+XG4gICAgICA8L2Zvcm0+XG4gICAgPC9zZWN0aW9uPlxuICApO1xufTtcbiIsICJpbXBvcnQgUmVhY3QgZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcblxuaW1wb3J0IFwiLi9Mb2dvLmNzc1wiO1xuXG5leHBvcnQgY29uc3QgTG9nbyA9ICgpID0+IChcbiAgPHN2ZyBjbGFzcz1cIkxvZ29cIiB2aWV3Qm94PVwiMCAwIDEwNCAyMFwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cbiAgICA8cGF0aFxuICAgICAgZD1cIk0yLjg4OCAxN1Y3Ljk4MmguMDM2TDYuMDc0IDE3aDIuMTc4bDMuMTUtOS4xMDhoLjAzNlYxN2gyLjY0NlY0LjE0OGgtMy45NzhsLTIuODQ0IDguODM4aC0uMDM2TDQuMjIgNC4xNDhILjI0MlYxN2gyLjY0NnptMTcuOTI4LjIzNGMuNzMyIDAgMS4zOTUtLjExNCAxLjk4OS0uMzQyYTQuMjM2IDQuMjM2IDAgMDAxLjUyMS0uOTgxYy40Mi0uNDI2Ljc0NC0uOTM5Ljk3Mi0xLjUzOS4yMjgtLjYuMzQyLTEuMjcyLjM0Mi0yLjAxNnMtLjExNC0xLjQxOS0uMzQyLTIuMDI1YTQuMzU4IDQuMzU4IDAgMDAtLjk3Mi0xLjU0OCA0LjMzOCA0LjMzOCAwIDAwLTEuNTIxLS45OWMtLjU5NC0uMjM0LTEuMjU3LS4zNTEtMS45ODktLjM1MS0uNzMyIDAtMS4zOTIuMTE3LTEuOTguMzUxYTQuMzU2IDQuMzU2IDAgMDAtMS41MTIuOTljLS40Mi40MjYtLjc0NC45NDItLjk3MiAxLjU0OC0uMjI4LjYwNi0uMzQyIDEuMjgxLS4zNDIgMi4wMjVzLjExNCAxLjQxNi4zNDIgMi4wMTZjLjIyOC42LjU1MiAxLjExMy45NzIgMS41MzkuNDIuNDI2LjkyNC43NTMgMS41MTIuOTgxLjU4OC4yMjggMS4yNDguMzQyIDEuOTguMzQyem0wLTEuOTA4Yy0uNDMyIDAtLjc5Mi0uMDg0LTEuMDgtLjI1MmExLjk2NSAxLjk2NSAwIDAxLS42OTMtLjY3NSAyLjkwMSAyLjkwMSAwIDAxLS4zNjktLjk1NCA1LjU4NSA1LjU4NSAwIDAxMC0yLjE4N2MuMDcyLS4zNi4xOTUtLjY3OC4zNjktLjk1NC4xNzQtLjI3Ni40MDUtLjUwMS42OTMtLjY3NS4yODgtLjE3NC42NDgtLjI2MSAxLjA4LS4yNjEuNDMyIDAgLjc5NS4wODcgMS4wODkuMjYxLjI5NC4xNzQuNTI4LjM5OS43MDIuNjc1LjE3NC4yNzYuMjk3LjU5NC4zNjkuOTU0YTUuNTg1IDUuNTg1IDAgMDEwIDIuMTg3IDIuOTAxIDIuOTAxIDAgMDEtLjM2OS45NTQgMS45NDMgMS45NDMgMCAwMS0uNzAyLjY3NWMtLjI5NC4xNjgtLjY1Ny4yNTItMS4wODkuMjUyek0zMi40NDQgMTdsMy4xNS05LjMwNmgtMi41MzhsLTEuOTYyIDYuMzU0aC0uMDM2bC0xLjk2Mi02LjM1NGgtMi42ODJMMjkuNiAxN2gyLjg0NHptNi44NC0xMC43NDZWNC4xNDhoLTIuNTU2djIuMTA2aDIuNTU2em0wIDEwLjc0NlY3LjY5NGgtMi41NTZWMTdoMi41NTZ6bTYuMzE4LjIzNGMxLjA1NiAwIDEuOTU2LS4yNCAyLjctLjcyLjc0NC0uNDggMS4yOTYtMS4yNzggMS42NTYtMi4zOTRoLTIuMjVjLS4wODQuMjg4LS4zMTIuNTYxLS42ODQuODE5LS4zNzIuMjU4LS44MTYuMzg3LTEuMzMyLjM4Ny0uNzIgMC0xLjI3Mi0uMTg2LTEuNjU2LS41NTgtLjM4NC0uMzcyLS41OTQtLjk3Mi0uNjMtMS44aDYuNzE0YTYuNTcgNi41NyAwIDAwLS4xOC0yLjA3IDUuMDY3IDUuMDY3IDAgMDAtLjgxOS0xLjc2NCA0LjEzMSA0LjEzMSAwIDAwLTEuNDQ5LTEuMjMzYy0uNTg4LS4zMDYtMS4yNzgtLjQ1OS0yLjA3LS40NTlhNC44MiA0LjgyIDAgMDAtMS45MzUuMzc4IDQuNTc1IDQuNTc1IDAgMDAtMS41MDMgMS4wMzVjLS40Mi40MzgtLjc0NC45NTctLjk3MiAxLjU1N2E1LjQyOCA1LjQyOCAwIDAwLS4zNDIgMS45NDRjMCAuNzIuMTExIDEuMzguMzMzIDEuOTguMjIyLjYuNTM3IDEuMTE2Ljk0NSAxLjU0OC40MDguNDMyLjkwNi43NjUgMS40OTQuOTk5LjU4OC4yMzQgMS4yNDguMzUxIDEuOTguMzUxem0xLjk2Mi01Ljg4NmgtNC4xNThjLjAxMi0uMTguMDUxLS4zODQuMTE3LS42MTJhMS44OCAxLjg4IDAgMDEuOTktMS4xNjFjLjI3LS4xMzguNjA5LS4yMDcgMS4wMTctLjIwNy42MjQgMCAxLjA4OS4xNjggMS4zOTUuNTA0LjMwNi4zMzYuNTE5LjgyOC42MzkgMS40NzZ6TTU0LjU0OCAxN1Y3Ljk4MmguMDM2TDU3LjczNCAxN2gyLjE3OGwzLjE1LTkuMTA4aC4wMzZWMTdoMi42NDZWNC4xNDhoLTMuOTc4bC0yLjg0NCA4LjgzOGgtLjAzNkw1NS44OCA0LjE0OGgtMy45NzhWMTdoMi42NDZ6bTE2LjE4Mi4yMzRhNS43OCA1Ljc4IDAgMDAxLjY5Mi0uMjUyIDMuMzMgMy4zMyAwIDAwMS40NC0uODgyIDMuODQgMy44NCAwIDAwLjE4LjloMi41OTJjLS4xMi0uMTkyLS4yMDQtLjQ4LS4yNTItLjg2NGE5LjcyNCA5LjcyNCAwIDAxLS4wNzItMS4yMDZ2LTQuODQyYzAtLjU2NC0uMTI2LTEuMDE3LS4zNzgtMS4zNTlhMi41OSAyLjU5IDAgMDAtLjk3Mi0uODAxIDQuMzUgNC4zNSAwIDAwLTEuMzE0LS4zODcgMTAuNDMgMTAuNDMgMCAwMC0xLjQyMi0uMDk5Yy0uNTE2IDAtMS4wMjkuMDUxLTEuNTM5LjE1My0uNTEuMTAyLS45NjkuMjczLTEuMzc3LjUxMy0uNDA4LjI0LS43NDQuNTU4LTEuMDA4Ljk1NC0uMjY0LjM5Ni0uNDE0Ljg5NC0uNDUgMS40OTRoMi41NTZjLjA0OC0uNTA0LjIxNi0uODY0LjUwNC0xLjA4LjI4OC0uMjE2LjY4NC0uMzI0IDEuMTg4LS4zMjQuMjI4IDAgLjQ0MS4wMTUuNjM5LjA0NXMuMzcyLjA5LjUyMi4xOGMuMTUuMDkuMjcuMjE2LjM2LjM3OC4wOS4xNjIuMTM1LjM4MS4xMzUuNjU3LjAxMi4yNjQtLjA2Ni40NjUtLjIzNC42MDMtLjE2OC4xMzgtLjM5Ni4yNDMtLjY4NC4zMTVhNi44MiA2LjgyIDAgMDEtLjk5LjE2MmMtLjM3Mi4wMzYtLjc1LjA4NC0xLjEzNC4xNDQtLjM4NC4wNi0uNzY1LjE0MS0xLjE0My4yNDNhMy4yMjYgMy4yMjYgMCAwMC0xLjAwOC40NTkgMi4zMzMgMi4zMzMgMCAwMC0uNzIuODE5Yy0uMTg2LjM0Mi0uMjc5Ljc3Ny0uMjc5IDEuMzA1IDAgLjQ4LjA4MS44OTQuMjQzIDEuMjQyLjE2Mi4zNDguMzg3LjYzNi42NzUuODY0LjI4OC4yMjguNjI0LjM5NiAxLjAwOC41MDQuMzg0LjEwOC43OTguMTYyIDEuMjQyLjE2MnptLjk1NC0xLjY5MmMtLjIwNCAwLS40MDItLjAxOC0uNTk0LS4wNTRhMS40NDMgMS40NDMgMCAwMS0uNTA0LS4xODkuOTY2Ljk2NiAwIDAxLS4zNDItLjM2OSAxLjIwMiAxLjIwMiAwIDAxLS4xMjYtLjU3NmMwLS4yNC4wNDItLjQzOC4xMjYtLjU5NC4wODQtLjE1Ni4xOTUtLjI4NS4zMzMtLjM4Ny4xMzgtLjEwMi4zLS4xODMuNDg2LS4yNDNzLjM3NS0uMTA4LjU2Ny0uMTQ0Yy4yMDQtLjAzNi40MDgtLjA2Ni42MTItLjA5YTggOCAwIDAwLjU4NS0uMDljLjE4Ni0uMDM2LjM2LS4wODEuNTIyLS4xMzUuMTYyLS4wNTQuMjk3LS4xMjkuNDA1LS4yMjV2Ljk1NGMwIC4xNDQtLjAxNS4zMzYtLjA0NS41NzYtLjAzLjI0LS4xMTEuNDc3LS4yNDMuNzExYTEuNjg2IDEuNjg2IDAgMDEtLjYxMi42MDNjLS4yNzYuMTY4LS42NjYuMjUyLTEuMTcuMjUyem0xMC4yMjQgMS41NDhjLjI1MiAwIC41MS0uMDA2Ljc3NC0uMDE4LjI2NC0uMDEyLjUwNC0uMDM2LjcyLS4wNzJ2LTEuOThhMy41OCAzLjU4IDAgMDEtLjM3OC4wNTRjLS4xMzIuMDEyLS4yNy4wMTgtLjQxNC4wMTgtLjQzMiAwLS43Mi0uMDcyLS44NjQtLjIxNi0uMTQ0LS4xNDQtLjIxNi0uNDMyLS4yMTYtLjg2NFY5LjQwNGgxLjg3MnYtMS43MUg4MS41M3YtMi43OWgtMi41NTZ2Mi43OWgtMS41NDh2MS43MWgxLjU0OHY1LjQ5YzAgLjQ2OC4wNzguODQ2LjIzNCAxLjEzNC4xNTYuMjg4LjM2OS41MS42MzkuNjY2LjI3LjE1Ni41ODIuMjYxLjkzNi4zMTUuMzU0LjA1NC43MjkuMDgxIDEuMTI1LjA4MXptNy4xMjguMTQ0YzEuMjM2IDAgMi4yNS0uMzI0IDMuMDQyLS45NzIuNzkyLS42NDggMS4yNzItMS41OSAxLjQ0LTIuODI2aC0yLjQ2NmMtLjA4NC41NzYtLjI5MSAxLjAzNS0uNjIxIDEuMzc3LS4zMy4zNDItLjgwMS41MTMtMS40MTMuNTEzLS4zOTYgMC0uNzMyLS4wOS0xLjAwOC0uMjdhMi4wMTcgMi4wMTcgMCAwMS0uNjU3LS42OTMgMy4xNzQgMy4xNzQgMCAwMS0uMzUxLS45NDUgNS4wNTUgNS4wNTUgMCAwMTAtMi4wNzkgMy4xMSAzLjExIDAgMDEuMzY5LS45NzJjLjE3NC0uMjk0LjM5OS0uNTM0LjY3NS0uNzIuMjc2LS4xODYuNjE4LS4yNzkgMS4wMjYtLjI3OSAxLjA5MiAwIDEuNzIyLjUzNCAxLjg5IDEuNjAyaDIuNTAyYy0uMDM2LS42LS4xOC0xLjExOS0uNDMyLTEuNTU3YTMuNTE3IDMuNTE3IDAgMDAtLjk4MS0xLjA5OCA0LjI1MiA0LjI1MiAwIDAwLTEuMzY4LS42NTcgNS44MzQgNS44MzQgMCAwMC0xLjU5My0uMjE2Yy0uNzU2IDAtMS40MjguMTI2LTIuMDE2LjM3OGE0LjI0MyA0LjI0MyAwIDAwLTEuNDk0IDEuMDUzYy0uNDA4LjQ1LS43MTcuOTg0LS45MjcgMS42MDJhNi4yIDYuMiAwIDAwLS4zMTUgMi4wMDdjMCAuNjk2LjExNCAxLjMzNS4zNDIgMS45MTcuMjI4LjU4Mi41NDYgMS4wODMuOTU0IDEuNTAzLjQwOC40Mi45MDMuNzQ3IDEuNDg1Ljk4MWE1LjA5MyA1LjA5MyAwIDAwMS45MTcuMzUxek01OSAwYzUuNTIzIDAgMTAgNC40NzcgMTAgMTBzLTQuNDc3IDEwLTEwIDEwLTEwLTQuNDc3LTEwLTEwUzUzLjQ3NyAwIDU5IDB6bTM4LjUxNCA0LjE0OFY4Ljk5aC4wNTRjLjMyNC0uNTQuNzM4LS45MzMgMS4yNDItMS4xNzlzLjk5Ni0uMzY5IDEuNDc2LS4zNjljLjY4NCAwIDEuMjQ1LjA5MyAxLjY4My4yNzkuNDM4LjE4Ni43ODMuNDQ0IDEuMDM1Ljc3NC4yNTIuMzMuNDI5LjczMi41MzEgMS4yMDZhNy41IDcuNSAwIDAxLjE1MyAxLjU3NVYxN2gtMi41NTZ2LTUuMjU2YzAtLjc2OC0uMTItMS4zNDEtLjM2LTEuNzE5LS4yNC0uMzc4LS42NjYtLjU2Ny0xLjI3OC0uNTY3LS42OTYgMC0xLjIuMjA3LTEuNTEyLjYyMS0uMzEyLjQxNC0uNDY4IDEuMDk1LS40NjggMi4wNDNWMTdoLTIuNTU2VjQuMTQ4aDIuNTU2elwiXG4gICAgICBmaWxsPVwiY3VycmVudENvbG9yXCJcbiAgICAgIGZpbGwtcnVsZT1cIm5vbnplcm9cIlxuICAgIC8+XG4gIDwvc3ZnPlxuKTtcbiIsICJpbXBvcnQgUmVhY3QgZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcbmltcG9ydCBcIi4vRmllbGQuY3NzXCI7XG5cbmludGVyZmFjZSBGaWVsZFByb3BzIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2YWx1ZT86IHN0cmluZztcbiAgbGFiZWw6IHN0cmluZztcbiAgcGFkZGluZ1RvcD86IFwiczFcIiB8IFwiczJcIiB8IFwiczNcIiB8IFwiczRcIiB8IFwiczVcIiB8IFwiczZcIiB8IFwiczdcIjtcbiAgb25DaGFuZ2U/KHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuICBlcnJvck1lc3NhZ2U/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjb25zdCBGaWVsZCA9ICh7XG4gIGxhYmVsLFxuICBuYW1lLFxuICB2YWx1ZSxcbiAgcGFkZGluZ1RvcCxcbiAgb25DaGFuZ2UsXG4gIGVycm9yTWVzc2FnZSxcbn06IEZpZWxkUHJvcHMpID0+IChcbiAgPGRpdlxuICAgIGNsYXNzTmFtZT17YEZpZWxkICR7ZXJyb3JNZXNzYWdlID8gXCItLWludmFsaWRcIiA6IFwiXCJ9YH1cbiAgICBzdHlsZT17cGFkZGluZ1RvcCA/IHsgbWFyZ2luVG9wOiBgdmFyKC0tJHtwYWRkaW5nVG9wfSlgIH0gOiB7fX1cbiAgPlxuICAgIDxsYWJlbCBjbGFzc05hbWU9XCJGaWVsZF9MYWJlbFwiIGh0bWxGb3I9e2Ake25hbWV9LXRleHQtaW5wdXRgfT5cbiAgICAgIHtsYWJlbH1cbiAgICA8L2xhYmVsPlxuICAgIDxpbnB1dFxuICAgICAgY2xhc3NOYW1lPVwiRmllbGRfSW5wdXRcIlxuICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgbmFtZT17bmFtZX1cbiAgICAgIGlkPXtgJHtuYW1lfS10ZXh0LWlucHV0YH1cbiAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICBpZiAodHlwZW9mIG9uQ2hhbmdlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICBvbkNoYW5nZShlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH19XG4gICAgLz5cbiAgICB7ZXJyb3JNZXNzYWdlICYmIDxwIGNsYXNzTmFtZT1cIkZpZWxkX0Vycm9yXCI+e2Vycm9yTWVzc2FnZX08L3A+fVxuICA8L2Rpdj5cbik7XG4iLCAiaW1wb3J0IFJlYWN0IGZyb20gXCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9yZWFjdEAxNy4wLjE/ZHRzXCI7XG5pbXBvcnQgeyBDb2xvciwgU3BhY2luZyB9IGZyb20gXCIuLi90eXBlcy50c1wiO1xuaW1wb3J0IFwiLi9CdXR0b24uY3NzXCI7XG5cbmludGVyZmFjZSBCdXR0b25Qcm9wcyB7XG4gIGFwcGVhcmFuY2U6IFwicHJpbWFyeVwiIHwgXCJzZWNvbmRhcnlcIjtcbiAgY2hpbGRyZW46IHN0cmluZztcbiAgcGFkZGluZ1RvcD86IFNwYWNpbmc7XG4gIG9uUHJlc3M/KCk6IHZvaWQ7XG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgY29sb3I/OiBDb2xvcjtcbn1cblxuZXhwb3J0IGNvbnN0IEJ1dHRvbiA9ICh7XG4gIGNoaWxkcmVuLFxuICBvblByZXNzLFxuICBhcHBlYXJhbmNlLFxuICBwYWRkaW5nVG9wLFxuICBkaXNhYmxlZCxcbiAgY29sb3IsXG59OiBCdXR0b25Qcm9wcykgPT4gKFxuICA8YnV0dG9uXG4gICAgY2xhc3NOYW1lPXtgQnV0dG9uICR7XG4gICAgICBhcHBlYXJhbmNlID09PSBcInByaW1hcnlcIiA/IFwiQnV0dG9uUHJpbWFyeVwiIDogXCJCdXR0b25TZWNvbmRhcnlcIlxuICAgIH1gfVxuICAgIHN0eWxlPXt7XG4gICAgICAuLi4ocGFkZGluZ1RvcCA/IHsgbWFyZ2luVG9wOiBgdmFyKC0tJHtwYWRkaW5nVG9wfSlgIH0gOiB7fSksXG4gICAgICAuLi4oY29sb3IgPyB7IFwiLS1iZy1jb2xvclwiOiBgdmFyKC0tbW0tJHtjb2xvcn0pYCB9IDoge30pLFxuICAgIH19XG4gICAgb25DbGljaz17b25QcmVzc31cbiAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gID5cbiAgICB7Y2hpbGRyZW59XG4gIDwvYnV0dG9uPlxuKTtcbiIsICJpbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSBcImh0dHBzOi8vY2RuLnNreXBhY2suZGV2L3JlYWN0QDE3LjAuMT9kdHNcIjtcblxuaW1wb3J0IFwiLi9CdXR0b25Db250YWluZXIuY3NzXCI7XG5cbmludGVyZmFjZSBCdXR0b25Db250YWluZXJQcm9wcyB7XG4gIGNoaWxkcmVuOiBSZWFjdE5vZGU7XG4gIHBhZGRpbmdUb3A/OiBcInMxXCIgfCBcInMyXCIgfCBcInMzXCIgfCBcInM0XCIgfCBcInM1XCIgfCBcInM2XCIgfCBcInM3XCI7XG59XG5cbmV4cG9ydCBjb25zdCBCdXR0b25Db250YWluZXIgPSAoe1xuICBjaGlsZHJlbixcbiAgcGFkZGluZ1RvcCxcbn06IEJ1dHRvbkNvbnRhaW5lclByb3BzKSA9PiAoXG4gIDxkaXZcbiAgICBjbGFzc05hbWU9XCJCdXR0b25Db250YWluZXJcIlxuICAgIHN0eWxlPXtwYWRkaW5nVG9wID8geyBwYWRkaW5nVG9wOiBgdmFyKC0tJHtwYWRkaW5nVG9wfSlgIH0gOiB7fX1cbiAgPlxuICAgIHtjaGlsZHJlbn1cbiAgPC9kaXY+XG4pO1xuIiwgIi8qKlxuICogcGxleC50diBBdXRoZW50aWNhdGlvblxuICogU2VlIC0gaHR0cHM6Ly9mb3J1bXMucGxleC50di90L2F1dGhlbnRpY2F0aW5nLXdpdGgtcGxleC82MDkzNzBcbiAqL1xuaW1wb3J0IHsgTG9naW4gfSBmcm9tIFwiLi4vLi4vLi4vLi4vdHlwZXMvbW92aWVtYXRjaC5kLnRzXCI7XG5cbmNvbnN0IEFQUF9OQU1FID0gXCJNb3ZpZU1hdGNoXCI7XG5jb25zdCBDTElFTlRfSUQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInBsZXhDbGllbnRJZFwiKSA/PyBnZW5lcmF0ZUNsaWVudElkKCk7XG5cbmludGVyZmFjZSBQbGV4UElOIHtcbiAgaWQ6IHN0cmluZztcbiAgY29kZTogc3RyaW5nO1xuICBhdXRoVG9rZW46IHN0cmluZyB8IG51bGw7XG4gIGV4cGlyZXNBdDogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZUNsaWVudElkKCkge1xuICBjb25zdCBjaGFyYWN0ZXJzID1cbiAgICBcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5XCI7XG4gIGNvbnN0IGNsaWVudElkID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMzAgfSlcbiAgICAubWFwKChfKSA9PiBjaGFyYWN0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNoYXJhY3RlcnMubGVuZ3RoKV0pXG4gICAgLmpvaW4oXCJcIik7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwicGxleENsaWVudElkXCIsIGNsaWVudElkKTtcbiAgcmV0dXJuIGNsaWVudElkO1xufVxuXG5leHBvcnQgY29uc3Qgc2lnbkluID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCBwaW5SZXEgPSBhd2FpdCBmZXRjaChgaHR0cHM6Ly9wbGV4LnR2L2FwaS92Mi9waW5zYCwge1xuICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgaGVhZGVyczoge1xuICAgICAgYWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICB9LFxuICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuICAgICAgc3Ryb25nOiBcInRydWVcIixcbiAgICAgIFwiWC1QbGV4LVByb2R1Y3RcIjogQVBQX05BTUUsXG4gICAgICBcIlgtUGxleC1DbGllbnQtSWRlbnRpZmllclwiOiBDTElFTlRfSUQsXG4gICAgfSksXG4gIH0pO1xuXG4gIGlmIChwaW5SZXEub2spIHtcbiAgICBjb25zdCBwaW46IFBsZXhQSU4gPSBhd2FpdCBwaW5SZXEuanNvbigpO1xuXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJwbGV4VHZQaW5cIiwgSlNPTi5zdHJpbmdpZnkocGluKSk7XG5cbiAgICBjb25zdCBzZWFyY2ggPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgIGNsaWVudElEOiBDTElFTlRfSUQsXG4gICAgICBjb2RlOiBwaW4uY29kZSxcbiAgICAgIFwiY29udGV4dFtkZXZpY2VdW3Byb2R1Y3RdXCI6IEFQUF9OQU1FLFxuICAgICAgZm9yd2FyZFVybDogbG9jYXRpb24uaHJlZixcbiAgICB9KTtcblxuICAgIGxvY2F0aW9uLmhyZWYgPSBgaHR0cHM6Ly9hcHAucGxleC50di9hdXRoIz8ke1N0cmluZyhzZWFyY2gpfWA7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja1BpbiA9IGFzeW5jICgpID0+IHtcbiAgY29uc3QgcGxleFR2UGluID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJwbGV4VHZQaW5cIik7XG4gIGNvbnN0IHBpbjogUGxleFBJTiA9IEpTT04ucGFyc2UocGxleFR2UGluID8/IFwibnVsbFwiKTtcblxuICBpZiAocGluICYmIE51bWJlcihuZXcgRGF0ZShwaW4uZXhwaXJlc0F0KSkgPiBEYXRlLm5vdygpICYmICFwaW4uYXV0aFRva2VuKSB7XG4gICAgY29uc3Qgc2VhcmNoID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICBzdHJvbmc6IFwidHJ1ZVwiLFxuICAgICAgXCJYLVBsZXgtQ2xpZW50LUlkZW50aWZpZXJcIjogQ0xJRU5UX0lELFxuICAgICAgY29kZTogcGluLmNvZGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXEgPSBhd2FpdCBmZXRjaChcbiAgICAgIGBodHRwczovL3BsZXgudHYvYXBpL3YyL3BpbnMvJHtwaW4uaWR9PyR7U3RyaW5nKHNlYXJjaCl9YCxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgKTtcblxuICAgIGlmICghcmVxLm9rKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cmVxLnN0YXR1c306ICR7YXdhaXQgcmVxLnRleHQoKX1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhOiBQbGV4UElOID0gYXdhaXQgcmVxLmpzb24oKTtcblxuICAgIGlmICghZGF0YS5hdXRoVG9rZW4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkxvZ2luIGZhaWxlZC4uLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJwbGV4VHZQaW5cIik7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInBsZXhUb2tlblwiLCBkYXRhLmF1dGhUb2tlbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNsaWVudElkOiBDTElFTlRfSUQsXG4gICAgICBwbGV4VG9rZW46IGRhdGEuYXV0aFRva2VuLFxuICAgIH07XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRQbGV4Q3JlZGVudGlhbHMgPSBhc3luYyAoKTogUHJvbWlzZTxMb2dpbltcInBsZXhBdXRoXCJdPiA9PiB7XG4gIGNvbnN0IHBsZXhUdlBpbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwicGxleFR2UGluXCIpO1xuXG4gIGNvbnN0IHBpbjogUGxleFBJTiA9IEpTT04ucGFyc2UocGxleFR2UGluID8/IFwibnVsbFwiKTtcblxuICBpZiAoIXBpbiB8fCBOdW1iZXIobmV3IERhdGUocGluLmV4cGlyZXNBdCkpIDwgRGF0ZS5ub3coKSkge1xuICAgIGF3YWl0IHNpZ25JbigpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBhd2FpdCBjaGVja1BpbigpO1xufTtcbiIsICJpbXBvcnQge1xuICBjcmVhdGVDb250ZXh0LFxuICB1c2VFZmZlY3QsXG4gIHVzZVJlZHVjZXIsXG59IGZyb20gXCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9yZWFjdEAxNy4wLjE/ZHRzXCI7XG5pbXBvcnQgeyBDb25maWcgfSBmcm9tIFwiLi4vLi4vLi4vdHlwZXMvbW92aWVtYXRjaC5kLnRzXCI7XG5pbXBvcnQgeyBnZXRDbGllbnQsIE1vdmllTWF0Y2hDbGllbnQgfSBmcm9tIFwiLi9hcGkvbW92aWVtYXRjaC50c1wiO1xuaW1wb3J0IHsgY2hlY2tQaW4gfSBmcm9tIFwiLi9hcGkvcGxleC50di50c1wiO1xuXG5leHBvcnQgdHlwZSBTY3JlZW5OYW1lID0gXCJsb2dpblwiIHwgXCJqb2luXCIgfCBcImNyZWF0ZVJvb21cIiB8IFwicmF0ZVwiO1xuXG5pbnRlcmZhY2UgVXNlciB7XG4gIG5hbWU6IHN0cmluZztcbiAgYXZhdGFyPzogc3RyaW5nO1xuICBwbGV4QXV0aD86IHtcbiAgICBjbGllbnRJZDogc3RyaW5nO1xuICAgIHBsZXhUb2tlbjogc3RyaW5nO1xuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0b3JlIHtcbiAgYWN0aXZlU2NyZWVuOiBTY3JlZW5OYW1lO1xuICBjbGllbnQ6IE1vdmllTWF0Y2hDbGllbnQ7XG4gIGNvbmZpZz86IENvbmZpZztcbiAgdXNlcj86IFVzZXI7XG59XG5cbmNvbnN0IGluaXRpYWxTdGF0ZTogU3RvcmUgPSB7IGFjdGl2ZVNjcmVlbjogXCJsb2dpblwiLCBjbGllbnQ6IGdldENsaWVudCgpIH07XG5cbmludGVyZmFjZSBBY3Rpb248SywgUD4ge1xuICB0eXBlOiBLO1xuICBwYXlsb2FkOiBQO1xufVxuXG50eXBlIEFjdGlvbnMgPVxuICB8IEFjdGlvbjxcInNldFNjcmVlblwiLCBTY3JlZW5OYW1lPlxuICB8IEFjdGlvbjxcInNldENvbmZpZ1wiLCBDb25maWc+XG4gIHwgQWN0aW9uPFwic2V0VXNlclwiLCBVc2VyPjtcblxuZnVuY3Rpb24gcmVkdWNlcihzdGF0ZTogU3RvcmUsIGFjdGlvbjogQWN0aW9ucyk6IFN0b3JlIHtcbiAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgIGNhc2UgXCJzZXRTY3JlZW5cIjpcbiAgICAgIHJldHVybiB7IC4uLnN0YXRlLCBhY3RpdmVTY3JlZW46IGFjdGlvbi5wYXlsb2FkIH07XG4gICAgY2FzZSBcInNldENvbmZpZ1wiOlxuICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIGNvbmZpZzogYWN0aW9uLnBheWxvYWQgfTtcbiAgICBjYXNlIFwic2V0VXNlclwiOlxuICAgICAgcmV0dXJuIHsgLi4uc3RhdGUsIHVzZXI6IGFjdGlvbi5wYXlsb2FkLCBhY3RpdmVTY3JlZW46IFwiam9pblwiIH07XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgTW92aWVNYXRjaENvbnRleHQgPSBjcmVhdGVDb250ZXh0PFN0b3JlPihpbml0aWFsU3RhdGUpO1xuXG5jb25zdCBnZXRTdG9yZWRVc2VyID0gKCk6IFVzZXIgfCBudWxsID0+IHtcbiAgY29uc3QgdXNlck5hbWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJOYW1lXCIpO1xuICBjb25zdCBwbGV4VG9rZW4gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInBsZXhUb2tlblwiKTtcbiAgY29uc3QgY2xpZW50SWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInBsZXhDbGllbnRJZFwiKTtcblxuICBpZiAoIXVzZXJOYW1lKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4ge1xuICAgIG5hbWU6IHVzZXJOYW1lLFxuICAgIHBsZXhBdXRoOiBwbGV4VG9rZW4gJiYgY2xpZW50SWQgPyB7IHBsZXhUb2tlbiwgY2xpZW50SWQgfSA6IHVuZGVmaW5lZCxcbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VTdG9yZSA9ICgpID0+IHtcbiAgY29uc3QgW3N0YXRlLCBkaXNwYXRjaF0gPSB1c2VSZWR1Y2VyKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzdGF0ZS5jbGllbnQud2FpdEZvck1lc3NhZ2UoXCJjb25maWdcIikudGhlbigoY29uZmlnKSA9PiB7XG4gICAgICBkaXNwYXRjaCh7IHR5cGU6IFwic2V0Q29uZmlnXCIsIHBheWxvYWQ6IGNvbmZpZy5wYXlsb2FkIH0pO1xuICAgIH0pO1xuICB9LCBbc3RhdGUuY2xpZW50XSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1c2VyID0gZ2V0U3RvcmVkVXNlcigpO1xuICAgIGlmICh1c2VyKSB7XG4gICAgICBsZXQgcGxleEF1dGg6IFVzZXJbXCJwbGV4QXV0aFwiXTtcblxuICAgICAgaWYgKCF1c2VyLnBsZXhBdXRoKSB7XG4gICAgICAgIGNoZWNrUGluKClcbiAgICAgICAgICAudGhlbigoXykgPT4ge1xuICAgICAgICAgICAgcGxleEF1dGggPSBfO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKCgpID0+IHt9KVxuICAgICAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIGRpc3BhdGNoKHsgdHlwZTogXCJzZXRVc2VyXCIsIHBheWxvYWQ6IHVzZXIgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkaXNwYXRjaCh7IHR5cGU6IFwic2V0VXNlclwiLCBwYXlsb2FkOiB1c2VyIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSwgW10pO1xuXG4gIHJldHVybiBbc3RhdGUsIGRpc3BhdGNoXSBhcyBjb25zdDtcbn07XG4iLCAiaW1wb3J0IHtcbiAgQ2xpZW50TWVzc2FnZSxcbiAgSm9pblJvb21SZXF1ZXN0LFxuICBKb2luUm9vbVN1Y2Nlc3MsXG4gIExvZ2luLFxuICBTZXJ2ZXJNZXNzYWdlLFxufSBmcm9tIFwiLi4vLi4vLi4vLi4vdHlwZXMvbW92aWVtYXRjaC5kLnRzXCI7XG5cbmNvbnN0IEFQSV9VUkwgPSAoKCkgPT4ge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICB1cmwucGF0aG5hbWUgPSBcIi9hcGkvd3NcIjtcbiAgdXJsLnByb3RvY29sID0gdXJsLnByb3RvY29sID09PSBcImh0dHBzOlwiID8gXCJ3c3M6XCIgOiBcIndzOlwiO1xuICByZXR1cm4gdXJsLmhyZWY7XG59KSgpO1xuXG50eXBlIEZpbHRlckNsaWVudE1lc3NhZ2VCeVR5cGU8XG4gIEEgZXh0ZW5kcyBDbGllbnRNZXNzYWdlLFxuICBDbGllbnRNZXNzYWdlVHlwZSBleHRlbmRzIHN0cmluZ1xuPiA9IEEgZXh0ZW5kcyB7IHR5cGU6IENsaWVudE1lc3NhZ2VUeXBlIH0gPyBBIDogbmV2ZXI7XG5cbmV4cG9ydCBjbGFzcyBNb3ZpZU1hdGNoQ2xpZW50IGV4dGVuZHMgRXZlbnRUYXJnZXQge1xuICB3czogV2ViU29ja2V0O1xuICByZWNvbm5lY3Rpb25BdHRlbXB0czogbnVtYmVyID0gMDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMud3MgPSBuZXcgV2ViU29ja2V0KEFQSV9VUkwpO1xuICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5oYW5kbGVNZXNzYWdlKTtcbiAgICB0aGlzLndzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbG9zZVwiLCB0aGlzLmhhbmRsZUNsb3NlKTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlTWVzc2FnZSA9IChlOiBNZXNzYWdlRXZlbnQ8c3RyaW5nPikgPT4ge1xuICAgIGNvbnNvbGUubG9nKGUuZGF0YSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1zZzogQ2xpZW50TWVzc2FnZSA9IEpTT04ucGFyc2UoZS5kYXRhKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgTWVzc2FnZUV2ZW50KG1zZy50eXBlLCB7IGRhdGE6IG1zZyB9KSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfVxuICB9O1xuXG4gIHdhaXRGb3JDb25uZWN0ZWQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKHRoaXMud3MucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy53cy5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCAoKSA9PiByZXNvbHZlKHRydWUpLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgcHJpdmF0ZSBoYW5kbGVDbG9zZSA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgV2ViU29ja2V0IGNsb3NlZCFgKTtcbiAgfTtcblxuICB3YWl0Rm9yTWVzc2FnZSA9IGFzeW5jIDxLIGV4dGVuZHMgQ2xpZW50TWVzc2FnZVtcInR5cGVcIl0+KFxuICAgIHR5cGU6IEtcbiAgKTogUHJvbWlzZTxGaWx0ZXJDbGllbnRNZXNzYWdlQnlUeXBlPENsaWVudE1lc3NhZ2UsIEs+PiA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIChlOiBFdmVudCkgPT4ge1xuICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgTWVzc2FnZUV2ZW50KSB7XG4gICAgICAgICAgICByZXNvbHZlKGUuZGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgb25jZTogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfTtcblxuICBsb2dpbiA9IGFzeW5jIChsb2dpbjogTG9naW4pID0+IHtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JDb25uZWN0ZWQoKTtcblxuICAgIHRoaXMuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcImxvZ2luXCIsIHBheWxvYWQ6IGxvZ2luIH0pO1xuXG4gICAgY29uc3QgbXNnID0gYXdhaXQgUHJvbWlzZS5yYWNlKFtcbiAgICAgIHRoaXMud2FpdEZvck1lc3NhZ2UoXCJsb2dpblN1Y2Nlc3NcIiksXG4gICAgICB0aGlzLndhaXRGb3JNZXNzYWdlKFwibG9naW5FcnJvclwiKSxcbiAgICBdKTtcblxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJsb2dpbkVycm9yXCIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeShtc2cucGF5bG9hZCkpO1xuICAgIH1cbiAgfTtcblxuICBqb2luUm9vbSA9IGFzeW5jIChcbiAgICBqb2luUm9vbVJlcXVlc3Q6IEpvaW5Sb29tUmVxdWVzdFxuICApOiBQcm9taXNlPEpvaW5Sb29tU3VjY2Vzcz4gPT4ge1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckNvbm5lY3RlZCgpO1xuXG4gICAgdGhpcy5zZW5kTWVzc2FnZSh7XG4gICAgICB0eXBlOiBcImpvaW5Sb29tXCIsXG4gICAgICBwYXlsb2FkOiBqb2luUm9vbVJlcXVlc3QsXG4gICAgfSk7XG5cbiAgICBjb25zdCBtc2cgPSBhd2FpdCBQcm9taXNlLnJhY2UoW1xuICAgICAgdGhpcy53YWl0Rm9yTWVzc2FnZShcImpvaW5Sb29tU3VjY2Vzc1wiKSxcbiAgICAgIHRoaXMud2FpdEZvck1lc3NhZ2UoXCJqb2luUm9vbUVycm9yXCIpLFxuICAgIF0pO1xuXG4gICAgaWYgKG1zZy50eXBlID09PSBcImpvaW5Sb29tRXJyb3JcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KG1zZy5wYXlsb2FkKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG1zZy5wYXlsb2FkO1xuICB9O1xuXG4gIHNlbmRNZXNzYWdlKG1zZzogU2VydmVyTWVzc2FnZSkge1xuICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKTtcbiAgfVxufVxuXG5sZXQgY2xpZW50OiBNb3ZpZU1hdGNoQ2xpZW50O1xuXG5leHBvcnQgY29uc3QgZ2V0Q2xpZW50ID0gKCk6IE1vdmllTWF0Y2hDbGllbnQgPT4ge1xuICBpZiAoIWNsaWVudCkge1xuICAgIGNsaWVudCA9IG5ldyBNb3ZpZU1hdGNoQ2xpZW50KCk7XG4gIH1cblxuICByZXR1cm4gY2xpZW50O1xufTtcbiIsICJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuaW1wb3J0IFwiLi9Kb2luLmNzc1wiO1xuaW1wb3J0IHsgTG9nbyB9IGZyb20gXCIuLi9jb21wb25lbnRzL0xvZ28udHN4XCI7XG5pbXBvcnQgeyBGaWVsZCB9IGZyb20gXCIuLi9jb21wb25lbnRzL0ZpZWxkLnRzeFwiO1xuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvQnV0dG9uLnRzeFwiO1xuaW1wb3J0IHsgQnV0dG9uQ29udGFpbmVyIH0gZnJvbSBcIi4uL2NvbXBvbmVudHMvQnV0dG9uQ29udGFpbmVyLnRzeFwiO1xuaW1wb3J0IHsgTW92aWVNYXRjaENsaWVudCB9IGZyb20gXCIuLi9hcGkvbW92aWVtYXRjaC50c1wiO1xuXG5pbnRlcmZhY2UgSm9pblNjcmVlblByb3BzIHtcbiAgaGFuZGxlRG9uZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgSm9pblNjcmVlbiA9ICh7IGhhbmRsZURvbmUgfTogSm9pblNjcmVlblByb3BzKSA9PiB7XG4gIGNvbnN0IFtyb29tTmFtZSwgc2V0Um9vbU5hbWVdID0gdXNlU3RhdGU8c3RyaW5nIHwgdW5kZWZpbmVkPigpO1xuICBjb25zdCBbcm9vbU5hbWVFcnJvciwgc2V0Um9vbU5hbWVFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCB1bmRlZmluZWQ+KCk7XG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJTY3JlZW4gSm9pblNjcmVlblwiPlxuICAgICAgPExvZ28gLz5cbiAgICAgIDxmb3JtXG4gICAgICAgIGNsYXNzTmFtZT1cIkpvaW5TY3JlZW5fRm9ybVwiXG4gICAgICAgIG9uU3VibWl0PXsoZSkgPT4ge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPEZpZWxkXG4gICAgICAgICAgbGFiZWw9XCJSb29tIE5hbWVcIlxuICAgICAgICAgIG5hbWU9XCJyb29tTmFtZVwiXG4gICAgICAgICAgdmFsdWU9e3Jvb21OYW1lfVxuICAgICAgICAgIGVycm9yTWVzc2FnZT17cm9vbU5hbWVFcnJvcn1cbiAgICAgICAgICBvbkNoYW5nZT17c2V0Um9vbU5hbWV9XG4gICAgICAgICAgcGFkZGluZ1RvcD1cInM0XCJcbiAgICAgICAgLz5cbiAgICAgICAgPEJ1dHRvbkNvbnRhaW5lciBwYWRkaW5nVG9wPVwiczdcIj5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBhcHBlYXJhbmNlPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBvblByZXNzPXsoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghcm9vbU5hbWUpIHtcbiAgICAgICAgICAgICAgICBzZXRSb29tTmFtZUVycm9yKFwiQSBSb29tIE5hbWUgaXMgcmVxdWlyZWQhXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBKb2luXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiBhcHBlYXJhbmNlPVwic2Vjb25kYXJ5XCI+Q3JlYXRlPC9CdXR0b24+XG4gICAgICAgIDwvQnV0dG9uQ29udGFpbmVyPlxuICAgICAgPC9mb3JtPlxuICAgIDwvc2VjdGlvbj5cbiAgKTtcbn07XG4iLCAiaW1wb3J0IFJlYWN0IGZyb20gXCJodHRwczovL2Nkbi5za3lwYWNrLmRldi9yZWFjdEAxNy4wLjE/ZHRzXCI7XG5cbmV4cG9ydCBjb25zdCBDcmVhdGVTY3JlZW4gPSAoKSA9PiA8c2VjdGlvbiBjbGFzc05hbWU9XCJDcmVhdGVTY3JlZW5cIj48L3NlY3Rpb24+O1xuIiwgImltcG9ydCBSZWFjdCBmcm9tIFwiaHR0cHM6Ly9jZG4uc2t5cGFjay5kZXYvcmVhY3RAMTcuMC4xP2R0c1wiO1xuXG5pbXBvcnQgXCIuL1JhdGUuY3NzXCI7XG5cbmV4cG9ydCBjb25zdCBSYXRlU2NyZWVuID0gKCkgPT4gPHNlY3Rpb24gY2xhc3NOYW1lPVwiUmF0ZVNjcmVlblwiPjwvc2VjdGlvbj47XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQUE7QUFDQTs7O0FDREE7QUFJTyxJQUFNLFdBQVUsTUFBTSxvQ0FBQyxPQUFEO0FBQUEsRUFBSyxXQUFVO0FBQUE7OztBQ0o1QztBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFJTyxJQUFNLFFBQU8sTUFDbEIscUNBQUMsT0FBRDtBQUFBLEVBQUssT0FBTTtBQUFBLEVBQU8sU0FBUTtBQUFBLEVBQWEsT0FBTTtBQUFBLEdBQzNDLHFDQUFDLFFBQUQ7QUFBQSxFQUNFLEdBQUU7QUFBQSxFQUNGLE1BQUs7QUFBQSxFQUNMLGFBQVU7QUFBQTs7O0FDVGhCO0FBWU8sSUFBTSxTQUFRO0FBQUEsRUFDbkI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLE1BRUEscUNBQUMsT0FBRDtBQUFBLEVBQ0UsV0FBVyxTQUFTLGVBQWUsY0FBYztBQUFBLEVBQ2pELE9BQU8sYUFBYSxDQUFFLFdBQVcsU0FBUyxpQkFBa0I7QUFBQSxHQUU1RCxxQ0FBQyxTQUFEO0FBQUEsRUFBTyxXQUFVO0FBQUEsRUFBYyxTQUFTLEdBQUc7QUFBQSxHQUN4QyxRQUVILHFDQUFDLFNBQUQ7QUFBQSxFQUNFLFdBQVU7QUFBQSxFQUNWLE1BQUs7QUFBQSxFQUNMO0FBQUEsRUFDQSxJQUFJLEdBQUc7QUFBQSxFQUNQO0FBQUEsRUFDQSxVQUFVO0FBQ1IsUUFBSSxPQUFPLGFBQWE7QUFDdEIsZUFBUyxFQUFFLE9BQU87QUFBQTtBQUFBO0FBQUEsSUFJdkIsZ0JBQWdCLHFDQUFDLEtBQUQ7QUFBQSxFQUFHLFdBQVU7QUFBQSxHQUFlOzs7QUN2Q2pEO0FBYU8sSUFBTSxVQUFTO0FBQUEsRUFDcEI7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLE1BRUEscUNBQUMsVUFBRDtBQUFBLEVB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
