"use client";

export const CurrentStepLabel = ({
	label,
	theme,
}: {
	label: string;
	theme: string;
}) => {
	return (
		<div
			className={`fixed top-8 left-1/2 -translate-x-1/2 z-30 text-sm tracking-[0.4em] uppercase font-bold  pointer-events-none
 ${theme === "dark" ? "" : ""}
 `}
		>
			{label}
		</div>
	);
};
