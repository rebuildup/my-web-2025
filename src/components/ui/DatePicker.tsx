"use client";

import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function deriveInitialState(
	value: string | undefined,
	useManualDate: boolean,
): DatePickerState {
	if (value) {
		const date = new Date(value);
		if (!Number.isNaN(date.getTime())) {
			return {
				inputValue: formatDateForInput(date),
				isCalendarOpen: false,
				validationError: null,
				selectedDate: date,
			};
		}
	}
	if (useManualDate) {
		return {
			inputValue: "",
			isCalendarOpen: false,
			validationError: null,
			selectedDate: null,
		};
	}
	const now = new Date();
	return {
		inputValue: formatDateForInput(now),
		isCalendarOpen: false,
		validationError: null,
		selectedDate: now,
	};
}

function deriveStateOnPropChange(
	value: string | undefined,
	useManualDate: boolean,
	prevValue: string | undefined,
	prevUseManualDate: boolean,
): DatePickerState | null {
	const valueChanged = value !== prevValue;
	const useManualChanged = useManualDate !== prevUseManualDate;
	if (!valueChanged && !useManualChanged) return null;
	return deriveInitialState(value, useManualDate);
}

export function DatePicker({
	value,
	onChange,
	useManualDate,
	onToggleManualDate,
	placeholder = "Select date...",
}: DatePickerProps) {
	const [state, setState] = useState<DatePickerState>(() =>
		deriveInitialState(value, useManualDate),
	);

	const inputRef = useRef<HTMLInputElement>(null);
	const calendarRef = useRef<HTMLDivElement>(null);

	const prevValueRef = useRef<string | undefined>(value);
	const prevUseManualDateRef = useRef<boolean>(useManualDate);

	const nextState = useMemo(
		() =>
			deriveStateOnPropChange(
				value,
				useManualDate,
				prevValueRef.current,
				prevUseManualDateRef.current,
			),
		[value, useManualDate],
	);
	if (nextState) {
		prevValueRef.current = value;
		prevUseManualDateRef.current = useManualDate;
		if (
			nextState.inputValue !== state.inputValue ||
			nextState.selectedDate !== state.selectedDate ||
			nextState.validationError !== state.validationError
		) {
			setState(nextState);
		}
	}

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
			<div className="flex items-center justify-between">
				<label
					htmlFor="date-setting-toggle"
					className="noto-sans-jp-regular text-sm font-medium "
				>
					Date Setting
				</label>
				<DatePickerToggle
					id="date-setting-toggle"
					useManualDate={useManualDate}
					onToggle={handleToggleManualDate}
				/>
			</div>

			<div className="relative">
				<DatePickerInput
					inputRef={inputRef as any}
					inputValue={state.inputValue}
					useManualDate={useManualDate}
					placeholder={placeholder}
					validationError={state.validationError}
					selectedDate={state.selectedDate}
					onInputChange={handleInputChange}
					onInputBlur={handleInputBlur}
					onCalendarToggle={handleCalendarToggle}
				/>

				{state.isCalendarOpen && useManualDate && (
					<DatePickerCalendar
						calendarRef={calendarRef as any}
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
