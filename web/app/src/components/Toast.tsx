import React, { useEffect } from "https://cdn.skypack.dev/react@17.0.1?dts";
import {
  CSSTransition,
  TransitionGroup,
} from "https://cdn.skypack.dev/react-transition-group@4.4.1?dts";

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
