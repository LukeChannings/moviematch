import React, {
  Children,
  cloneElement,
  isValidElement,
  NamedExoticComponent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "https://cdn.skypack.dev/react@17.0.1?dts";
import { Rate } from "../../../../types/moviematch.ts";
import { useAnimationFrame } from "../hooks/useAnimationFrame.ts";

import "./CardStack.css";
import { Tr } from "./Tr.tsx";

interface CardStackProps {
  children: ReactNode;
  onRate(rating: Rate["rating"]): void;
}

const createAnimation = (
  element: HTMLElement,
  index: number,
  x = "0",
  opacity = "1",
) => {
  const effect = new KeyframeEffect(
    element,
    [
      {
        transform: `translate3d( 0, calc(var(--y) * ${index +
          1}), calc(var(--z) * ${index + 1}) ) rotateX(var(--rotX))`,
        opacity: "1",
      },
      {
        transform:
          `translate3d( ${x}, calc(var(--y) * ${index}), calc(var(--z) * ${index}) ) rotateX(var(--rotX))`,
        opacity,
      },
    ],
    {
      duration: 1_000,
      fill: "both",
      composite: "replace",
      iterationComposite: "replace",
    },
  );
  const animation = new Animation(effect, document.timeline);
  animation.pause();
  return animation;
};

export const CardStack = ({ children, onRate }: CardStackProps) => {
  const [topCardIndex, setTopCardIndex] = useState<number>(0);
  const cardStackEl = useRef<HTMLDivElement>(null);
  const cardEls = useRef(new Map<number, HTMLDivElement>());
  const cardAnimations = useRef<Animation[] | null>(null);
  const topCardAnimation = useRef<Animation | null>(null);
  const animationTime = useRef<number | null>(null);

  useAnimationFrame(
    (() => {
      let lastTime: number | null = null;
      return () => {
        if (
          animationTime.current !== lastTime &&
          animationTime.current !== null
        ) {
          lastTime = animationTime.current;
          if (cardAnimations.current !== null) {
            for (const animation of cardAnimations.current) {
              animation.currentTime = animationTime.current;
            }
          }
          if (topCardAnimation.current !== null) {
            topCardAnimation.current.currentTime = animationTime.current;
          }
        }
      };
    })(),
  );

  useEffect(
    function setAnimations() {
      cardAnimations.current = [...cardEls.current.values()].map((cardEl, i) =>
        createAnimation(cardEl, i)
      );
    },
    [topCardIndex],
  );

  useEffect(
    function handleSwipe() {
      const handlePointerDown = (startEvent: PointerEvent) => {
        if (
          (startEvent.pointerType === "mouse" && startEvent.button !== 0) ||
          startEvent.target instanceof HTMLButtonElement
        ) {
          return;
        }

        const topCardEl = cardEls.current.get(0)!;

        startEvent.preventDefault();
        cardStackEl.current!.setPointerCapture(startEvent.pointerId);

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
                : delta / (maxX - startEvent.clientX),
            ),
          );

          if (currentDirection != direction) {
            currentDirection = direction;
            topCardAnimation.current = createAnimation(
              topCardEl,
              0,
              `${currentDirection === "left" ? "-50vw" : "50vw"}`,
              "0",
            );
          }

          animationTime.current = position * animationDuration;
        };

        cardStackEl.current!.addEventListener("pointermove", handleMove, {
          passive: true,
        });

        cardStackEl.current!.addEventListener(
          "lostpointercapture",
          async () => {
            cardStackEl.current!.removeEventListener("pointermove", handleMove);
            animationTime.current = null;

            if (!topCardAnimation.current || !cardAnimations.current) {
              console.error(`No top card animation or cardAnimations`);
              return;
            }

            const isCompleteSwipe = position > 0.5;

            if (isCompleteSwipe) {
              // we don't want the user to get a handle on the card as it's animating out
              cardStackEl.current!.addEventListener(
                "pointerdown",
                handlePointerDown,
              );
            }

            try {
              await Promise.all(
                [...cardAnimations.current, topCardAnimation.current].map(
                  async (animation) => {
                    if (
                      animation.playState !== "finished" &&
                      animation.currentTime !== (isCompleteSwipe ? 1_000 : 0)
                    ) {
                      // when playbackRate is negative the animation is played in reverse
                      animation.playbackRate = isCompleteSwipe ? 3 : -3;
                      animation.play();
                      await animation.finished;
                      animation.pause();
                      animation.playbackRate = 1;
                    }
                  },
                ),
              );
            } catch (err) {
              if (err.name !== "AbortError") {
                console.error(err);
              }
            }

            if (isCompleteSwipe) {
              onRate(currentDirection === "left" ? "dislike" : "like");
              setTopCardIndex(topCardIndex + 1);
            }
          },
          { once: true },
        );
      };

      const handleTouchStart = (e: Event) => {
        if (e.target instanceof HTMLButtonElement) {
          return;
        }
        e.preventDefault();
      };

      cardStackEl.current!.addEventListener("touchstart", handleTouchStart);
      cardStackEl.current!.addEventListener("pointerdown", handlePointerDown);

      return () => {
        cardStackEl.current!.removeEventListener(
          "pointerdown",
          handlePointerDown,
        );
        cardStackEl.current!.removeEventListener(
          "touchstart",
          handleTouchStart,
        );
      };
    },
    [cardStackEl.current, topCardIndex],
  );

  const isEmpty = Children.count(children) === 0;

  return (
    <div className={`CardStack ${isEmpty ? "--empty" : ""}`} ref={cardStackEl}>
      {isEmpty && (
        <p className="CardStackEmptyMessage">
          <Tr name="RATE_SECTION_EXHAUSTED_CARDS" />
        </p>
      )}
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
