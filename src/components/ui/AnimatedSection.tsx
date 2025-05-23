// src/components/ui/AnimatedSection.tsx
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  animation?:
    | "fadeIn"
    | "fadeInUp"
    | "fadeInLeft"
    | "fadeInRight"
    | "fadeInDown"
    | "scale"
    | "none";
  threshold?: number; // percentage of element visible before triggering animation
  once?: boolean; // animate once or every time element comes into view
  stagger?: number; // for child elements when childrenSelector is provided
  childrenSelector?: string; // CSS selector for child elements to stagger
  id?: string;
}

interface AnimationProperties {
  from: Record<string, number>;
  to: Record<string, number>;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  animation = "fadeInUp",
  threshold = 0.2, // 20% of element is visible
  once = true,
  stagger = 0.1,
  childrenSelector,
  id,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || animation === "none") return;

    const section = sectionRef.current;

    // Properties for different animation types
    const animationProps: Record<string, AnimationProperties> = {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      fadeInUp: {
        from: { opacity: 0, y: 50 },
        to: { opacity: 1, y: 0 },
      },
      fadeInDown: {
        from: { opacity: 0, y: -50 },
        to: { opacity: 1, y: 0 },
      },
      fadeInLeft: {
        from: { opacity: 0, x: -50 },
        to: { opacity: 1, x: 0 },
      },
      fadeInRight: {
        from: { opacity: 0, x: 50 },
        to: { opacity: 1, x: 0 },
      },
      scale: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 },
      },
    };

    // Set initial state
    if (childrenSelector) {
      const elements = section.querySelectorAll(childrenSelector);
      gsap.set(elements, animationProps[animation].from);
    } else {
      gsap.set(section, animationProps[animation].from);
    }

    // Create ScrollTrigger
    ScrollTrigger.create({
      trigger: section,
      start: `top ${100 - threshold * 100}%`,
      onEnter: () => {
        if (childrenSelector) {
          const elements = section.querySelectorAll(childrenSelector);
          gsap.to(elements, {
            ...animationProps[animation].to,
            duration,
            stagger,
            delay,
            ease: "power3.out",
          });
        } else {
          gsap.to(section, {
            ...animationProps[animation].to,
            duration,
            delay,
            ease: "power3.out",
          });
        }
      },
      onEnterBack: !once
        ? () => {
            if (childrenSelector) {
              const elements = section.querySelectorAll(childrenSelector);
              gsap.to(elements, {
                ...animationProps[animation].to,
                duration,
                stagger,
                delay,
                ease: "power3.out",
              });
            } else {
              gsap.to(section, {
                ...animationProps[animation].to,
                duration,
                delay,
                ease: "power3.out",
              });
            }
          }
        : undefined,
      onLeave: !once
        ? () => {
            if (childrenSelector) {
              const elements = section.querySelectorAll(childrenSelector);
              gsap.to(elements, {
                ...animationProps[animation].from,
                duration,
                stagger,
                ease: "power3.in",
              });
            } else {
              gsap.to(section, {
                ...animationProps[animation].from,
                duration,
                ease: "power3.in",
              });
            }
          }
        : undefined,
      onLeaveBack: !once
        ? () => {
            if (childrenSelector) {
              const elements = section.querySelectorAll(childrenSelector);
              gsap.to(elements, {
                ...animationProps[animation].from,
                duration,
                stagger,
                ease: "power3.in",
              });
            } else {
              gsap.to(section, {
                ...animationProps[animation].from,
                duration,
                ease: "power3.in",
              });
            }
          }
        : undefined,
      once,
    });

    return () => {
      // Cleanup
      ScrollTrigger.getAll()
        .filter((trigger) => trigger.vars.trigger === section)
        .forEach((trigger) => trigger.kill());
    };
  }, [animation, childrenSelector, delay, duration, once, stagger, threshold]);

  return (
    <div
      ref={sectionRef}
      className={className}
      id={id}
      style={{ opacity: animation === "none" ? 1 : 0 }}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
