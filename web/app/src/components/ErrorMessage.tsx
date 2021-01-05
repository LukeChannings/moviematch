import React from "https://cdn.skypack.dev/react@17.0.1?dts";

import "./ErrorMessage.css";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return <p className="ErrorMessage">{message}</p>;
};
