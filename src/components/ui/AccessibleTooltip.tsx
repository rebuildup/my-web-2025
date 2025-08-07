"use client";

import React, { useId, useRef, useState } from "react";

interface AccessibleTooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export const AccessibleTooltip: React.FC<AccessibleTooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 500,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const tooltipId = useId();
  const triggerRef = useRef<HTMLElement>(null);

  const showTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      hideTooltip();
    }
  };

  // Position classes
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  // Arrow classes
  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-foreground",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-foreground",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-foreground",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-foreground",
  };

  // Clone child with accessibility props
  const childWithProps = React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      ref: triggerRef,
      "aria-describedby": isVisible ? tooltipId : undefined,
      onMouseEnter: showTooltip,
      onMouseLeave: hideTooltip,
      onFocus: showTooltip,
      onBlur: hideTooltip,
      onKeyDown: handleKeyDown,
      ...(children.props || {}),
    },
  );

  return (
    <div className={`tooltip relative inline-block ${className}`}>
      {childWithProps}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`tooltip-content absolute z-50 px-2 py-1 text-sm bg-base text-foreground border border-foreground rounded shadow-lg ${positionClasses[position]}`}
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

interface AccessibleIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
}

export const AccessibleIconButton: React.FC<AccessibleIconButtonProps> = ({
  icon,
  label,
  tooltip,
  size = "md",
  variant = "ghost",
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 p-1",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-3",
  };

  const variantClasses = {
    primary:
      "bg-accent text-background border border-accent hover:bg-background hover:text-accent",
    secondary:
      "bg-background text-foreground border border-foreground hover:bg-base",
    ghost: "bg-transparent text-foreground hover:bg-base",
  };

  const button = (
    <button
      className={`inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      aria-label={label}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );

  if (tooltip) {
    return <AccessibleTooltip content={tooltip}>{button}</AccessibleTooltip>;
  }

  return button;
};
