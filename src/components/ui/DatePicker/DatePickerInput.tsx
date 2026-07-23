"use client";

import { Calendar, Clock } from "lucide-react";
import type React from "react";
import type { RefObject } from "react";
import { formatDateForDisplay } from "./date-utils";

interface DatePickerInputProps {
	inputValue: string;
	useManualDate: boolean;
	placeholder: string;
	validationError: string | null;
	selectedDate: Date | null;
	inputRef: RefObject<HTMLInputElement>;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onInputBlur: () => void;
	onCalendarToggle: () => void;
}

export function DatePickerInput({
	inputValue,
	useManualDate,
	placeholder,
	validationError,
	selectedDate,
	inputRef,
	onInputChange,
	onInputBlur,
	onCalendarToggle,
}: DatePickerInputProps) {
	return (
		<>
			<div className="relative">
				<Clock className="absolute left-3 top-1/2 transform -translate-y-1/2  w-4 h-4" />
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={onInputChange}
					onBlur={onInputBlur}
					placeholder={useManualDate ? placeholder : "Auto (current date)"}
					disabled={!useManualDate}
					className={`w-full pl-10 pr-12 py-2 border ${validationError ? " " : ""} ${!useManualDate ? "" : ""}`}
				/>
				{useManualDate && (
					<button
						type="button"
						onClick={onCalendarToggle}
						className="absolute right-3 top-1/2 transform -translate-y-1/2"
						aria-label="Open calendar"
					>
						<Calendar className="w-4 h-4" />
					</button>
				)}
			</div>

			{/* Validation Error */}
			{validationError && <p className="mt-1 text-sm ">{validationError}</p>}

			{/* Date Display */}
			{selectedDate && !validationError && (
				<p className="mt-1 text-sm ">{formatDateForDisplay(selectedDate)}</p>
			)}
		</>
	);
}
