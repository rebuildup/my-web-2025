"use client";

import type { RefObject } from "react";
import { Button } from "../button";
import {
	WEEK_DAY_LABELS,
	generateCalendarDays,
	isCurrentMonth,
	isSelected,
	isToday,
} from "./date-utils";

interface DatePickerCalendarProps {
	calendarRef: RefObject<HTMLDivElement>;
	selectedDate: Date | null;
	onDateSelect: (date: Date) => void;
	onNavigateMonth: (direction: "prev" | "next") => void;
	onClose: () => void;
}

export function DatePickerCalendar({
	calendarRef,
	selectedDate,
	onDateSelect,
	onNavigateMonth,
	onClose,
}: DatePickerCalendarProps) {
	const currentDate = selectedDate || new Date();
	const calendarYear = currentDate.getFullYear();
	const calendarMonth = currentDate.getMonth();
	const calendarDays = generateCalendarDays(calendarYear, calendarMonth);

	return (
		<div
			ref={calendarRef}
			className="absolute z-[9999] mt-1 border rounded-lg  p-4 w-80"
			style={{ backgroundColor: "#181818", zIndex: 9999 }}
		>
			{/* Calendar Header */}
			<div className="flex items-center justify-between mb-4">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onNavigateMonth("prev")}
				>
					←
				</Button>
				<h3 className="text-lg font-semibold ">
					{currentDate.toLocaleDateString("ja-JP", {
						year: "numeric",
						month: "long",
					})}
				</h3>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onNavigateMonth("next")}
				>
					→
				</Button>
			</div>

			{/* Calendar Grid */}
			<div className="grid grid-cols-7 gap-1 mb-2">
				{WEEK_DAY_LABELS.map((day) => (
					<div key={day} className="text-center text-sm font-medium  py-2">
						{day}
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 gap-1">
				{calendarDays.map((date) => {
					const dayKey = date.toISOString();
					return (
						<button
							key={dayKey}
							type="button"
							onClick={() => onDateSelect(date)}
							className={`p-2 text-sm ${isSelected(date, selectedDate) ? " " : isToday(date) ? " font-medium" : isCurrentMonth(date, calendarMonth) ? " " : " "}`}
						>
							{date.getDate()}
						</button>
					);
				})}
			</div>

			{/* Quick Actions */}
			<div className="flex gap-2 mt-4 pt-4  ">
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => onDateSelect(new Date())}
					className="flex-1"
				>
					Today
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={onClose}
					className="flex-1"
				>
					Cancel
				</Button>
			</div>
		</div>
	);
}
