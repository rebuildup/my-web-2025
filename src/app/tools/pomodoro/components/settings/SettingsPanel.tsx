"use client";

import type { PomodoroSettings } from "../../types";
import type { ScheduleStep } from "../../utils/pomodoro-constants";
import { DockTab } from "./DockTab";
import { SettingsSidebar } from "./SettingsSidebar";
import type { DockVisibilityKey, SettingsTab } from "./types";
import { WidgetsTab } from "./WidgetsTab";
import { WorkflowTab } from "./WorkflowTab";
import { YoutubeTab } from "./YoutubeTab";

export type { SettingsTab } from "./types";

export const SettingsPanel = ({
	theme,
	settings,
	settingsTab,
	customSchedule,
	dockVisibility,
	highlightColor,
	onTabChange,
	onClose,
	onUpdateSchedule,
	onAddStep,
	onRemoveStep,
	onUpdateDockVisibility,
	onUpdateSettings,
	nextId,
}: {
	theme: string;
	settings: PomodoroSettings;
	settingsTab: SettingsTab;
	customSchedule: ScheduleStep[];
	dockVisibility: Record<DockVisibilityKey, boolean>;
	highlightColor: string;
	onTabChange: (tab: SettingsTab) => void;
	onClose: () => void;
	onUpdateSchedule: (index: number, updates: Partial<ScheduleStep>) => void;
	onAddStep: () => void;
	onRemoveStep: (index: number) => void;
	onUpdateDockVisibility: (key: DockVisibilityKey, visible: boolean) => void;
	onUpdateSettings: (updates: Partial<PomodoroSettings>) => void;
	nextId: () => number;
}) => {
	return (
		<div className="fixed inset-0 z-2147483647 flex items-center justify-center pointer-events-auto">
			{/* Overlay */}
			<div className="absolute inset-0  " onClick={onClose} />
			{/* Panel */}
			<div
				className={`relative z-10 rounded-2xl border   max-w-6xl w-full mx-4 h-[calc(100vh-2rem)] md:h-[600px] overflow-hidden flex flex-col md:flex-row ${
					theme === "dark" ? "bg-[#1a1a1a]/95 " : " "
				}`}
			>
				<SettingsSidebar
					theme={theme}
					settingsTab={settingsTab}
					onTabChange={onTabChange}
					onClose={onClose}
				/>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-track]:">
					{settingsTab === "workflow" && (
						<WorkflowTab
							theme={theme}
							customSchedule={customSchedule}
							onUpdateSchedule={onUpdateSchedule}
							onAddStep={onAddStep}
							onRemoveStep={onRemoveStep}
						/>
					)}

					{settingsTab === "dock" && (
						<DockTab
							theme={theme}
							dockVisibility={dockVisibility}
							onUpdateDockVisibility={onUpdateDockVisibility}
						/>
					)}

					{settingsTab === "widgets" && (
						<WidgetsTab
							theme={theme}
							settings={settings}
							highlightColor={highlightColor}
							onUpdateSettings={onUpdateSettings}
						/>
					)}

					{settingsTab === "youtube" && (
						<YoutubeTab
							theme={theme}
							settings={settings}
							highlightColor={highlightColor}
							onUpdateSettings={onUpdateSettings}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
