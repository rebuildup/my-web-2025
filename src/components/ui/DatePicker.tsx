"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { DatePickerProps } from "@/types/enhanced-content";
import { DatePickerCalendar } from "./DatePicker/DatePickerCalendar";
import { DatePickerInput } from "./DatePicker/DatePickerInput";
import { DatePickerToggle } from "./DatePicker/DatePickerToggle";
import { formatDateForInput, validateDate } from "./DatePicker/date-utils";

interface DatePickerState {
	inputValue: string;
	isCalendarOpen: boolean;
	validationError: string | null;
	selectedDate: Date | null;
}

export function DatePicker({
	value,
	onChange,
	useManualDate,
	onToggleManualDate,
	placeholder = "Select date...",
}: DatePickerProps) {
	const [state, setState] = useState<DatePickerState>({
		inputValue: "",
		isCalendarOpen: false,
		validationError: null,
		selectedDate: null,
	});

	const inputRef = useRef<HTMLInputElement>(null);
	const calendarRef = useRef<HTMLDivElement>(null);

	// Initialize input value from props
	useEffect(() => {
		if (value) {
			const date = new Date(value);
			if (!Number.isNaN(date.getTime())) {
				setState((prev) => ({
					...prev,
					inputValue: formatDateForInput(date),
					selectedDate: date,
					validationError: null,
				}));
			}
		} else if (useManualDate) {
			setState((prev) => ({
				...prev,
				inputValue: "",
				selectedDate: null,
			}));
		} else {
			// Auto mode - use current date
			const now = new Date();
			setState((prev) => ({
				...prev,
				inputValue: formatDateForInput(now),
				selectedDate: now,
			}));
		}
	}, [value, useManualDate]);

	// Close calendar when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				calendarRef.current &&
				!calendarRef.current.contains(event.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(event.target as Node)
			) {
				setState((prev) => ({ ...prev, isCalendarOpen: false }));
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value;
			setState((prev) => ({ ...prev, inputValue }));

			if (!useManualDate) return;

			if (!inputValue.trim()) {
				setState((prev) => ({
					...prev,
					validationError: null,
					selectedDate: null,
				}));
				onChange("");
				return;
			}

			const parsedDate = validateDate(inputValue);
			if (parsedDate) {
				setState((prev) => ({
					...prev,
					validationError: null,
					selectedDate: parsedDate,
				}));
				onChange(parsedDate.toISOString());
			} else {
				setState((prev) => ({
					...prev,
					validationError: "Invalid date format. Use YYYY/MM/DD format.",
					selectedDate: null,
				}));
			}
		},
		[useManualDate, onChange],
	);

	const handleInputBlur = useCallback(() => {
		if (!useManualDate || !state.inputValue.trim()) return;

		const parsedDate = validateDate(state.inputValue);
		if (parsedDate) {
			setState((prev) => ({
				...prev,
				inputValue: formatDateForInput(parsedDate),
				validationError: null,
				selectedDate: parsedDate,
			}));
			// onChangeを呼び出して親コンポーネントに変更を通知
			onChange(parsedDate.toISOString());
		}
	}, [useManualDate, state.inputValue, onChange]);

	const handleCalendarToggle = useCallback(() => {
		if (!useManualDate) return;
		setState((prev) => ({ ...prev, isCalendarOpen: !prev.isCalendarOpen }));
	}, [useManualDate]);

	const handleDateSelect = useCallback(
		(date: Date) => {
			setState((prev) => ({
				...prev,
				inputValue: formatDateForInput(date),
				selectedDate: date,
				isCalendarOpen: false,
				validationError: null,
			}));
			onChange(date.toISOString());
		},
		[onChange],
	);

	const handleToggleManualDate = useCallback(() => {
		const newUseManualDate = !useManualDate;
		onToggleManualDate(newUseManualDate);

		if (!newUseManualDate) {
			// Switching to auto mode - use current date
			const now = new Date();
			setState((prev) => ({
				...prev,
				inputValue: formatDateForInput(now),
				selectedDate: now,
				validationError: null,
				isCalendarOpen: false,
			}));
			onChange(now.toISOString());
		}
	}, [useManualDate, onToggleManualDate, onChange]);

	const navigateMonth = useCallback((direction: "prev" | "next") => {
		setState((prev) => {
			const currentDate = prev.selectedDate || new Date();
			const newDate = new Date(currentDate);
			if (direction === "prev") {
				newDate.setMonth(newDate.getMonth() - 1);
			} else {
				newDate.setMonth(newDate.getMonth() + 1);
			}
			return { ...prev, selectedDate: newDate };
		});
	}, []);

	const closeCalendar = useCallback(() => {
		setState((prev) => ({ ...prev, isCalendarOpen: false }));
	}, []);

	return (
		<div className="space-y-3">
			{/* Manual/Auto Toggle */}
			<div className="flex items-center justify-between">
				<label className="noto-sans-jp-regular text-sm font-medium ">
					Date Setting
				</label>
				<DatePickerToggle
					useManualDate={useManualDate}
					onToggle={handleToggleManualDate}
				/>
			</div>

			{/* Date Input */}
			<div className="relative">
				<DatePickerInput
					inputRef={inputRef}
					inputValue={state.inputValue}
					useManualDate={useManualDate}
					placeholder={placeholder}
					validationError={state.validationError}
					selectedDate={state.selectedDate}
					onInputChange={handleInputChange}
					onInputBlur={handleInputBlur}
					onCalendarToggle={handleCalendarToggle}
				/>

				{/* Calendar Dropdown */}
				{state.isCalendarOpen && useManualDate && (
					<DatePickerCalendar
						calendarRef={calendarRef}
						selectedDate={state.selectedDate}
						onDateSelect={handleDateSelect}
						onNavigateMonth={navigateMonth}
						onClose={closeCalendar}
					/>
				)}
			</div>
		</div>
	);
}
