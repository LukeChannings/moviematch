import React, { ReactNode, useState } from "react";

import "./Version.css";

export const Version = () => {
  const [index, setIndex] = useState<number>(0);

  const messages: ReactNode[] = [
    <>Version {import.meta.env.VERSION}</>,
    <>
      {`Made by `}
      <a href="https://twitter.com/LukeChannings" target="_blank">
        @LukeChannings
      </a>
    </>,
    <>For my beautiful wife Victoria ❤️</>,
    <a href="https://www.paypal.me/lukechannings">Buy me a coffee ☕️?</a>,
  ];

  return (
    <p
      className="Version"
      onClick={() => setIndex((index + 1) % messages.length)}
    >
      {messages[index]}
    </p>
  );
};
