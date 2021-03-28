import React, { useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import "./Toast.css";

export interface Toast {
  id: number;
  message: string;
  showTimeMs: number;
  appearance?: "Success" | "Failure";
}

interface ToastProps {
  toasts?: Toast[];
  removeToast: (toast: Toast) => void;
}

const Toast = ({ toast }: { toast: Toast }) => (
  <div
    className={`Toast ${toast.appearance ? `Toast${toast.appearance}` : ""}`}
  >
    {toast.message}
  </div>
);

export const ToastList = ({ toasts, removeToast }: ToastProps) => {
  useEffect(() => {
    if (toasts?.length) {
      const newToast = toasts[0];
      setTimeout(() => removeToast(newToast), newToast.showTimeMs);
    }
  }, [toasts]);

  return (
    <TransitionGroup className="ToastList">
      {toasts?.map((toast) => (
        <CSSTransition key={String(toast.id)} timeout={200} classNames="Toast">
          <Toast toast={toast} />
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};
