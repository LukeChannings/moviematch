import { useEffect, useRef } from "react";

export const useAnimationFrame = (
  callback: (deltaTime: number) => unknown,
  disabled: boolean = false,
) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = (time: number): void => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
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
