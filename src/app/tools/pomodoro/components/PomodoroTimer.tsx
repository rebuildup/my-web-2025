"use client";

import { Moon, Settings, Sun } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { usePomodoroTimer } from "../hooks/usePomodoroTimer";
import { usePomodoroWidgetStore } from "../hooks/usePomodoroWidgetStore";
import { DEFAULT_HIGHLIGHT_COLOR } from "../types";
import { isStickyWidgetType } from "../utils/pomodoro-constants";
import { Dock, DockButton } from "./Dock";
import { SettingsPanel } from "./settings/SettingsPanel";
import { Widget } from "./Widget";
import { WidgetDockActions } from "./WidgetDockActions";
import { CircularTimer } from "./widgets/CircularTimer";
import { CurrentStepLabel } from "./widgets/CurrentStepLabel";
import { DeleteZone } from "./widgets/DeleteZone";
import { StopDialog } from "./widgets/StopDialog";
import { WorkflowProgressBar } from "./widgets/WorkflowProgressBar";

export default function PomodoroTimer() {
	const seedRef = useRef(123456789);

	const timer = usePomodoroTimer();
	const {
		settings,
		setSettings,
		stats,
		sessions,
		currentStepIndex,
		customSchedule,
		timeLeft,
		isActive,
		isFinished,
		currentStep,
		totalDuration,
		start,
		pause,
		reset,
		skipToNext,
		updateSchedule,
		addStep,
		removeStep,
	} = timer;

	const widgetStore = usePomodoroWidgetStore({
		stickyWidgetSize: settings.stickyWidgetSize ?? 200,
		youtubeWidgetWidth: settings.youtubeWidgetWidth ?? 400,
		seedRef,
	});
	const {
		widgets,
		nextZ,
		nextId,
		isDraggingStickyWidget,
		setIsDraggingStickyWidget,
		addWidget,
		updateWidget,
		removeWidget,
	} = widgetStore;

	const [theme, setTheme] = useState(settings.theme || "dark");
	const [showStopDialog, setShowStopDialog] = useState(false);
	const [showSettingsPanel, setShowSettingsPanel] = useState(false);
	const [settingsTab, setSettingsTab] = useState<
		"workflow" | "dock" | "widgets" | "youtube"
	>("workflow");
	const [dockVisibility, setDockVisibility] = useState({
		note: true,
		image: false,
		music: true,
		timer: true,
		stats: false,
		theme: true,
		settings: true,
	});
	const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

	const highlightColor = settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR;

	const currentStepProgressPercent = useMemo(() => {
		const durationMs = currentStep.duration * 60 * 1000;
		if (durationMs <= 0) return 0;
		const progress = ((durationMs - timeLeft) / durationMs) * 100;
		return Math.min(100, Math.max(0, progress));
	}, [currentStep.duration, timeLeft]);

	const handleTimerClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest(".no-timer-click")) {
			return;
		}

		if (isFinished) {
			skipToNext();
		} else if (isActive) {
			setShowStopDialog(true);
		} else {
			start();
		}
	};

	const handleStop = () => {
		pause();
		setShowStopDialog(false);
	};

	const handleReset = () => {
		reset();
		setShowStopDialog(false);
	};

	const handleSkip = () => {
		skipToNext();
		setShowStopDialog(false);
	};

	const toggleTheme = () =>
		setTheme((prev) => (prev === "light" ? "dark" : "light"));

	const updateDockVisibility = (
		key: keyof typeof dockVisibility,
		visible: boolean,
	) => {
		setDockVisibility((prev) => ({ ...prev, [key]: visible }));
	};

	const updateSettings = (updates: Partial<typeof settings>) => {
		setSettings({ ...settings, ...updates });
	};

	return (
		<div
			className={`relative w-full h-screen overflow-hidden transition-colors duration-500 select-none ${
				theme === "dark" ? " " : " "
			}`}
			style={{
				backgroundImage:
					theme === "light"
						? "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)"
						: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
				backgroundSize: "24px 24px",
			}}
		>
			{widgets.map((widget) => (
				<Widget
					key={widget.id}
					widget={widget}
					updateWidget={updateWidget}
					removeWidget={removeWidget}
					theme={theme}
					bringToFront={() => updateWidget(widget.id, { zIndex: nextZ() })}
					onDragStart={() => {
						if (isStickyWidgetType(widget.type)) {
							setIsDraggingStickyWidget(true);
						}
					}}
					onDragEnd={() => {
						setIsDraggingStickyWidget(false);
					}}
					pomodoroState={{
						isActive,
						sessionType:
							currentStep.type === "focus" ? "work" : ("shortBreak" as any),
					}}
					stats={stats}
					sessions={sessions}
				/>
			))}

			<CurrentStepLabel label={currentStep.label} theme={theme} />

			<CircularTimer
				timeLeft={timeLeft}
				isActive={isActive}
				theme={theme}
				sessionType={currentStep.type}
				durationMinutes={currentStep.duration}
				onClick={handleTimerClick}
			/>

			<WorkflowProgressBar
				schedule={customSchedule}
				currentStepIndex={currentStepIndex}
				currentStepDuration={currentStep.duration}
				currentStepProgressPercent={currentStepProgressPercent}
				totalDuration={totalDuration}
				highlightColor={highlightColor}
				isActive={isActive}
				theme={theme}
				hoveredStepIndex={hoveredStepIndex}
				onHover={setHoveredStepIndex}
			/>

			{isDraggingStickyWidget && <DeleteZone />}

			{showStopDialog && (
				<StopDialog
					theme={theme}
					onClose={() => setShowStopDialog(false)}
					onReset={handleReset}
					onStop={handleStop}
					onSkip={handleSkip}
				/>
			)}

			<Dock theme={theme}>
				<WidgetDockActions
					dockVisibility={dockVisibility}
					theme={theme}
					onAdd={addWidget}
				/>

				{(dockVisibility.note ||
					dockVisibility.image ||
					dockVisibility.music) &&
					(dockVisibility.theme || true) && (
						<div className="w-px h-8   mx-1 self-center" />
					)}

				{dockVisibility.theme && (
					<DockButton
						onClick={toggleTheme}
						icon={theme === "dark" ? Sun : Moon}
						label="Theme"
						theme={theme}
						colorClass=""
					/>
				)}
				<DockButton
					onClick={() => setShowSettingsPanel(true)}
					icon={Settings}
					label="Settings"
					theme={theme}
					accentColor={highlightColor}
				/>
			</Dock>

			{showSettingsPanel && (
				<SettingsPanel
					theme={theme}
					settings={settings}
					settingsTab={settingsTab}
					customSchedule={customSchedule}
					dockVisibility={dockVisibility}
					highlightColor={highlightColor}
					onTabChange={setSettingsTab}
					onClose={() => setShowSettingsPanel(false)}
					onUpdateSchedule={updateSchedule}
					onAddStep={() => addStep(nextId())}
					onRemoveStep={removeStep}
					onUpdateDockVisibility={updateDockVisibility}
					onUpdateSettings={updateSettings}
					nextId={nextId}
				/>
			)}
		</div>
	);
}
