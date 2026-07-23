"use client";

import { ToggleLeft, ToggleRight } from "lucide-react";

interface DatePickerToggleProps {
	useManualDate: boolean;
	onToggle: () => void;
}

export function DatePickerToggle({
	useManualDate,
	onToggle,
}: DatePickerToggleProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={`flex items-center gap-2 px-3 py-1 text-sm font-medium ${useManualDate ? " " : " border "}`}
			aria-label={`Switch to ${useManualDate ? "automatic" : "manual"} date mode`}
		>
			{useManualDate ? (
				<ToggleRight className="w-4 h-4" />
			) : (
				<ToggleLeft className="w-4 h-4" />
			)}
			{useManualDate ? "Manual" : "Auto"}
		</button>
	);
}
