"use client";

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
	"aria-label": string;
}

const BASE_STYLES =
	"   focus: focus:ring-offset-2 focus:ring-offset-base  cursor-pointer appearance-none bg-no-repeat bg-right transition-colors";

const SIZE_STYLES = {
	sm: "px-2 py-1 text-xs pr-6 bg-[length:10px]",
	md: "px-3 py-2 text-sm pr-8 bg-[length:12px]",
	lg: "px-4 py-3 pr-10 bg-[length:14px]",
};

const VARIANT_STYLES = {
	default:
		'  bg-[url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23666" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>\')]',
	admin:
		' hover: bg-[url(\'data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"><path fill="%23ffffff" d="M2 0L0 2h4zm0 5L0 3h4z"/></svg>\')]',
};

const DISABLED_STYLES = " cursor-not-allowed";

export function Select({
	value,
	onChange,
	options,
	placeholder = "Select an option",
	disabled = false,
	className = "",
	size = "md",
	variant = "default",
	"aria-label": ariaLabel,
}: SelectProps) {
	const selectClassName = `
	 w-full
	 ${BASE_STYLES}
	 ${SIZE_STYLES[size]}
	 ${VARIANT_STYLES[variant]}
	 ${disabled ? DISABLED_STYLES : ""}
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
			aria-label={ariaLabel}
		>
			{placeholder && (
				<option value="" disabled className="/60">
					{placeholder}
				</option>
			)}
			{options.map((option) => (
				<option
					key={option.value}
					value={option.value}
					disabled={option.disabled}
					className=" "
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

function _Option({ value, label, disabled = false }: OptionProps) {
	return (
		<option value={value} disabled={disabled} className=" ">
			{label}
		</option>
	);
}
