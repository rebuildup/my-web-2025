"use client";

import {
	BarChart2,
	Image as ImageIcon,
	Music,
	StickyNote,
	Timer,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { DockButton } from "./Dock";

export type WidgetDockActionsProps = {
	dockVisibility: {
		note: boolean;
		image: boolean;
		music: boolean;
		timer: boolean;
		stats: boolean;
	};
	theme: string;
	onAdd: (type: string) => void;
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

/**
 * The widget-creation entries on the bottom dock. Pulled out of PomodoroTimer
 * so the timer component stays focused on the timer lifecycle.
 */
export function WidgetDockActions({
	dockVisibility,
	theme,
	onAdd,
}: WidgetDockActionsProps) {
	const entries: Array<{
		visible: boolean;
		icon: IconComponent;
		label: string;
		type: string;
	}> = [
		{
			visible: dockVisibility.note,
			icon: StickyNote,
			label: "Note",
			type: "note",
		},
		{
			visible: dockVisibility.image,
			icon: ImageIcon,
			label: "Image",
			type: "image",
		},
		{
			visible: dockVisibility.music,
			icon: Music,
			label: "YouTube",
			type: "music",
		},
		{
			visible: dockVisibility.timer,
			icon: Timer,
			label: "Timer",
			type: "timer",
		},
		{
			visible: dockVisibility.stats,
			icon: BarChart2,
			label: "Stats",
			type: "stats",
		},
	];

	return (
		<>
			{entries
				.filter((entry) => entry.visible)
				.map((entry) => (
					<DockButton
						key={entry.type}
						onClick={() => onAdd(entry.type)}
						icon={entry.icon}
						label={entry.label}
						theme={theme}
						colorClass=""
					/>
				))}
		</>
	);
}
