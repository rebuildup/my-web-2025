"use client";

import React, { useEffect, useRef, useState } from "react";
import { hexToRgba } from "../utils/pomodoro-constants";

export const Dock = ({
	children,
	theme,
}: {
	children: React.ReactNode;
	theme: string;
}) => {
	const [mouseX, setMouseX] = useState<number | null>(null);
	const dockRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (dockRef.current) {
			const rect = dockRef.current.getBoundingClientRect();
			setMouseX(e.clientX - rect.left);
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!dockRef.current || !e.touches[0]) return;
		const rect = dockRef.current.getBoundingClientRect();
		setMouseX(e.touches[0].clientX - rect.left);
	};

	const handleMouseLeave = () => {
		setMouseX(null);
	};

	const handleTouchEnd = () => {
		setMouseX(null);
	};

	return (
		<div
			className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-60 px-4 h-16 rounded-2xl border   flex items-end gap-2 transition-all duration-300 no-timer-click
 ${theme === "dark" ? "bg-[#111]/80 " : " "}
 `}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
			ref={dockRef}
		>
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child)) {
					return (
						<DockItem mouseX={mouseX} theme={theme}>
							{child}
						</DockItem>
					);
				}
				return null;
			})}
		</div>
	);
};

export const DockItem = ({
	mouseX,
	children,
	theme,
}: {
	mouseX: number | null;
	children: React.ReactElement;
	theme: string;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(40);

	useEffect(() => {
		if (mouseX !== null && ref.current) {
			const iconCenterX = ref.current.offsetLeft + ref.current.offsetWidth / 2;
			const distance = Math.abs(mouseX - iconCenterX);

			const scale = Math.max(1, 2 - distance / 100);
			const newWidth = Math.min(64, Math.max(40, 40 * scale));

			setWidth(newWidth);
		} else {
			setWidth(40);
		}
	}, [mouseX]);

	return (
		<div
			ref={ref}
			style={{ width: `${width}px`, height: `${width}px` }}
			className="relative flex items-center justify-center mb-2 transition-[width,height] duration-100 ease-out will-change-[width,height] rounded-full overflow-hidden"
		>
			{React.cloneElement(children as any, {
				size: width * 0.5,
			})}
		</div>
	);
};

export const DockButton = ({
	onClick,
	icon: Icon,
	label,
	theme,
	colorClass,
	accentColor,
}: {
	onClick: () => void;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	theme: string;
	colorClass?: string;
	accentColor?: string;
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const accentStyle =
		accentColor && isHovered
			? {
					boxShadow: `0 0 18px ${hexToRgba(accentColor, 0.45)}`,
				}
			: undefined;

	return (
		<button
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onFocus={() => setIsHovered(true)}
			onBlur={() => setIsHovered(false)}
			className={`w-full h-full flex items-center justify-center relative group ${theme === "dark" ? " " : " "} ${colorClass || ""}`}
			style={accentStyle}
		>
			<Icon
				className={`pointer-events-none ${theme === "dark" ? "" : ""}`}
				style={accentColor && isHovered ? { color: accentColor } : undefined}
			/>
			<span
				className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider   transition-opacity whitespace-nowrap pointer-events-none
 ${theme === "dark" ? " " : "  "}
 `}
			>
				{label}
			</span>
		</button>
	);
};
