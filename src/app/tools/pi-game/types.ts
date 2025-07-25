export interface GameState {
  currentPosition: number;
  score: number;
  isGameActive: boolean;
  isGameOver: boolean;
  inputValue: string;
  showHint: boolean;
  mistakes: number;
  startTime: number | null;
  endTime: number | null;
}

export interface GameStats {
  bestScore: number;
  totalGames: number;
  averageScore: number;
  totalTime: number;
  accuracy: number;
}

export interface GameSettings {
  showHints: boolean;
  playSound: boolean;
  difficulty: "easy" | "normal" | "hard";
  timeLimit: number | null;
}

export interface ScoreRecord {
  score: number;
  accuracy: number;
  time: number;
  date: string;
  difficulty: "easy" | "normal" | "hard";
}
