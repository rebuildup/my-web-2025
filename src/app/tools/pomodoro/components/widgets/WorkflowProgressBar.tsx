"use client";

import { useMemo } from "react";
import { hexToRgba, type ScheduleStep } from "../../utils/pomodoro-constants";

export const WorkflowProgressBar = ({
	schedule,
	currentStepIndex,
	currentStepDuration,
	currentStepProgressPercent,
	totalDuration,
	highlightColor,
	isActive,
	theme,
	hoveredStepIndex,
	onHover,
}: {
	schedule: ScheduleStep[];
	currentStepIndex: number;
	currentStepDuration: number;
	currentStepProgressPercent: number;
	totalDuration: number;
	highlightColor: string;
	isActive: boolean;
	theme: string;
	hoveredStepIndex: number | null;
	onHover: (index: number | null) => void;
}) => {
	const workflowProgressPercent = useMemo(() => {
		if (!schedule.length || totalDuration <= 0) return 0;
		const completedMinutes = schedule
			.slice(0, currentStepIndex)
			.reduce((acc, step) => acc + step.duration, 0);
		const currentStepMinutes =
			(currentStepDuration * currentStepProgressPercent) / 100;
		const rawPercent =
			((completedMinutes + currentStepMinutes) / totalDuration) * 100;
		return Math.min(100, Math.max(0, rawPercent));
	}, [
		schedule,
		currentStepDuration,
		currentStepIndex,
		currentStepProgressPercent,
		totalDuration,
	]);

	const workflowFillStyle = useMemo(() => {
		const startAlpha = theme === "dark" ? 0.45 : 0.5;
		const endAlpha = theme === "dark" ? 0.25 : 0.3;
		return `linear-gradient(180deg, ${hexToRgba(
			highlightColor,
			startAlpha,
		)}, ${hexToRgba(highlightColor, endAlpha)})`;
	}, [highlightColor, theme]);

	return (
		<aside
			className={`fixed left-8 top-1/2 transform -translate-y-1/2 z-70 flex flex-col items-start gap-4 transition-opacity duration-500 no-timer-click
 ${isActive ? " " : ""}
 `}
		>
			<div
				className="relative h-[60vh] w-1.5 rounded-full bg-opacity-20  transition-[width] duration-300 hover:w-2"
				style={{
					backgroundColor:
						theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
				}}
			>
				<div
					className="pointer-events-none absolute inset-0 z-10"
					aria-hidden="true"
				>
					<div
						className="absolute left-0 right-0 top-0"
						style={{
							height: `${workflowProgressPercent}%`,
							backgroundImage: workflowFillStyle,
							borderRadius: "9999px",
						}}
					/>
				</div>
				<div className="relative flex flex-col items-center h-full w-full z-20">
					{schedule.map((step, index) => {
						const heightPercent = (step.duration / totalDuration) * 100;
						const isHovered = hoveredStepIndex === index;
						const barColor = highlightColor;
						const stepFillPercent = 0; // remove per-step fill
						const highlightOpacity = isHovered ? 0.35 : 0;

						const hoverPaddingLeft = 28;
						const hoverPaddingRight = 24;

						return (
							<div
								key={step.id}
								className="relative w-full   "
								style={{ height: `${heightPercent}%` }}
							>
								<div
									className="absolute inset-y-0"
									style={{
										left: -hoverPaddingLeft,
										right: -hoverPaddingRight,
									}}
								>
									<div
										className="w-full h-full cursor-pointer"
										onMouseEnter={() => onHover(index)}
										onMouseLeave={() => onHover(null)}
									/>
								</div>
								<div className="absolute inset-0 flex justify-center pointer-events-none">
									<div className="relative w-full h-full">
										<div
											className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isHovered ? "" : ""} ${
												theme === "dark" ? "" : ""
											}`}
										/>

										<div
											className="absolute bottom-0 left-0 w-full transition-[height] duration-100 ease-linear"
											style={{
												height: `${stepFillPercent}%`,
												background: `linear-gradient(180deg, ${barColor}33, ${barColor})`,
												opacity: highlightOpacity,
												borderRadius: "9999px",
											}}
										/>
									</div>
								</div>

								<div
									className={`absolute top-1/2 -translate-y-1/2 w-48 p-2 rounded-lg  border transition-all duration-300 pointer-events-none  z-100 ${
										isHovered ? " translate-x-0" : " -translate-x-2.5"
									}
 ${theme === "dark" ? "bg-[#1a1a1a]/90  " : "  "}
 `}
									style={{
										left: `calc(50% + ${hoverPaddingRight}px)`,
									}}
								>
									<div className="flex items-center justify-between">
										<span
											className={`text-xs font-bold uppercase tracking-wider ${step.type === "focus" ? "" : ""}`}
										>
											{step.label}
										</span>
										<span className="text-[10px] font-mono ">
											{step.duration} min
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</aside>
	);
};
