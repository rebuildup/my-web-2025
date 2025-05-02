// src/components/ui/Card.tsx
import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
  variant?: "default" | "outlined" | "elevated" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  radius?: "none" | "sm" | "md" | "lg" | "full";
  hoverEffect?: "lift" | "glow" | "border" | "scale" | "none";
  as?: React.ElementType;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  animate = true,
  onClick,
  hoverable = false,
  variant = "default",
  padding = "md",
  radius = "md",
  hoverEffect = "lift",
  as: Component = "div",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (animate && cardRef.current) {
      // Initial reveal animation
      ScrollTrigger.create({
        trigger: cardRef.current,
        start: "top bottom-=100",
        onEnter: () => {
          gsap.fromTo(
            cardRef.current,
            {
              y: 30,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
            }
          );
        },
        once: true,
      });
    }

    if (hoverable && cardRef.current && hoverEffect !== "none") {
      const card = cardRef.current;
      const tl = gsap.timeline({ paused: true });

      // Different hover effects
      switch (hoverEffect) {
        case "lift":
          tl.to(card, {
            y: -8,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            duration: 0.4,
            ease: "power3.out",
          });
          break;
        case "glow":
          tl.to(card, {
            boxShadow: "0 0 15px 5px rgba(0, 117, 255, 0.2)",
            duration: 0.4,
            ease: "power3.out",
          });
          break;
        case "border":
          tl.to(card, {
            borderColor: "#0075ff", // primary-500
            duration: 0.3,
            ease: "power2.out",
          });
          break;
        case "scale":
          tl.to(card, {
            scale: 1.03,
            duration: 0.3,
            ease: "power2.out",
          });
          break;
      }

      // Animate any icons inside the card
      const icons = card.querySelectorAll(".card-icon");
      if (icons.length > 0) {
        tl.to(
          icons,
          {
            scale: 1.1,
            color: "#0075ff", // primary-500
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.3"
        ); // Overlap with the main animation
      }

      // Add event listeners
      const handleMouseEnter = () => tl.play();
      const handleMouseLeave = () => tl.reverse();

      card.addEventListener("mouseenter", handleMouseEnter);
      card.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        card.removeEventListener("mouseenter", handleMouseEnter);
        card.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [animate, hoverable, hoverEffect]);

  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case "outlined":
        return "bg-white border-2 border-gray-200";
      case "elevated":
        return "bg-white shadow-md";
      case "flat":
        return "bg-gray-50";
      default:
        return "bg-white shadow-sm";
    }
  };

  // Padding classes
  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return "p-0";
      case "sm":
        return "p-3";
      case "lg":
        return "p-8";
      default:
        return "p-6";
    }
  };

  // Border radius classes
  const getRadiusClasses = () => {
    switch (radius) {
      case "none":
        return "rounded-none";
      case "sm":
        return "rounded-sm";
      case "lg":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };

  const classes = `
    ${getVariantClasses()}
    ${getPaddingClasses()}
    ${getRadiusClasses()}
    ${hoverable ? "cursor-pointer transition-all duration-300" : ""}
    ${onClick ? "cursor-pointer" : ""}
    ${className}
  `;

  return (
    <Component
      ref={cardRef}
      className={classes}
      onClick={onClick}
      style={{ opacity: animate ? 0 : 1 }}
    >
      {children}
    </Component>
  );
};

export default Card;
