/**
 * Accessibility-enhanced select component for tools
 * Ensures WCAG 2.1 AA compliance and enhanced usability
 */

"use client";

import { forwardRef, type SelectHTMLAttributes, useId, useState } from "react";
import { useToolAccessibility } from "@/hooks/useAccessibility";

interface AccessibleSelectProps
	extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
	label: string;
	description?: string;
	error?: string;
	required?: boolean;
	showRequiredIndicator?: boolean;
	helpText?: string;
	variant?: "default" | "large";
	options: Array<{
		value: string;
		label: string;
		disabled?: boolean;
	}>;
	placeholder?: string;
}

const AccessibleSelect = forwardRef<HTMLSelectElement, AccessibleSelectProps>(
	(
		{
			label,
			description,
			error,
			required = false,
			showRequiredIndicator = true,
			helpText,
			variant = "default",
			options,
			placeholder,
			className = "",
			onChange,
			onFocus,
			onBlur,
			...props
		},
		ref,
	) => {
		const { announce, state } = useToolAccessibility();
		const [isFocused, setIsFocused] = useState(false);

		const selectId = useId();
		const descriptionId = useId();
		const errorId = useId();
		const helpTextId = useId();

		// Handle focus events with announcements
		const handleFocus = (event: React.FocusEvent<HTMLSelectElement>) => {
			setIsFocused(true);
			if (description) {
				announce(description, "polite");
			}
			onFocus?.(event);
		};

		const handleBlur = (event: React.FocusEvent<HTMLSelectElement>) => {
			setIsFocused(false);
			onBlur?.(event);
		};

		const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
			const selectedOption = options.find(
				(option) => option.value === event.target.value,
			);
			if (selectedOption) {
				announce(`${selectedOption.label}を選択しました`, "polite");
			}
			onChange?.(event);
		};

		// Base styles with accessibility considerations
		const baseSelectStyles = `
      w-full bg-base border text-main
      focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-base
      disabled:opacity-50 disabled:cursor-not-allowed
      appearance-none cursor-pointer
      ${state.prefersReducedMotion ? "" : "transition-all duration-200"}
      ${error ? "border-red-500" : "border-main/20"}
      ${isFocused ? "ring-2 ring-accent ring-offset-2 ring-offset-base" : ""}
    `;

		// Variant styles
		const variantStyles = {
			default: "p-2 text-base pr-8",
			large: "p-3 text-lg pr-10",
		};

		// Combine styles
		const selectClassName = `
      ${baseSelectStyles}
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

		return (
			<div className="space-y-2">
				{/* Label */}
				<label
					htmlFor={selectId}
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

				{/* Select wrapper with custom arrow */}
				<div className="relative">
					<select
						ref={ref}
						id={selectId}
						className={selectClassName}
						aria-describedby={ariaDescribedBy}
						aria-invalid={!!error}
						aria-required={required}
						onFocus={handleFocus}
						onBlur={handleBlur}
						onChange={handleChange}
						{...props}
					>
						{placeholder && (
							<option value="" disabled>
								{placeholder}
							</option>
						)}
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

					{/* Custom dropdown arrow */}
					<div
						className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
						aria-hidden="true"
					>
						<svg
							className="w-4 h-4 text-main"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<title>Open</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>

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

AccessibleSelect.displayName = "AccessibleSelect";

export default AccessibleSelect;
