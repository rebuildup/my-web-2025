// src/components/ui/Button.tsx
import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  external?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  ariaLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  isLoading = false,
  external = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  rounded = "md",
  ariaLabel,
}) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    if (buttonRef.current && !disabled) {
      const button = buttonRef.current;

      // Create hover timeline
      const tl = gsap.timeline({ paused: true });
      tl.to(button, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out",
      });

      // Add subtle shadow increase based on variant
      if (variant === "primary" || variant === "secondary") {
        tl.to(
          button,
          {
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            duration: 0.2,
          },
          0
        );
      }

      // Add event listeners
      const handleMouseEnter = () => tl.play();
      const handleMouseLeave = () => tl.reverse();

      button.addEventListener("mouseenter", handleMouseEnter);
      button.addEventListener("mouseleave", handleMouseLeave);

      // Handle click animation
      const handleClick = () => {
        if (disabled) return;
        gsap.to(button, {
          scale: 0.95,
          duration: 0.1,
          onComplete: () => {
            gsap.to(button, {
              scale: 1,
              duration: 0.1,
            });
          },
        });
      };

      button.addEventListener("mousedown", handleClick);

      return () => {
        button.removeEventListener("mouseenter", handleMouseEnter);
        button.removeEventListener("mouseleave", handleMouseLeave);
        button.removeEventListener("mousedown", handleClick);
      };
    }
  }, [disabled, variant]);

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-500 hover:bg-primary-600 text-white shadow-sm";
      case "secondary":
        return "bg-gray-800 hover:bg-gray-900 text-white shadow-sm";
      case "outline":
        return "bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50";
      case "ghost":
        return "bg-transparent text-primary-500 hover:bg-primary-50";
      default:
        return "bg-primary-500 hover:bg-primary-600 text-white shadow-sm";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "xs":
        return "text-xs px-2.5 py-1";
      case "sm":
        return "text-sm px-3 py-1.5";
      case "md":
        return "text-base px-4 py-2";
      case "lg":
        return "text-lg px-6 py-3";
      case "xl":
        return "text-xl px-8 py-4";
      default:
        return "text-base px-4 py-2";
    }
  };

  const getRoundedClasses = () => {
    switch (rounded) {
      case "none":
        return "rounded-none";
      case "sm":
        return "rounded-sm";
      case "md":
        return "rounded-md";
      case "lg":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };

  const baseClasses = `
    font-medium transition-all duration-300 inline-flex items-center justify-center
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${getRoundedClasses()}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  const renderContent = () => (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </div>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === "right" && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      )}
    </>
  );

  if (href) {
    const linkProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <Link
        href={href}
        className={baseClasses}
        {...linkProps}
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        aria-label={ariaLabel}
      >
        {renderContent()}
      </Link>
    );
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
    >
      {renderContent()}
    </button>
  );
};

export default Button;
