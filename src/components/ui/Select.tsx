"use client";

import React from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "admin";
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  size = "md",
  variant = "default",
}: SelectProps) {
  const baseStyles =
    "border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-md cursor-pointer appearance-none bg-no-repeat bg-right transition-colors";

  const sizeStyles = {
    sm: "px-2 py-1 text-xs pr-6 bg-[length:10px]",
    md: "px-3 py-2 text-sm pr-8 bg-[length:12px]",
    lg: "px-4 py-3 text-base pr-10 bg-[length:14px]",
  };

  const variantStyles = {
    default:
      'bg-background border-foreground text-foreground hover:border-accent bg-[url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>\')]',
    admin:
      'bg-background border-foreground text-foreground hover:border-accent bg-[url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>\')]',
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  const selectClassName = `
    w-full
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabled ? disabledStyles : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={selectClassName}
    >
      {placeholder && (
        <option value="" disabled className="text-foreground/60">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className="text-foreground bg-background"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Option component for better type safety
export interface OptionProps {
  value: string;
  label: string;
  disabled?: boolean;
}

export function Option({ value, label, disabled = false }: OptionProps) {
  return (
    <option
      value={value}
      disabled={disabled}
      className="text-foreground bg-background"
    >
      {label}
    </option>
  );
}
