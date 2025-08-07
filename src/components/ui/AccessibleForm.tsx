"use client";

import React, { forwardRef, useId } from "react";
import { useAccessibilityContext } from "./AccessibilityProvider";

interface AccessibleFormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  children,
  className = "",
}) => {
  const fieldId = useId();
  const errorId = useId();
  const hintId = useId();
  const { announceToScreenReader } = useAccessibilityContext();

  // Clone the child element with accessibility props
  const childWithProps = React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      id: fieldId,
      "aria-describedby":
        [hint ? hintId : null, error ? errorId : null]
          .filter(Boolean)
          .join(" ") || undefined,
      "aria-invalid": error ? "true" : "false",
      "aria-required": required ? "true" : "false",
      onInvalid: (e: React.FormEvent) => {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        const message = target.validationMessage || "入力内容に問題があります";
        announceToScreenReader(`${label}: ${message}`, "assertive");
      },
      ...(children.props || {}),
    },
  );

  return (
    <div className={`form-field ${className}`}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground mb-2"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="必須項目">
            *
          </span>
        )}
      </label>

      {hint && (
        <div id={hintId} className="text-sm text-gray-600 mb-2">
          {hint}
        </div>
      )}

      {childWithProps}

      {error && (
        <div
          id={errorId}
          className="error-message"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </div>
  );
};

interface AccessibleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const AccessibleInput = forwardRef<
  HTMLInputElement,
  AccessibleInputProps
>(({ label, error, hint, required, className = "", ...props }, ref) => {
  if (label) {
    return (
      <AccessibleFormField
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <input
          ref={ref}
          className={`w-full px-3 py-2 border-2 border-foreground bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${className}`}
          {...props}
        />
      </AccessibleFormField>
    );
  }

  return (
    <input
      ref={ref}
      className={`w-full px-3 py-2 border-2 border-foreground bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${className}`}
      {...props}
    />
  );
});

AccessibleInput.displayName = "AccessibleInput";

interface AccessibleTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const AccessibleTextarea = forwardRef<
  HTMLTextAreaElement,
  AccessibleTextareaProps
>(({ label, error, hint, required, className = "", ...props }, ref) => {
  if (label) {
    return (
      <AccessibleFormField
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 border-2 border-foreground bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-vertical ${className}`}
          {...props}
        />
      </AccessibleFormField>
    );
  }

  return (
    <textarea
      ref={ref}
      className={`w-full px-3 py-2 border-2 border-foreground bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent resize-vertical ${className}`}
      {...props}
    />
  );
});

AccessibleTextarea.displayName = "AccessibleTextarea";

interface AccessibleSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const AccessibleSelect = forwardRef<
  HTMLSelectElement,
  AccessibleSelectProps
>(
  (
    { label, error, hint, required, options, className = "", ...props },
    ref,
  ) => {
    const selectElement = (
      <select
        ref={ref}
        className={`w-full px-3 py-2 border-2 border-foreground bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    );

    if (label) {
      return (
        <AccessibleFormField
          label={label}
          error={error}
          hint={hint}
          required={required}
        >
          {selectElement}
        </AccessibleFormField>
      );
    }

    return selectElement;
  },
);

AccessibleSelect.displayName = "AccessibleSelect";

interface AccessibleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const AccessibleButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      loadingText = "読み込み中...",
      icon,
      iconPosition = "left",
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const { announceToScreenReader } = useAccessibilityContext();

    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-accent text-background border border-accent hover:bg-background hover:text-accent focus:ring-accent",
      secondary:
        "bg-background text-foreground border border-foreground hover:bg-base focus:ring-foreground",
      danger:
        "bg-red-600 text-white border border-red-600 hover:bg-red-700 focus:ring-red-500",
      ghost:
        "bg-transparent text-foreground border border-transparent hover:bg-base hover:border-foreground focus:ring-foreground",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm min-h-[32px]",
      md: "px-4 py-2 text-base min-h-[44px]",
      lg: "px-6 py-3 text-lg min-h-[48px]",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      // Announce button action to screen readers
      if (typeof children === "string") {
        announceToScreenReader(`${children}ボタンが押されました`);
      }

      props.onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <span className="flex items-center space-x-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{loadingText}</span>
          </span>
        ) : (
          <span className="flex items-center space-x-2">
            {icon && iconPosition === "left" && (
              <span aria-hidden="true">{icon}</span>
            )}
            <span>{children}</span>
            {icon && iconPosition === "right" && (
              <span aria-hidden="true">{icon}</span>
            )}
          </span>
        )}
      </button>
    );
  },
);

AccessibleButton.displayName = "AccessibleButton";
