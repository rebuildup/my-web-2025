"use client";

import { type ChangeEvent, useId } from "react";

export interface SimpleSelectOption {
	value: string;
	label: string;
	disabled?: boolean;
}

export interface SimpleSelectProps {
	id?: string;
	value: string | undefined;
	options: SimpleSelectOption[];
	onChange: (value: string) => void;
	label?: string;
	placeholder?: string;
	disabled?: boolean;
	fullWidth?: boolean;
	minWidth?: number;
	size?: "small" | "medium";
	"aria-label"?: string;
	"data-testid"?: string;
}

const SIZE_PADDING = {
	small: { padding: "6px 28px 6px 10px", fontSize: 13, radius: 6 },
	medium: { padding: "8px 32px 8px 12px", fontSize: 14, radius: 8 },
} as const;

const baseStyle: React.CSSProperties = {
	appearance: "none",
	WebkitAppearance: "none",
	MozAppearance: "none",
	background: "#ffffff",
	color: "#111827",
	border: "1px solid #d1d5db",
	outline: "none",
	cursor: "pointer",
	transition: "border-color 120ms ease, box-shadow 120ms ease",
	backgroundImage:
		"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'><path fill='%236b7280' d='M6 8.5 1.5 4h9z'/></svg>\")",
	backgroundRepeat: "no-repeat",
	backgroundPosition: "right 10px center",
	backgroundSize: "12px 12px",
};

const disabledStyle: React.CSSProperties = {
	backgroundColor: "#f3f4f6",
	color: "#9ca3af",
	cursor: "not-allowed",
};

export function SimpleSelect({
	id,
	value,
	options,
	onChange,
	label,
	placeholder,
	disabled = false,
	fullWidth = false,
	minWidth,
	size = "medium",
	"aria-label": ariaLabel,
	"data-testid": dataTestId,
}: SimpleSelectProps) {
	const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
		onChange(event.target.value);
	};

	const sizing = SIZE_PADDING[size];
	const widthStyle: React.CSSProperties = fullWidth
		? { width: "100%" }
		: minWidth !== undefined
			? { width: "auto", minWidth }
			: {};

	const generatedId = useId();
	const selectId = id ?? `simple-select-${generatedId}`;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 4,
				width: fullWidth ? "100%" : undefined,
			}}
		>
			{label && (
				<label
					htmlFor={selectId}
					style={{
						fontSize: 12,
						fontWeight: 600,
						color: "#374151",
					}}
				>
					{label}
				</label>
			)}
			<select
				id={selectId}
				value={value}
				onChange={handleChange}
				disabled={disabled}
				aria-label={ariaLabel ?? label}
				data-testid={dataTestId}
				style={{
					...baseStyle,
					...sizing,
					...widthStyle,
					...(disabled ? disabledStyle : {}),
					borderRadius: SIZE_PADDING[size].radius,
				}}
			>
				{placeholder !== undefined && (
					<option value="" disabled={!value}>
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
		</div>
	);
}
