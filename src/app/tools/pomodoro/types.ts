export interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notificationSound: boolean;
  notificationVolume: number; // 0-100
  vibration: boolean;
  theme: "light" | "dark";
}

export interface PomodoroSession {
  id: string;
  type: "work" | "shortBreak" | "longBreak";
  duration: number; // in seconds
  completedAt: Date;
}

export interface PomodoroStats {
  totalSessions: number;
  totalWorkTime: number; // in seconds
  totalBreakTime: number; // in seconds
  completedPomodoros: number;
  currentStreak: number;
  longestStreak: number;
  todaysSessions: number;
}

export type TimerState = "idle" | "running" | "paused" | "completed";
export type SessionType = "work" | "shortBreak" | "longBreak";

export interface TimerDisplay {
  minutes: number;
  seconds: number;
  progress: number; // 0-100
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  requireInteraction?: boolean;
}
