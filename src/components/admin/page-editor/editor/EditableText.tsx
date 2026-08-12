"use client";

import {
	type CSSProperties,
	forwardRef,
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useRef,
} from "react";
import { adminColor } from "@/components/admin/ui/tokens";

export interface EditableTextProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	sx?: CSSProperties;
	autoFocus?: boolean;
	readOnly?: boolean;
	onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
}

const baseStyle: CSSProperties = {
	minHeight: "1.8em",
	padding: "8px 12px",
	borderRadius: 4,
	border: "1px solid transparent",
	backgroundColor: "rgba(255,255,255,0.04)",
	transition: "border-color 0.2s ease, background 0.2s ease",
	outline: "none",
	fontSize: 16,
	lineHeight: 1.7,
	color: adminColor.textPrimary,
};

const readonlyStyle: CSSProperties = {
	opacity: 1,
	pointerEvents: "none",
	backgroundColor: "transparent",
	border: "none",
	padding: 0,
	color: adminColor.textPrimary,
};

const placeholderStyle = `
[data-placeholder]:empty::before {
  content: attr(data-placeholder);
  color: ${adminColor.textDisabled};
}
[data-placeholder]:empty:focus::before {
  opacity: 0.5;
}
`;

export const EditableText = forwardRef<HTMLDivElement, EditableTextProps>(
	function EditableText(
		{
			value,
			onChange,
			placeholder,
			sx,
			autoFocus = false,
			readOnly = false,
			onKeyDown,
		},
		forwardedRef,
	) {
		const internalRef = useRef<HTMLDivElement | null>(null);

		useEffect(() => {
			const element =
				(forwardedRef as React.RefObject<HTMLDivElement>)?.current ??
				internalRef.current;
			if (!element) return;

			const isFocused = document.activeElement === element;
			// 入力中（フォーカス中）は DOM を上書きしない（キャレットジャンプ防止）
			if (!isFocused && element.textContent !== value) {
				element.textContent = value;
			}

			if (autoFocus && !isFocused) {
				element.focus();
			}
		}, [value, forwardedRef, autoFocus]);

		const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
			if (readOnly) {
				return;
			}
			const text = event.currentTarget.textContent ?? "";
			onChange(text);
		};

		const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
			if (readOnly) {
				return;
			}
			if (onKeyDown) {
				onKeyDown(event);
			}
		};

		const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
			if (readOnly) return;
			event.currentTarget.style.borderColor = "rgba(44, 123, 229, 0.5)";
			event.currentTarget.style.backgroundColor = "rgba(44, 123, 229, 0.12)";
		};

		const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
			event.currentTarget.style.borderColor = "transparent";
			event.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)";
		};

		const mergedStyle: CSSProperties = readOnly
			? { ...baseStyle, ...readonlyStyle, ...sx }
			: { ...baseStyle, ...sx };

		return (
			<>
				<style>{placeholderStyle}</style>
				<div
					ref={forwardedRef ?? internalRef}
					role="textbox"
					contentEditable={!readOnly}
					suppressContentEditableWarning
					tabIndex={readOnly ? -1 : 0}
					aria-multiline="true"
					data-placeholder={placeholder}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
					onFocus={handleFocus}
					onBlur={handleBlur}
					style={mergedStyle}
					className={readOnly ? "is-readonly" : undefined}
				/>
			</>
		);
	},
);
