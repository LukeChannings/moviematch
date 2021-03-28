import React from "react";

import "./ErrorMessage.css";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return <p className="ErrorMessage">{message}</p>;
};
