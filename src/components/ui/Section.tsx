import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
  animate?: boolean;
  align?: "left" | "center" | "right";
}

const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  className = "",
  id,
  animate = true,
  align = "left",
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate && sectionRef.current) {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom-=100",
          once: true,
        },
      });

      if (titleRef.current) {
        timeline.fromTo(
          titleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
      }

      if (subtitleRef.current) {
        timeline.fromTo(
          subtitleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        );
      }

      if (contentRef.current) {
        timeline.fromTo(
          contentRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        );
      }
    }
  }, [animate]);

  const getAlignmentClass = () => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <section ref={sectionRef} id={id} className={`mb-12 ${className}`}>
      {title && (
        <h2
          ref={titleRef}
          className={`text-3xl font-bold text-gray-800 mb-4 ${getAlignmentClass()}`}
          style={{ opacity: animate ? 0 : 1 }}
        >
          {title}
        </h2>
      )}
      {subtitle && (
        <p
          ref={subtitleRef}
          className={`text-lg text-gray-600 mb-6 ${getAlignmentClass()}`}
          style={{ opacity: animate ? 0 : 1 }}
        >
          {subtitle}
        </p>
      )}
      <div ref={contentRef} style={{ opacity: animate ? 0 : 1 }}>
        {children}
      </div>
    </section>
  );
};

export default Section;
