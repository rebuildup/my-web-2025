import { renderHook, act } from "@testing-library/react";
import { useGameState } from "../hooks/useGameState";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useGameState", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState).toEqual({
      currentPosition: 0,
      score: 0,
      isGameActive: false,
      isGameOver: false,
      inputValue: "",
      showHint: false,
      mistakes: 0,
      startTime: null,
      endTime: null,
    });

    expect(result.current.stats).toEqual({
      bestScore: 0,
      totalGames: 0,
      averageScore: 0,
      totalTime: 0,
      accuracy: 0,
    });

    expect(result.current.scoreHistory).toEqual([]);
  });

  it("starts game correctly", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameState.isGameActive).toBe(true);
    expect(result.current.gameState.isGameOver).toBe(false);
    expect(result.current.gameState.startTime).toBeTruthy();
    expect(result.current.gameState.currentPosition).toBe(0);
    expect(result.current.gameState.score).toBe(0);
    expect(result.current.gameState.mistakes).toBe(0);
  });

  it("ends game correctly", () => {
    const { result } = renderHook(() => useGameState());

    // Start game first
    act(() => {
      result.current.startGame();
    });

    // Then end game
    act(() => {
      result.current.endGame();
    });

    expect(result.current.gameState.isGameActive).toBe(false);
    expect(result.current.gameState.isGameOver).toBe(true);
    expect(result.current.gameState.endTime).toBeTruthy();
  });

  it("resets game correctly", () => {
    const { result } = renderHook(() => useGameState());

    // Start and modify game state
    act(() => {
      result.current.startGame();
      result.current.setGameState((prev) => ({
        ...prev,
        score: 10,
        currentPosition: 10,
        mistakes: 2,
      }));
    });

    // Reset game
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState).toEqual({
      currentPosition: 0,
      score: 0,
      isGameActive: false,
      isGameOver: false,
      inputValue: "",
      showHint: false,
      mistakes: 0,
      startTime: null,
      endTime: null,
    });
  });

  it("loads saved stats from localStorage", () => {
    const savedStats = {
      bestScore: 50,
      totalGames: 10,
      averageScore: 25.5,
      totalTime: 30000,
      accuracy: 0.85,
    };

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "pi-game-stats") {
        return JSON.stringify(savedStats);
      }
      return null;
    });

    const { result } = renderHook(() => useGameState());

    expect(result.current.stats).toEqual(savedStats);
  });

  it("loads saved score history from localStorage", () => {
    const savedHistory = [
      {
        score: 25,
        accuracy: 0.9,
        time: 15000,
        date: "2024-01-01T00:00:00.000Z",
        difficulty: "normal" as const,
      },
      {
        score: 30,
        accuracy: 0.85,
        time: 18000,
        date: "2024-01-02T00:00:00.000Z",
        difficulty: "hard" as const,
      },
    ];

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "pi-game-history") {
        return JSON.stringify(savedHistory);
      }
      return null;
    });

    const { result } = renderHook(() => useGameState());

    expect(result.current.scoreHistory).toEqual(savedHistory);
  });

  it("handles corrupted localStorage data gracefully", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "pi-game-stats" || key === "pi-game-history") {
        return "invalid-json";
      }
      return null;
    });

    const { result } = renderHook(() => useGameState());

    // Should use default values when localStorage data is corrupted
    expect(result.current.stats.bestScore).toBe(0);
    expect(result.current.scoreHistory).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("updates game state correctly", () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.setGameState((prev) => ({
        ...prev,
        score: 15,
        currentPosition: 15,
        mistakes: 1,
      }));
    });

    expect(result.current.gameState.score).toBe(15);
    expect(result.current.gameState.currentPosition).toBe(15);
    expect(result.current.gameState.mistakes).toBe(1);
  });

  it("updates stats correctly", () => {
    const { result } = renderHook(() => useGameState());

    const newStats = {
      bestScore: 100,
      totalGames: 5,
      averageScore: 60,
      totalTime: 25000,
      accuracy: 0.92,
    };

    act(() => {
      result.current.setStats(newStats);
    });

    expect(result.current.stats).toEqual(newStats);
  });

  it("updates score history correctly", () => {
    const { result } = renderHook(() => useGameState());

    const newHistory = [
      {
        score: 40,
        accuracy: 0.95,
        time: 20000,
        date: "2024-01-03T00:00:00.000Z",
        difficulty: "easy" as const,
      },
    ];

    act(() => {
      result.current.setScoreHistory(newHistory);
    });

    expect(result.current.scoreHistory).toEqual(newHistory);
  });
});
