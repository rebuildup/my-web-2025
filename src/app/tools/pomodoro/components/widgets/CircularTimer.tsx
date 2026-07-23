"use client";

import React, { useMemo } from "react";
import { TimeDisplay } from "../../utils/TimeDisplay";

export const CircularTimer = ({
	timeLeft,
	isActive,
	theme,
	sessionType,
	durationMinutes,
	onClick,
}: {
	timeLeft: number;
	isActive: boolean;
	theme: string;
	sessionType: string;
	durationMinutes: number;
	onClick: (e: React.MouseEvent) => void;
}) => {
	const progressPercent = useMemo(() => {
		const totalDuration = durationMinutes * 60 * 1000;
		return Math.min(
			100,
			Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100),
		);
	}, [timeLeft, durationMinutes]);

	return (
		<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
			<div className="relative flex items-center justify-center w-60 h-60 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] lg:w-[520px] lg:h-[520px]">
				{/* Background circle */}
				<svg
					className="absolute inset-0 w-full h-full"
					viewBox="0 0 100 100"
					aria-hidden="true"
					style={{ transform: "rotate(90deg) scaleX(-1)" }}
				>
					<circle
						cx="50"
						cy="50"
						r="45"
						stroke={theme === "dark" ? "#555" : "#ddd"}
						strokeWidth="3"
						fill="none"
					/>
					<circle
						cx="50"
						cy="50"
						r="45"
						stroke={
							sessionType === "focus"
								? theme === "dark"
									? "rgba(255, 255, 255, 0.5)"
									: "rgba(0, 0, 0, 0.5)"
								: theme === "dark"
									? "rgba(14, 165, 233, 0.5)"
									: "rgba(59, 130, 246, 0.5)"
						}
						strokeWidth="3"
						fill="none"
						strokeDasharray={Math.PI * 2 * 45}
						strokeDashoffset={Math.PI * 2 * 45 * (progressPercent / 100)}
						strokeLinecap="butt"
					/>
				</svg>
				<button
					onClick={onClick}
					className="relative group pointer-events-auto "
					style={{ zIndex: 50 }}
				>
					<TimeDisplay ms={timeLeft} theme={theme} isActive={isActive} />
				</button>
			</div>
		</div>
	);
};
