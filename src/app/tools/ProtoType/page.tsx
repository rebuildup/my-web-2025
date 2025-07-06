'use client';

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Gamepad2, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  Zap,
  Github,
  BarChart3
} from "lucide-react";

interface GameSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'practice' | 'challenge' | 'endurance';
  textType: 'words' | 'sentences' | 'code' | 'custom';
  timeLimit: number; // in seconds, 0 = no limit
  customText: string;
}

interface GameStats {
  wpm: number; // Words per minute
  accuracy: number; // Percentage
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  timeElapsed: number; // in seconds
}

interface HighScore {
  wpm: number;
  accuracy: number;
  difficulty: string;
  mode: string;
  date: string;
}

const defaultSettings: GameSettings = {
  difficulty: 'medium',
  gameMode: 'practice',
  textType: 'words',
  timeLimit: 60,
  customText: ''
};

const defaultStats: GameStats = {
  wpm: 0,
  accuracy: 100,
  totalCharacters: 0,
  correctCharacters: 0,
  incorrectCharacters: 0,
  timeElapsed: 0
};

// Sample texts for different difficulties
const sampleTexts = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "Hello world this is a simple typing test.",
    "Programming is fun and challenging.",
    "React makes building user interfaces easy."
  ],
  medium: [
    "TypeScript is a strongly typed programming language that builds on JavaScript.",
    "The useState hook allows you to add state to functional components in React.",
    "Modern web development involves many tools and frameworks to create amazing experiences.",
    "Responsive design ensures that websites work well on all device sizes."
  ],
  hard: [
    "const [state, setState] = useState<GameStats>(defaultStats);",
    "function calculateWPM(characters: number, timeInMinutes: number): number {",
    "interface ComponentProps { onClick: () => void; disabled?: boolean; }",
    "export default function Component({ children, className = '' }: PropsWithChildren<{ className?: string }>) {"
  ]
};

export default function ProtoTypePage() {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // PIXI.js placeholder - simulated canvas rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    loadSettings();
    loadHighScores();
    generateNewText();
  }, []);

  useEffect(() => {
    generateNewText();
  }, [settings.difficulty, settings.textType]);

  useEffect(() => {
    if (gameState === 'playing' && startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        
        if (settings.timeLimit > 0) {
          const remaining = settings.timeLimit - elapsed;
          setTimeLeft(remaining);
          
          if (remaining <= 0) {
            finishGame();
            return;
          }
        }
        
        updateStats(elapsed);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState, startTime, userInput, currentText]);

  useEffect(() => {
    // Simple canvas animation simulation (placeholder for PIXI.js)
    if (canvasRef.current && gameState === 'playing') {
      startCanvasAnimation();
    } else {
      stopCanvasAnimation();
    }

    return () => stopCanvasAnimation();
  }, [gameState]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('prototype-settings');
      if (saved) {
        setSettings({...defaultSettings, ...JSON.parse(saved)});
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('prototype-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadHighScores = () => {
    try {
      const saved = localStorage.getItem('prototype-highscores');
      if (saved) {
        setHighScores(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load high scores:', error);
    }
  };

  const saveHighScore = (score: HighScore) => {
    const newHighScores = [...highScores, score]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 10); // Keep top 10
      
    setHighScores(newHighScores);
    
    try {
      localStorage.setItem('prototype-highscores', JSON.stringify(newHighScores));
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  };

  const generateNewText = () => {
    let text = '';
    
    if (settings.textType === 'custom' && settings.customText.trim()) {
      text = settings.customText.trim();
    } else {
      const texts = sampleTexts[settings.difficulty];
      text = texts[Math.floor(Math.random() * texts.length)];
    }
    
    setCurrentText(text);
    setUserInput('');
    setCurrentIndex(0);
  };

  const startGame = () => {
    setGameState('playing');
    setStartTime(Date.now());
    setStats(defaultStats);
    setUserInput('');
    setCurrentIndex(0);
    setShowResults(false);
    
    if (settings.timeLimit > 0) {
      setTimeLeft(settings.timeLimit);
    }
    
    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const finishGame = () => {
    setGameState('finished');
    setShowResults(true);
    
    if (stats.wpm > 0) {
      const highScore: HighScore = {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        difficulty: settings.difficulty,
        mode: settings.gameMode,
        date: new Date().toISOString()
      };
      saveHighScore(highScore);
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setStats(defaultStats);
    setUserInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setTimeLeft(null);
    setShowResults(false);
    generateNewText();
  };

  const updateStats = (timeElapsed: number) => {
    const totalChars = userInput.length;
    const correctChars = userInput.split('').filter((char, index) => 
      char === currentText[index]
    ).length;
    const incorrectChars = totalChars - correctChars;
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 100;
    
    // WPM calculation (1 word = 5 characters)
    const timeInMinutes = timeElapsed / 60;
    const wpm = timeInMinutes > 0 ? Math.round((correctChars / 5) / timeInMinutes) : 0;
    
    setStats({
      wpm,
      accuracy: Math.round(accuracy),
      totalCharacters: totalChars,
      correctCharacters: correctChars,
      incorrectCharacters: incorrectChars,
      timeElapsed
    });
  };

  const handleInputChange = (value: string) => {
    if (gameState !== 'playing') return;
    
    setUserInput(value);
    
    // Check if game is complete
    if (value.length >= currentText.length) {
      finishGame();
    }
  };

  const getCharacterClass = (index: number): string => {
    if (index >= userInput.length) {
      return index === userInput.length ? 'bg-primary/20' : 'text-foreground/50';
    }
    
    const inputChar = userInput[index];
    const textChar = currentText[index];
    
    if (inputChar === textChar) {
      return 'text-green-500 bg-green-500/10';
    } else {
      return 'text-red-500 bg-red-500/10';
    }
  };

  // Canvas animation placeholder
  const startCanvasAnimation = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let frame = 0;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Simple animation - pulsing circle based on typing speed
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 20;
      const pulseRadius = baseRadius + Math.sin(frame * 0.1) * 10;
      
      // Color based on accuracy
      const accuracy = stats.accuracy / 100;
      const red = Math.floor((1 - accuracy) * 255);
      const green = Math.floor(accuracy * 255);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
      ctx.fill();
      
      // WPM text
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${stats.wpm} WPM`, centerX, centerY + 5);
      
      frame++;
      animationId = requestAnimationFrame(animate);
    };
    
    animationRef.current = animationId;
    animate();
  };

  const stopCanvasAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ProtoType Typing Game",
    "description": "PIXIjsを使用したタイピングゲーム",
    "url": "https://yusuke-kim.com/tools/ProtoType",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    },
    "codeRepository": "https://github.com/rebuildup/ProtoType"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              href="/tools" 
              className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80 flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Tools</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/rebuildup/ProtoType"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Github size={16} />
                <span className="noto-sans-jp text-sm">GitHub</span>
              </a>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Settings size={16} />
                <span className="noto-sans-jp text-sm">設定</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-12 px-4">
          <div className="flex justify-center mb-4">
            <Gamepad2 size={64} className="text-primary" />
          </div>
          <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
            ProtoType
          </h1>
          <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
            PIXIjsを使用したタイピングゲーム。<br />
            WPMと正確性を記録し、タイピングスキルの向上を支援。
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {/* Settings Panel */}
          {showSettings && (
            <section className="mb-8 border border-foreground/20 bg-gray/50 p-6">
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">ゲーム設定</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">難易度</label>
                  <select
                    value={settings.difficulty}
                    onChange={(e) => saveSettings({...settings, difficulty: e.target.value as any})}
                    className="w-full p-2 border border-foreground/20 bg-gray text-foreground"
                  >
                    <option value="easy">易しい</option>
                    <option value="medium">普通</option>
                    <option value="hard">難しい</option>
                  </select>
                </div>

                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">ゲームモード</label>
                  <select
                    value={settings.gameMode}
                    onChange={(e) => saveSettings({...settings, gameMode: e.target.value as any})}
                    className="w-full p-2 border border-foreground/20 bg-gray text-foreground"
                  >
                    <option value="practice">練習</option>
                    <option value="challenge">チャレンジ</option>
                    <option value="endurance">耐久</option>
                  </select>
                </div>

                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">テキストタイプ</label>
                  <select
                    value={settings.textType}
                    onChange={(e) => saveSettings({...settings, textType: e.target.value as any})}
                    className="w-full p-2 border border-foreground/20 bg-gray text-foreground"
                  >
                    <option value="words">単語</option>
                    <option value="sentences">文章</option>
                    <option value="code">コード</option>
                    <option value="custom">カスタム</option>
                  </select>
                </div>

                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    制限時間 ({settings.timeLimit}秒, 0=無制限)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="15"
                    value={settings.timeLimit}
                    onChange={(e) => saveSettings({...settings, timeLimit: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                {settings.textType === 'custom' && (
                  <div className="col-span-full">
                    <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">カスタムテキスト</label>
                    <textarea
                      value={settings.customText}
                      onChange={(e) => saveSettings({...settings, customText: e.target.value})}
                      placeholder="タイピング練習用のテキストを入力..."
                      className="w-full p-3 border border-foreground/20 bg-gray text-foreground resize-none h-24"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Game Area */}
            <div className="lg:col-span-2">
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">タイピングエリア</h3>
              
              {/* Canvas Animation */}
              <div className="mb-6 flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={200}
                  height={100}
                  className="border border-foreground/20 bg-gray/50"
                />
              </div>

              {/* Text Display */}
              <div className="mb-6 p-6 border border-foreground/20 bg-gray/50 font-mono text-lg leading-relaxed">
                {currentText.split('').map((char, index) => (
                  <span
                    key={index}
                    className={`${getCharacterClass(index)} ${
                      index === userInput.length ? 'animate-pulse' : ''
                    }`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>

              {/* Input */}
              <div className="mb-6">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={gameState !== 'playing'}
                  placeholder={gameState === 'idle' ? 'ゲームを開始してください' : 'ここに入力...'}
                  className="w-full p-4 border border-foreground/20 bg-gray text-foreground font-mono text-lg disabled:opacity-50 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap justify-center gap-4">
                {gameState === 'idle' && (
                  <button
                    onClick={startGame}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-gray hover:bg-primary/90 transition-colors"
                  >
                    <Play size={20} />
                    <span className="noto-sans-jp font-medium">ゲーム開始</span>
                  </button>
                )}
                
                {gameState === 'playing' && (
                  <button
                    onClick={resetGame}
                    className="flex items-center space-x-2 px-6 py-3 border border-red-500/30 text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Square size={20} />
                    <span className="noto-sans-jp font-medium">停止</span>
                  </button>
                )}
                
                {gameState === 'finished' && (
                  <button
                    onClick={resetGame}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-gray hover:bg-primary/90 transition-colors"
                  >
                    <RotateCcw size={20} />
                    <span className="noto-sans-jp font-medium">再挑戦</span>
                  </button>
                )}
                
                <button
                  onClick={generateNewText}
                  className="flex items-center space-x-2 px-4 py-3 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <RotateCcw size={16} />
                  <span className="noto-sans-jp text-sm">新しいテキスト</span>
                </button>
              </div>
            </div>

            {/* Stats & Info */}
            <div>
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">統計情報</h3>
              
              {/* Current Stats */}
              <div className="mb-6 border border-foreground/20 bg-gray/50 p-4">
                <h4 className="noto-sans-jp font-medium text-foreground mb-3">現在のスコア</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap size={16} className="text-primary" />
                      <span className="noto-sans-jp text-sm">WPM</span>
                    </div>
                    <span className="neue-haas-grotesk-display text-xl text-primary">{stats.wpm}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target size={16} className="text-green-500" />
                      <span className="noto-sans-jp text-sm">正確性</span>
                    </div>
                    <span className="text-green-500">{stats.accuracy}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-foreground/60" />
                      <span className="noto-sans-jp text-sm">経過時間</span>
                    </div>
                    <span className="text-foreground">{formatTime(stats.timeElapsed)}</span>
                  </div>
                  
                  {timeLeft !== null && (
                    <div className="flex items-center justify-between">
                      <span className="noto-sans-jp text-sm">残り時間</span>
                      <span className={`${timeLeft <= 10 ? 'text-red-500' : 'text-foreground'}`}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* High Scores */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <h4 className="flex items-center space-x-2 text-foreground mb-3">
                  <Trophy size={16} className="text-yellow-500" />
                  <span className="noto-sans-jp font-medium">ハイスコア</span>
                </h4>
                
                {highScores.length === 0 ? (
                  <p className="noto-sans-jp text-sm text-foreground/60">まだスコアがありません</p>
                ) : (
                  <div className="space-y-2">
                    {highScores.slice(0, 5).map((score, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-foreground/50">#{index + 1}</span>
                          <span className="text-primary font-mono">{score.wpm} WPM</span>
                          <span className="text-green-500">{score.accuracy}%</span>
                        </div>
                        <span className="noto-sans-jp text-foreground/50 text-xs">
                          {score.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Modal */}
          {showResults && gameState === 'finished' && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-gray border border-foreground/20 p-8 max-w-md w-full">
                <div className="text-center">
                  <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
                  <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-4">
                    ゲーム完了！
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="noto-sans-jp">WPM:</span>
                      <span className="neue-haas-grotesk-display text-xl text-primary">{stats.wpm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="noto-sans-jp">正確性:</span>
                      <span className="text-green-500">{stats.accuracy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="noto-sans-jp">正しい文字:</span>
                      <span className="text-foreground">{stats.correctCharacters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="noto-sans-jp">時間:</span>
                      <span className="text-foreground">{formatTime(stats.timeElapsed)}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={resetGame}
                      className="flex-1 px-4 py-2 bg-primary text-gray hover:bg-primary/90 transition-colors"
                    >
                      <span className="noto-sans-jp">再挑戦</span>
                    </button>
                    <button
                      onClick={() => setShowResults(false)}
                      className="flex-1 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="noto-sans-jp">閉じる</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}