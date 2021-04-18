import React, { useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import styles from "./Toast.module.css";

export interface Toast {
  id: number | string;
  message: string;
  showTimeMs?: number;
  appearance?: "Success" | "Failure";
}

interface ToastProps {
  toasts?: Toast[];
  removeToast: (toast: Toast) => void;
}

const Toast = ({ toast }: { toast: Toast }) => (
  <div
    className={styles[`toast${toast.appearance ?? ""}`]}
  >
    {toast.message}
  </div>
);

export const ToastList = ({ toasts, removeToast }: ToastProps) => {
  useEffect(() => {
    if (toasts?.length) {
      const newToast = toasts[0];
      if (typeof newToast.showTimeMs === "number") {
        setTimeout(() => removeToast(newToast), newToast.showTimeMs);
      }
    }
  }, [toasts]);

  return (
    <TransitionGroup className={styles.toastList}>
      {toasts?.map((toast) => (
        <CSSTransition key={String(toast.id)} timeout={200} classNames="toast">
          <Toast toast={toast} />
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};
