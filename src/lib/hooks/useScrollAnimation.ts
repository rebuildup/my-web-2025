import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type AnimationType =
  | "fadeIn"
  | "fadeInLeft"
  | "fadeInRight"
  | "fadeInUp"
  | "fadeInDown";

interface UseScrollAnimationOptions {
  type?: AnimationType;
  duration?: number;
  delay?: number;
  once?: boolean;
  start?: string;
  stagger?: number;
  childrenSelector?: string;
}

export const useScrollAnimation = <T extends HTMLElement>(
  options: UseScrollAnimationOptions = {}
) => {
  const {
    type = "fadeIn",
    duration = 0.6,
    delay = 0,
    once = true,
    start = "top bottom-=100",
    stagger = 0.15,
    childrenSelector,
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    let elements: HTMLElement[];

    if (childrenSelector) {
      elements = Array.from(
        ref.current.querySelectorAll(childrenSelector)
      ) as HTMLElement[];
    } else {
      elements = [ref.current];
    }

    const getAnimationProperties = (type: AnimationType) => {
      switch (type) {
        case "fadeInLeft":
          return {
            from: { opacity: 0, x: -50 },
            to: { opacity: 1, x: 0 },
          };
        case "fadeInRight":
          return {
            from: { opacity: 0, x: 50 },
            to: { opacity: 1, x: 0 },
          };
        case "fadeInUp":
          return {
            from: { opacity: 0, y: 50 },
            to: { opacity: 1, y: 0 },
          };
        case "fadeInDown":
          return {
            from: { opacity: 0, y: -50 },
            to: { opacity: 1, y: 0 },
          };
        case "fadeIn":
        default:
          return {
            from: { opacity: 0, y: 20 },
            to: { opacity: 1, y: 0 },
          };
      }
    };

    const animProps = getAnimationProperties(type);

    // Set initial state
    gsap.set(elements, animProps.from);

    // Create ScrollTrigger for animation
    ScrollTrigger.create({
      trigger: ref.current,
      start,
      onEnter: () => {
        gsap.to(elements, {
          ...animProps.to,
          duration,
          stagger: elements.length > 1 ? stagger : 0,
          delay,
          ease: "power3.out",
        });
      },
      onEnterBack: !once
        ? () => {
            gsap.to(elements, {
              ...animProps.to,
              duration,
              stagger: elements.length > 1 ? stagger : 0,
              delay,
              ease: "power3.out",
            });
          }
        : undefined,
      onLeave: !once
        ? () => {
            gsap.to(elements, {
              ...animProps.from,
              duration,
              stagger: elements.length > 1 ? stagger : 0,
              ease: "power3.in",
            });
          }
        : undefined,
      onLeaveBack: !once
        ? () => {
            gsap.to(elements, {
              ...animProps.from,
              duration,
              stagger: elements.length > 1 ? stagger : 0,
              ease: "power3.in",
            });
          }
        : undefined,
      once,
    });

    return () => {
      // Cleanup
      ScrollTrigger.getAll()
        .filter((trigger) => trigger.vars.trigger === ref.current)
        .forEach((trigger) => trigger.kill());
    };
  }, [type, duration, delay, once, start, stagger, childrenSelector]);

  return ref;
};

export default useScrollAnimation;
