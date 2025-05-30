import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const ToolCard: React.FC<ToolCardProps> = ({
  title,
  description,
  icon,
  href,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        duration: 0.3,
        ease: "power2.out",
      });

      // Animate icon
      const iconElement = card.querySelector(".tool-icon");
      if (iconElement) {
        gsap.to(iconElement, {
          scale: 1.1,
          color: "#0075ff", // primary-500
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset icon animation
      const iconElement = card.querySelector(".tool-icon");
      if (iconElement) {
        gsap.to(iconElement, {
          scale: 1,
          color: "#4b5563", // gray-600
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <Link href={href} className="block no-underline">
      <div
        ref={cardRef}
        className="bg-white rounded-lg shadow-md p-6 h-full transition-shadow duration-300 flex flex-col"
      >
        <div className="tool-icon text-gray-600 mb-4 text-center">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
          {title}
        </h3>
        <p className="text-gray-600 text-center flex-grow">{description}</p>
        <div className="mt-4 text-primary-500 font-medium text-center">
          Launch Tool
        </div>
      </div>
    </Link>
  );
};

export default ToolCard;
