import { useState, useCallback, useEffect } from "react";
import { GameState, GameStats, ScoreRecord } from "../types";

const INITIAL_GAME_STATE: GameState = {
  currentPosition: 0,
  score: 0,
  isGameActive: false,
  isGameOver: false,
  inputValue: "",
  showHint: false,
  mistakes: 0,
  startTime: null,
  endTime: null,
};

const INITIAL_STATS: GameStats = {
  bestScore: 0,
  totalGames: 0,
  averageScore: 0,
  totalTime: 0,
  accuracy: 0,
};

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [scoreHistory, setScoreHistory] = useState<ScoreRecord[]>([]);

  // Load saved data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStats = localStorage.getItem("pi-game-stats");
      const savedHistory = localStorage.getItem("pi-game-history");

      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats));
        } catch (error) {
          console.error("Failed to load stats:", error);
        }
      }

      if (savedHistory) {
        try {
          setScoreHistory(JSON.parse(savedHistory));
        } catch (error) {
          console.error("Failed to load score history:", error);
        }
      }
    }
  }, []);

  const startGame = useCallback(() => {
    setGameState({
      ...INITIAL_GAME_STATE,
      isGameActive: true,
      startTime: Date.now(),
    });
  }, []);

  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isGameActive: false,
      isGameOver: true,
      endTime: Date.now(),
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(INITIAL_GAME_STATE);
  }, []);

  return {
    gameState,
    stats,
    scoreHistory,
    startGame,
    endGame,
    resetGame,
    setGameState,
    setStats,
    setScoreHistory,
  };
}
