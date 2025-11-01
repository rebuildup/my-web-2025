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
		top: "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-main",
		bottom:
			"bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-main",
		left: "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-main",
		right:
			"right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-main",
	};

	// Clone child with accessibility props
	const childWithProps = React.cloneElement(
		children as React.ReactElement<Record<string, unknown>>,
		{
			ref: triggerRef,
			"aria-describedby": tooltipId,
			onMouseEnter: showTooltip,
			onMouseLeave: hideTooltip,
			onFocus: showTooltip,
			onBlur: hideTooltip,
			onKeyDown: handleKeyDown,
			...(children.props || {}),
		},
	);

	return (
		<div className="tooltip relative inline-block">
			{childWithProps}

			{isVisible && (
				<div
					className={`tooltip-content absolute z-50 px-2 py-1 text-sm bg-base text-main border border-main rounded shadow-lg ${positionClasses[position]} ${className}`}
				>
					<div id={tooltipId} role="tooltip">
						{content}
					</div>
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
	showTooltip?: boolean;
	size?: "sm" | "md" | "lg";
	variant?: "primary" | "secondary" | "ghost" | "danger";
}

export const AccessibleIconButton: React.FC<AccessibleIconButtonProps> = ({
	icon,
	label,
	tooltip,
	showTooltip,
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
			"bg-accent text-main border border-accent hover:bg-base hover:text-accent",
		secondary: "bg-base text-main border border-main hover:bg-base",
		ghost: "bg-transparent text-main hover:bg-base",
		danger: "text-red-600 hover:bg-red-50",
	};

	const button = (
		<button
			type="button"
			className={`inline-flex items-center justify-center rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${props.disabled ? "opacity-50" : ""} ${className}`}
			aria-label={label}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					// Create a synthetic mouse event for keyboard activation
					const target = e.currentTarget;
					const rect = target.getBoundingClientRect();
					const syntheticEvent = new MouseEvent("click", {
						bubbles: true,
						cancelable: true,
						clientX: rect.left + rect.width / 2,
						clientY: rect.top + rect.height / 2,
					});
					target.dispatchEvent(syntheticEvent);
				}
			}}
			{...props}
		>
			<span aria-hidden="true">{icon}</span>
		</button>
	);

	if (tooltip || showTooltip) {
		return (
			<AccessibleTooltip content={tooltip || label}>{button}</AccessibleTooltip>
		);
	}

	return button;
};
