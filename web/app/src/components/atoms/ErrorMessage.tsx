import React from "react";

import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return <p className={styles.errorMessage}>{message}</p>;
};
