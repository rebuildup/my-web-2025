/**
 * Accessibility-enhanced input component for tools
 * Ensures WCAG 2.1 AA compliance and enhanced usability
 */

"use client";

import {
	forwardRef,
	type InputHTMLAttributes,
	type TextareaHTMLAttributes,
	useId,
	useState,
} from "react";
import { useToolAccessibility } from "@/hooks/useAccessibility";

interface BaseAccessibleInputProps {
	label: string;
	description?: string;
	error?: string;
	required?: boolean;
	showRequiredIndicator?: boolean;
	helpText?: string;
	variant?: "default" | "large";
}

interface AccessibleInputProps
	extends BaseAccessibleInputProps,
		Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
	as?: "input";
}

interface AccessibleTextareaProps
	extends BaseAccessibleInputProps,
		Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
	as: "textarea";
	rows?: number;
	resize?: boolean;
}

type AccessibleInputComponentProps =
	| AccessibleInputProps
	| AccessibleTextareaProps;

const AccessibleInput = forwardRef<
	HTMLInputElement | HTMLTextAreaElement,
	AccessibleInputComponentProps
>(
	(
		{
			label,
			description,
			error,
			required = false,
			showRequiredIndicator = true,
			helpText,
			variant = "default",
			className = "",
			as = "input",
			...props
		},
		ref,
	) => {
		const { announce, state } = useToolAccessibility();
		const [isFocused, setIsFocused] = useState(false);

		const inputId = useId();
		const descriptionId = useId();
		const errorId = useId();
		const helpTextId = useId();

		// Handle focus events with announcements
		const handleFocus = (
			event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
		) => {
			setIsFocused(true);
			if (description) {
				announce(description, "polite");
			}
			if (as === "input") {
				(props as AccessibleInputProps).onFocus?.(
					event as React.FocusEvent<HTMLInputElement>,
				);
			} else {
				(props as AccessibleTextareaProps).onFocus?.(
					event as React.FocusEvent<HTMLTextAreaElement>,
				);
			}
		};

		const handleBlur = (
			event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
		) => {
			setIsFocused(false);
			if (as === "input") {
				(props as AccessibleInputProps).onBlur?.(
					event as React.FocusEvent<HTMLInputElement>,
				);
			} else {
				(props as AccessibleTextareaProps).onBlur?.(
					event as React.FocusEvent<HTMLTextAreaElement>,
				);
			}
		};

		// Base styles with accessibility considerations
		const baseInputStyles = `
      w-full bg-base border text-main
      focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base
      disabled:opacity-50 disabled:cursor-not-allowed
      ${state.prefersReducedMotion ? "" : "transition-all duration-200"}
      ${error ? "border-red-500" : "border-main"}
      ${isFocused ? "ring-2 ring-accent ring-offset-2 ring-offset-base" : ""}
    `;

		// Variant styles
		const variantStyles = {
			default: "p-2 text-base",
			large: "p-3 text-lg",
		};

		// Combine styles
		const inputClassName = `
      ${baseInputStyles}
      ${variantStyles[variant]}
      ${className}
    `
			.trim()
			.replace(/\s+/g, " ");

		// Create aria-describedby
		const ariaDescribedBy =
			[description && descriptionId, error && errorId, helpText && helpTextId]
				.filter(Boolean)
				.join(" ") || undefined;

		// Common props for both input and textarea
		const commonProps = {
			id: inputId,
			className: inputClassName,
			"aria-describedby": ariaDescribedBy,
			"aria-invalid": !!error,
			"aria-required": required,
			onFocus: handleFocus,
			onBlur: handleBlur,
			...props,
		};

		return (
			<div className="space-y-2">
				{/* Label */}
				<label
					htmlFor={inputId}
					className="neue-haas-grotesk-display text-sm text-main block"
				>
					{label}
					{required && showRequiredIndicator && (
						<span className="text-red-500 ml-1" aria-hidden="true">
							*
						</span>
					)}
				</label>

				{/* Description */}
				{description && (
					<p
						id={descriptionId}
						className="noto-sans-jp-light text-sm text-main"
					>
						{description}
					</p>
				)}

				{/* Input/Textarea */}
				{as === "textarea" ? (
					<textarea
						ref={ref as React.Ref<HTMLTextAreaElement>}
						rows={(props as AccessibleTextareaProps).rows || 4}
						style={{
							resize:
								(props as AccessibleTextareaProps).resize !== false
									? "vertical"
									: "none",
						}}
						{...(commonProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
					/>
				) : (
					<input
						ref={ref as React.Ref<HTMLInputElement>}
						{...(commonProps as InputHTMLAttributes<HTMLInputElement>)}
					/>
				)}

				{/* Error message */}
				{error && (
					<p
						id={errorId}
						className="text-red-500 text-sm"
						role="alert"
						aria-live="polite"
					>
						{error}
					</p>
				)}

				{/* Help text */}
				{helpText && (
					<p
						id={helpTextId}
						className="noto-sans-jp-light text-xs text-main opacity-75"
					>
						{helpText}
					</p>
				)}
			</div>
		);
	},
);

AccessibleInput.displayName = "AccessibleInput";

export default AccessibleInput;
