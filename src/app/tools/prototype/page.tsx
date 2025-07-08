'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { Play, Pause, RotateCcw, Settings, Trophy, Timer, Target } from 'lucide-react';
import { GridLayout, GridContainer, GridContent, GridSection } from '@/components/GridSystem';

interface GameState {
  score: number;
  level: number;
  timeLeft: number;
  isPlaying: boolean;
  isPaused: boolean;
  targetNumber: number;
  currentSequence: number[];
  playerInput: number[];
  gameMode: 'memory' | 'sequence' | 'reaction';
}

export default function ProtoTypePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const gameContainerRef = useRef<Container | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    timeLeft: 60,
    isPlaying: false,
    isPaused: false,
    targetNumber: 0,
    currentSequence: [],
    playerInput: [],
    gameMode: 'memory'
  });

  const [settings, setSettings] = useState({
    difficulty: 'medium',
    soundEnabled: true,
    animationSpeed: 1,
    theme: 'dark'
  });

  useEffect(() => {
    initializePixiApp();
    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, []);

  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && gameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);

      return () => clearInterval(timer);
    }

    if (gameState.timeLeft === 0 && gameState.isPlaying) {
      endGame();
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.timeLeft]);

  const initializePixiApp = async () => {
    if (!canvasRef.current) return;

    const app = new Application();
    await app.init({
      canvas: canvasRef.current,
      width: 800,
      height: 600,
      backgroundColor: settings.theme === 'dark' ? 0x1a1a1a : 0xf0f0f0,
      antialias: true
    });

    appRef.current = app;
    
    // Create main game container
    const gameContainer = new Container();
    gameContainerRef.current = gameContainer;
    app.stage.addChild(gameContainer);

    createGameElements();
  };

  const createGameElements = () => {
    if (!appRef.current || !gameContainerRef.current) return;

    const container = gameContainerRef.current;
    container.removeChildren();

    // Create background grid
    const grid = new Graphics();
    const cellSize = 50;
    const gridColor = settings.theme === 'dark' ? 0x333333 : 0xcccccc;
    
    for (let i = 0; i <= 800; i += cellSize) {
      grid.moveTo(i, 0).lineTo(i, 600).stroke({ width: 1, color: gridColor });
    }
    for (let j = 0; j <= 600; j += cellSize) {
      grid.moveTo(0, j).lineTo(800, j).stroke({ width: 1, color: gridColor });
    }
    container.addChild(grid);

    // Create game elements based on mode
    switch (gameState.gameMode) {
      case 'memory':
        createMemoryGame();
        break;
      case 'sequence':
        createSequenceGame();
        break;
      case 'reaction':
        createReactionGame();
        break;
    }
  };

  const createMemoryGame = () => {
    if (!gameContainerRef.current) return;

    const container = gameContainerRef.current;
    const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3];
    const patterns = [];

    // Create memory pattern grid
    for (let i = 0; i < 6; i++) {
      const circle = new Graphics();
      const x = 150 + (i % 3) * 120;
      const y = 150 + Math.floor(i / 3) * 120;
      
      circle.circle(x, y, 40);
      circle.fill(colors[i]);
      circle.alpha = 0.3;
      circle.eventMode = 'static';
      circle.cursor = 'pointer';
      
      circle.on('pointerdown', () => handleMemoryClick(i));
      
      // Add hover effect
      circle.on('pointerover', () => {
        circle.alpha = 0.7;
      });
      circle.on('pointerout', () => {
        circle.alpha = gameState.currentSequence.includes(i) ? 1 : 0.3;
      });

      container.addChild(circle);
      patterns.push(circle);
    }

    // Add score text
    const scoreStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: settings.theme === 'dark' ? 0xffffff : 0x000000,
      fontWeight: 'bold'
    });

    const scoreText = new Text({
      text: `Score: ${gameState.score}`,
      style: scoreStyle
    });
    scoreText.x = 50;
    scoreText.y = 50;
    container.addChild(scoreText);

    const levelText = new Text({
      text: `Level: ${gameState.level}`,
      style: scoreStyle
    });
    levelText.x = 250;
    levelText.y = 50;
    container.addChild(levelText);
  };

  const createSequenceGame = () => {
    if (!gameContainerRef.current) return;

    const container = gameContainerRef.current;
    
    // Create number sequence display
    const numbers = [];
    for (let i = 0; i < 10; i++) {
      const numberText = new Text({
        text: Math.floor(Math.random() * 10).toString(),
        style: new TextStyle({
          fontFamily: 'Arial',
          fontSize: 32,
          fill: 0x0066ff,
          fontWeight: 'bold'
        })
      });
      
      numberText.x = 100 + i * 60;
      numberText.y = 200;
      numberText.alpha = 0.5;
      
      container.addChild(numberText);
      numbers.push(numberText);
    }

    // Create input area
    const inputBg = new Graphics();
    inputBg.rect(100, 350, 600, 80);
    inputBg.fill(settings.theme === 'dark' ? 0x333333 : 0xeeeeee);
    container.addChild(inputBg);

    const inputText = new Text({
      text: 'Enter the sequence...',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fill: settings.theme === 'dark' ? 0xffffff : 0x000000
      })
    });
    inputText.x = 120;
    inputText.y = 370;
    container.addChild(inputText);
  };

  const createReactionGame = () => {
    if (!gameContainerRef.current) return;

    const container = gameContainerRef.current;
    
    // Create reaction target
    const target = new Graphics();
    const x = Math.random() * 600 + 100;
    const y = Math.random() * 400 + 100;
    
    target.circle(x, y, 30);
    target.fill(0xff4757);
    target.eventMode = 'static';
    target.cursor = 'pointer';
    
    // Add pulsing animation
    let scale = 1;
    let growing = true;
    
    const animate = () => {
      if (growing) {
        scale += 0.02;
        if (scale >= 1.2) growing = false;
      } else {
        scale -= 0.02;
        if (scale <= 0.8) growing = true;
      }
      target.scale.set(scale);
    };

    appRef.current?.ticker.add(animate);
    
    target.on('pointerdown', () => handleReactionClick());
    
    container.addChild(target);

    // Add instructions
    const instructionText = new Text({
      text: 'Click the red targets as fast as possible!',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        fill: settings.theme === 'dark' ? 0xffffff : 0x000000,
        align: 'center'
      })
    });
    instructionText.x = 400;
    instructionText.y = 50;
    instructionText.anchor.set(0.5, 0);
    container.addChild(instructionText);
  };

  const handleMemoryClick = (index: number) => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    setGameState(prev => {
      const newPlayerInput = [...prev.playerInput, index];
      
      // Check if input matches sequence so far
      const isCorrect = newPlayerInput.every((input, i) => input === prev.currentSequence[i]);
      
      if (!isCorrect) {
        // Wrong input - end game
        return { ...prev, isPlaying: false };
      }
      
      if (newPlayerInput.length === prev.currentSequence.length) {
        // Sequence completed - advance level
        const newSequence = [...prev.currentSequence, Math.floor(Math.random() * 6)];
        return {
          ...prev,
          score: prev.score + prev.level * 10,
          level: prev.level + 1,
          currentSequence: newSequence,
          playerInput: []
        };
      }
      
      return { ...prev, playerInput: newPlayerInput };
    });
  };

  const handleReactionClick = () => {
    if (!gameState.isPlaying || gameState.isPaused) return;

    setGameState(prev => ({
      ...prev,
      score: prev.score + 10,
      targetNumber: prev.targetNumber + 1
    }));

    // Create new target
    setTimeout(() => {
      createReactionGame();
    }, 500);
  };

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      score: 0,
      level: 1,
      timeLeft: 60,
      currentSequence: [Math.floor(Math.random() * 6)],
      playerInput: [],
      targetNumber: 0
    }));

    createGameElements();
  };

  const pauseGame = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      timeLeft: 60,
      isPlaying: false,
      isPaused: false,
      targetNumber: 0,
      currentSequence: [],
      playerInput: [],
      gameMode: gameState.gameMode
    });

    createGameElements();
  };

  const endGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false
    }));
  };

  const changeGameMode = (mode: GameState['gameMode']) => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      isPlaying: false,
      isPaused: false,
      score: 0,
      level: 1,
      timeLeft: 60
    }));

    setTimeout(() => {
      createGameElements();
    }, 100);
  };

  return (
    <div className="bg-gray min-h-screen">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a
            href="/tools"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-xl"
          >
            ← Tools
          </a>
          <div className="text-foreground/60 text-sm">ProtoType Game Engine</div>
        </div>
      </nav>

      {/* Header */}
      <header className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-3xl md:text-4xl">
            ProtoType Game
          </h1>
          <p className="noto-sans-jp text-foreground/80">
            Interactive games powered by PIXI.js - Test your memory, reflexes, and pattern recognition
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Game Controls */}
          <div className="space-y-6">
            {/* Game Mode Selection */}
            <div className="border-foreground/20 bg-gray/50 border p-4">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">Game Mode</h3>
              <div className="space-y-2">
                <button
                  onClick={() => changeGameMode('memory')}
                  className={`w-full p-3 text-left transition-colors ${
                    gameState.gameMode === 'memory'
                      ? 'bg-primary text-white'
                      : 'border-foreground/20 text-foreground hover:bg-foreground/5 border'
                  }`}
                >
                  <div className="font-medium">Memory Challenge</div>
                  <div className="text-sm opacity-80">Remember and repeat sequences</div>
                </button>
                <button
                  onClick={() => changeGameMode('sequence')}
                  className={`w-full p-3 text-left transition-colors ${
                    gameState.gameMode === 'sequence'
                      ? 'bg-primary text-white'
                      : 'border-foreground/20 text-foreground hover:bg-foreground/5 border'
                  }`}
                >
                  <div className="font-medium">Sequence Game</div>
                  <div className="text-sm opacity-80">Follow number patterns</div>
                </button>
                <button
                  onClick={() => changeGameMode('reaction')}
                  className={`w-full p-3 text-left transition-colors ${
                    gameState.gameMode === 'reaction'
                      ? 'bg-primary text-white'
                      : 'border-foreground/20 text-foreground hover:bg-foreground/5 border'
                  }`}
                >
                  <div className="font-medium">Reaction Test</div>
                  <div className="text-sm opacity-80">Test your reflexes</div>
                </button>
              </div>
            </div>

            {/* Game Stats */}
            <div className="border-foreground/20 bg-gray/50 border p-4">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">Game Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-primary" />
                    <span className="text-foreground/70 text-sm">Score</span>
                  </div>
                  <span className="neue-haas-grotesk-display text-foreground font-bold">
                    {gameState.score.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-primary" />
                    <span className="text-foreground/70 text-sm">Level</span>
                  </div>
                  <span className="neue-haas-grotesk-display text-foreground font-bold">
                    {gameState.level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-primary" />
                    <span className="text-foreground/70 text-sm">Time Left</span>
                  </div>
                  <span className="neue-haas-grotesk-display text-foreground font-bold">
                    {gameState.timeLeft}s
                  </span>
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="border-foreground/20 bg-gray/50 border p-4">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">Controls</h3>
              <div className="space-y-3">
                {!gameState.isPlaying ? (
                  <button
                    onClick={startGame}
                    className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 py-3 text-white transition-colors"
                  >
                    <Play size={20} />
                    Start Game
                  </button>
                ) : (
                  <button
                    onClick={pauseGame}
                    className="bg-yellow-500 hover:bg-yellow-600 flex w-full items-center justify-center gap-2 py-3 text-white transition-colors"
                  >
                    <Pause size={20} />
                    {gameState.isPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
                
                <button
                  onClick={resetGame}
                  className="border-foreground/20 text-foreground hover:bg-foreground/5 flex w-full items-center justify-center gap-2 border py-3 transition-colors"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="border-foreground/20 bg-gray/50 border p-4">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 flex items-center gap-2 text-lg">
                <Settings size={20} />
                Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-foreground/70 mb-1 block text-sm">Difficulty</label>
                  <select
                    value={settings.difficulty}
                    onChange={(e) => setSettings({...settings, difficulty: e.target.value})}
                    className="border-foreground/20 bg-gray text-foreground w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-foreground/70 mb-1 block text-sm">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    className="border-foreground/20 bg-gray text-foreground w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70 text-sm">Sound Effects</span>
                  <button
                    onClick={() => setSettings({...settings, soundEnabled: !settings.soundEnabled})}
                    className={`px-3 py-1 text-xs transition-colors ${
                      settings.soundEnabled 
                        ? 'bg-primary text-white' 
                        : 'border-foreground/20 text-foreground border'
                    }`}
                  >
                    {settings.soundEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <div className="border-foreground/20 bg-gray/50 border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="neue-haas-grotesk-display text-foreground text-xl">
                  {gameState.gameMode === 'memory' && 'Memory Challenge'}
                  {gameState.gameMode === 'sequence' && 'Sequence Game'}
                  {gameState.gameMode === 'reaction' && 'Reaction Test'}
                </h3>
                {gameState.isPlaying && (
                  <div className={`px-3 py-1 text-sm ${
                    gameState.isPaused 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {gameState.isPaused ? 'PAUSED' : 'PLAYING'}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full max-w-full border border-foreground/20"
                />
                
                {!gameState.isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray/80">
                    <div className="text-center">
                      <Play size={64} className="text-primary mx-auto mb-4" />
                      <h4 className="neue-haas-grotesk-display text-foreground mb-2 text-2xl">
                        Ready to Play?
                      </h4>
                      <p className="text-foreground/70 mb-4">
                        Select a game mode and click Start Game to begin
                      </p>
                      <button
                        onClick={startGame}
                        className="bg-primary hover:bg-primary/90 px-6 py-3 text-white transition-colors"
                      >
                        Start Game
                      </button>
                    </div>
                  </div>
                )}

                {gameState.isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray/80">
                    <div className="text-center">
                      <Pause size={64} className="text-yellow-500 mx-auto mb-4" />
                      <h4 className="neue-haas-grotesk-display text-foreground mb-2 text-2xl">
                        Game Paused
                      </h4>
                      <button
                        onClick={pauseGame}
                        className="bg-primary hover:bg-primary/90 px-6 py-3 text-white transition-colors"
                      >
                        Resume Game
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Game Instructions */}
              <div className="mt-4 text-sm text-foreground/70">
                {gameState.gameMode === 'memory' && (
                  <p>Watch the sequence of colored circles, then click them in the same order. Each level adds one more to remember!</p>
                )}
                {gameState.gameMode === 'sequence' && (
                  <p>Memorize the number sequence shown, then input it correctly. Speed and accuracy matter!</p>
                )}
                {gameState.gameMode === 'reaction' && (
                  <p>Click the red targets as quickly as possible. Your reaction time determines your score!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}