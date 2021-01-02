import React, {
  ReactNode,
  Children,
  useRef,
  cloneElement,
  isValidElement,
  useEffect,
  NamedExoticComponent,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Rate } from "../../../../types/moviematch.d.ts";
import { useAnimationFrame } from "../hooks/useAnimationFrame.ts";

import "./CardStack.css";

interface CardStackProps {
  children: ReactNode;
  onRate(rating: Rate["rating"]): void;
}

export const CardStack = ({ children, onRate }: CardStackProps) => {
  const [swipedCards, setSwipedCards] = useState<number>(0);
  const cardEls = useRef(new Map<number, HTMLDivElement>());
  const cardAnimations = useRef<Animation[] | null>(null);
  const topCardAnimation = useRef<Animation | null>(null);
  const animationTime = useRef<number | null>(null);

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

  useEffect(
    function setAnimations() {
      console.log("setting animations", [...cardEls.current.values()]);
      cardAnimations.current = [...cardEls.current.values()].flatMap((cardEl) =>
        cardEl.getAnimations()
      );
      console.log(cardAnimations.current);
      cardAnimations.current.forEach((animation) => animation.pause());
    },
    [swipedCards]
  );

  useEffect(
    function handleSwipe() {
      const topCardEl = cardEls?.current.get(0);
      if (!topCardEl) {
        console.error("no top card!");
        return;
      }

      const handlePointerDown = (startEvent: PointerEvent) => {
        if (
          (startEvent.pointerType === "mouse" && startEvent.button !== 0) ||
          startEvent.target instanceof HTMLButtonElement
        ) {
          return;
        }

        startEvent.preventDefault();
        topCardEl.setPointerCapture(startEvent.pointerId);

        const animationDuration = 1_000;
        const maxX = window.innerWidth;
        let currentDirection: "left" | "right" | null;
        let position = 0;

        const handleMove = (e: PointerEvent) => {
          const direction = e.clientX < startEvent.clientX ? "left" : "right";
          const delta = e.clientX - startEvent.clientX;
          position = Math.max(
            0,
            Math.min(
              1,
              direction === "left"
                ? Math.abs(delta) / startEvent.clientX
                : delta / (maxX - startEvent.clientX)
            )
          );

          if (currentDirection != direction) {
            currentDirection = direction;
            const animation = topCardEl.animate(
              {
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
                  rotateX(var(--rotX))`,
                ],
                opacity: ["1", "0.8", "0"],
              },
              {
                duration: animationDuration,
                easing: "ease-in-out",
                fill: "both",
              }
            );

            animation.pause();
            topCardAnimation.current = animation;
          }

          // If the number is more precise than 5
          animationTime.current = position * animationDuration;
        };

        topCardEl.addEventListener("pointermove", handleMove, {
          passive: true,
        });

        topCardEl.addEventListener(
          "lostpointercapture",
          async () => {
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
          },
          { once: true }
        );
      };

      const handleTouchStart = (e: Event) => e.preventDefault();

      topCardEl.addEventListener("touchstart", handleTouchStart);
      topCardEl.addEventListener("pointerdown", handlePointerDown);

      return () => {
        topCardEl.removeEventListener("pointerdown", handlePointerDown);
        topCardEl.removeEventListener("touchstart", handleTouchStart);
      };
    },
    [swipedCards]
  );

  return (
    <div className="CardStack">
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          if ((child.type as NamedExoticComponent)?.displayName === "Card") {
            return cloneElement(child, {
              ref: (cardEl: HTMLDivElement) => {
                cardEls.current.set(index, cardEl);
              },
            });
          }
          return child;
        }
        return null;
      })}
    </div>
  );
};
