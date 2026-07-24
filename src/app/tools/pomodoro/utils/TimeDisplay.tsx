"use client";

export const TimeDisplay = ({
	ms,
	theme,
	isActive,
}: {
	ms: number;
	theme: string;
	isActive: boolean;
}) => {
	const totalSeconds = Math.floor(ms / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const milliseconds = Math.floor((ms % 1000) / 10);

	return (
		<div
			className={`flex items-baseline justify-center tabular-nums tracking-[-0.15em] select-none cursor-pointer font-mono font-bold transition-opacity duration-300
 ${theme === "dark" ? "" : ""}
 ${isActive ? "" : " "}
 `}
		>
			<span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none text-right w-auto min-w-16 sm:min-w-19 md:min-w-23 lg:min-w-28">
				{String(minutes).padStart(2, "0")}
			</span>
			<span
				className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none -mx-1.25 -translate-y-0.75 ${isActive ? "animate-pulse" : ""}`}
			>
				:
			</span>
			<span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none text-left w-auto min-w-16 sm:min-w-19 md:min-w-23 lg:min-w-28">
				{String(seconds).padStart(2, "0")}
			</span>
			<span className="text-lg sm:text-xl md:text-2xl leading-none ml-0.5 sm:ml-1 md:ml-1.5 lg:ml-2 w-10 sm:w-12 md:w-14 lg:w-16 min-w-[30px] sm:min-w-9 md:min-w-[42px] lg:min-w-12  font-medium self-end mb-1 sm:mb-1.5 md:mb-2">
				.{String(milliseconds).padStart(2, "0")}
			</span>
		</div>
	);
};
