import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  external?: boolean;
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
}) => {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  useEffect(() => {
    if (buttonRef.current && !disabled) {
      buttonRef.current.addEventListener("mouseenter", handleMouseEnter);
      buttonRef.current.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (buttonRef.current && !disabled) {
        buttonRef.current.removeEventListener("mouseenter", handleMouseEnter);
        buttonRef.current.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [disabled]);

  const handleMouseEnter = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.2,
      ease: "power1.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.2,
      ease: "power1.out",
    });
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-primary-500 hover:bg-primary-600 text-white";
      case "secondary":
        return "bg-gray-800 hover:bg-gray-900 text-white";
      case "outline":
        return "bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50";
      default:
        return "bg-primary-500 hover:bg-primary-600 text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm px-3 py-1";
      case "md":
        return "text-base px-4 py-2";
      case "lg":
        return "text-lg px-6 py-3";
      default:
        return "text-base px-4 py-2";
    }
  };

  const baseClasses = `
    font-medium rounded-md transition-colors duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${className}
  `;

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
      >
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
          children
        )}
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
    >
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
        children
      )}
    </button>
  );
};

export default Button;
