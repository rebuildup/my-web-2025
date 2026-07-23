export interface YouTubePlayerProps {
	pomodoroState: {
		isActive: boolean;
		sessionType: "work" | "shortBreak" | "longBreak";
	};
	theme: "light" | "dark";
	url: string;
	onUrlChange: (url: string) => void;
	onToggleMinimize?: (isMinimized: boolean) => void;
	autoPlayOnFocusSession: boolean;
	pauseOnBreak: boolean;
	defaultVolume: number;
	loopEnabled: boolean;
}
