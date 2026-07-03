/**
 * Accessibility-enhanced button component for tools
 * Ensures WCAG 2.1 AA compliance and enhanced usability
 */

"use client";

import {
	type ButtonHTMLAttributes,
	forwardRef,
	useEffect,
	useRef,
} from "react";
import { useAccessibility } from "@/hooks/useAccessibility";

interface AccessibleButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	loadingText?: string;
	announceOnClick?: string;
	ensureMinimumSize?: boolean;
	"data-testid"?: string;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
	(
		{
			children,
			variant = "primary",
			size = "md",
			loading = false,
			loadingText = "読み込み中...",
			announceOnClick,
			ensureMinimumSize = true,
			className = "",
			onClick,
			disabled,
			...props
		},
		ref,
	) => {
		const buttonRef = useRef<HTMLButtonElement>(null);
		const { announce, ensureMinimumTouchTarget, state } = useAccessibility();

		// Ensure minimum touch target size
		useEffect(() => {
			if (ensureMinimumSize && buttonRef.current) {
				ensureMinimumTouchTarget(buttonRef.current);
			}
		}, [ensureMinimumSize, ensureMinimumTouchTarget]);

		// Handle click with accessibility announcements
		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			if (loading || disabled) return;

			if (announceOnClick) {
				announce(announceOnClick);
			}

			onClick?.(event);
		};

		// Base styles with accessibility considerations
		const baseStyles = `
 inline-flex items-center justify-center
 font-medium transition-colors duration-200
  
  disabled:cursor-not-allowed
 ${state.prefersReducedMotion ? "" : "transition-all duration-200"}
 `;

		// Variant styles
		const variantStyles = {
			primary: `
 bg-accent  border-accent
 hover: hover:text-accent
 focus:ring-accent focus:border-accent
 `,
			secondary: `
  
 hover:
 focus: focus:
 `,
			danger: `
    
 
  
 `,
			ghost: `
   
 hover: hover:
 focus: focus:
 `,
		};

		// Size styles
		const sizeStyles = {
			sm: "px-3 py-1.5 text-sm min-h-[32px]",
			md: "px-4 py-2 min-h-[40px]",
			lg: "px-6 py-3 text-lg min-h-[48px]",
		};

		// Combine all styles
		const combinedClassName = `
 ${baseStyles}
 ${variantStyles[variant]}
 ${sizeStyles[size]}
 ${className}
 `
			.trim()
			.replace(/\s+/g, " ");

		// Create accessible label
		const accessibleLabel =
			props["aria-label"] ||
			(typeof children === "string" ? children : undefined);

		return (
			<button
				type="button"
				ref={ref || buttonRef}
				className={combinedClassName}
				onClick={handleClick}
				disabled={disabled || loading}
				aria-label={loading ? loadingText : accessibleLabel}
				aria-busy={loading}
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
								className=""
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
							/>
							<path
								className=""
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
						<span>{loadingText}</span>
					</span>
				) : (
					<span className="flex items-center space-x-2">
						<span>{children}</span>
					</span>
				)}
			</button>
		);
	},
);

AccessibleButton.displayName = "AccessibleButton";

export default AccessibleButton;
