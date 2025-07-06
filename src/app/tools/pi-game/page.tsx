'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  RotateCcw,
  Trophy,
  Target,
  Timer,
  TrendingUp,
  Volume2,
  VolumeX,
  Settings,
  Star,
  Award
} from "lucide-react";

const PI_DIGITS = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632788659361533818279682303019520353018529689957736225994138912497217752834791315155748572424541506959508295331168617278558890750983817546374649393192550604009277016711390098488240128583616035637076601047101819429555961989467678374494482553797747268471040475346462080466842590694912933136770289891521047521620569660240580381501935112533824300355876402474964732639141992726042699227967823547816360093417216412199245863150302861829745557067498385054945885869269956909272107975093029553211653449872027559602364806654991198818347977535663698074265425278625518184175746728909777727938000816470600161452491921732172147723501414419735685481613611573525521334757418494684385233239073941433345477624168625189835694855620992192221842725502542568876717904946016746097659798123051176632132237491632245673066255570824395624454098498901444966223113827522440445862618722984901010414669131120020"

interface GameStats {
  currentDigit: number;
  correctDigits: number;
  consecutiveCorrect: number;
  maxConsecutive: number;
  accuracy: number;
  startTime: number | null;
  endTime: number | null;
  mistakes: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
}

interface HighScore {
  level: string;
  score: number;
  accuracy: number;
  date: string;
}

const difficultyLevels = [
  { id: 'beginner', name: '初級', digits: 10, description: '小数点以下10桁まで' },
  { id: 'intermediate', name: '中級', digits: 50, description: '小数点以下50桁まで' },
  { id: 'advanced', name: '上級', digits: 100, description: '小数点以下100桁まで' },
  { id: 'master', name: 'マスター', digits: 1000, description: '小数点以下1000桁まで' },
];

export default function PiGamePage() {
  const [gameStats, setGameStats] = useState<GameStats>({
    currentDigit: 0,
    correctDigits: 0,
    consecutiveCorrect: 0,
    maxConsecutive: 0,
    accuracy: 100,
    startTime: null,
    endTime: null,
    mistakes: 0,
    level: 'beginner'
  });

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished' | 'paused'>('ready');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    showProgress: true,
    vibrationEnabled: true
  });

  const currentLevel = difficultyLevels.find(level => level.id === gameStats.level);
  const targetDigits = currentLevel?.digits || 10;
  const currentDigitValue = PI_DIGITS[gameStats.currentDigit];
  const progress = (gameStats.correctDigits / (targetDigits + 1)) * 100;

  useEffect(() => {
    // Load high scores from localStorage
    const savedScores = localStorage.getItem('pi-game-scores');
    if (savedScores) {
      setHighScores(JSON.parse(savedScores));
    }
  }, []);

  const playSound = useCallback((type: 'correct' | 'wrong' | 'complete') => {
    if (!soundEnabled) return;
    
    // Create audio context for web audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    } else if (type === 'wrong') {
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    } else {
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [soundEnabled]);

  const startGame = () => {
    setGameStats({
      currentDigit: 0,
      correctDigits: 0,
      consecutiveCorrect: 0,
      maxConsecutive: 0,
      accuracy: 100,
      startTime: Date.now(),
      endTime: null,
      mistakes: 0,
      level: gameStats.level
    });
    setGameState('playing');
  };

  const resetGame = () => {
    setGameState('ready');
    setGameStats(prev => ({
      ...prev,
      currentDigit: 0,
      correctDigits: 0,
      consecutiveCorrect: 0,
      startTime: null,
      endTime: null,
      mistakes: 0
    }));
  };

  const handleDigitInput = (digit: string) => {
    if (gameState !== 'playing') return;
    
    const expectedDigit = PI_DIGITS[gameStats.currentDigit];
    const isCorrect = digit === expectedDigit;
    
    if (isCorrect) {
      playSound('correct');
      const newCorrectDigits = gameStats.correctDigits + 1;
      const newConsecutive = gameStats.consecutiveCorrect + 1;
      const newMaxConsecutive = Math.max(gameStats.maxConsecutive, newConsecutive);
      
      setGameStats(prev => ({
        ...prev,
        currentDigit: prev.currentDigit + 1,
        correctDigits: newCorrectDigits,
        consecutiveCorrect: newConsecutive,
        maxConsecutive: newMaxConsecutive,
        accuracy: ((newCorrectDigits / (newCorrectDigits + prev.mistakes)) * 100)
      }));
      
      // Check if game is complete
      if (gameStats.currentDigit + 1 >= targetDigits + 1) {
        completeGame();
      }
    } else {
      playSound('wrong');
      setGameStats(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        consecutiveCorrect: 0,
        accuracy: ((prev.correctDigits / (prev.correctDigits + prev.mistakes + 1)) * 100)
      }));
      
      // Reset game on mistake
      setTimeout(() => {
        resetGame();
      }, 1000);
    }
  };

  const completeGame = () => {
    const endTime = Date.now();
    playSound('complete');
    
    setGameStats(prev => ({ ...prev, endTime }));
    setGameState('finished');
    
    // Save high score
    const newScore: HighScore = {
      level: gameStats.level,
      score: gameStats.correctDigits,
      accuracy: gameStats.accuracy,
      date: new Date().toISOString()
    };
    
    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    setHighScores(updatedScores);
    localStorage.setItem('pi-game-scores', JSON.stringify(updatedScores));
  };

  const formatTime = (startTime: number, endTime?: number) => {
    const duration = (endTime || Date.now()) - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState === 'playing' && /^[0-9]$/.test(event.key)) {
      handleDigitInput(event.key);
    } else if (event.key === 'Enter' && gameState === 'ready') {
      startGame();
    } else if (event.key === 'Escape') {
      resetGame();
    }
  }, [gameState]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pi Game",
    "description": "円周率を順番に押し続ける暗記ゲーム",
    "url": "https://yusuke-kim.com/tools/pi-game",
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
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray text-foreground">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              href="/tools" 
              className="flex items-center space-x-2 neue-haas-grotesk-display text-lg text-primary hover:text-primary/80"
            >
              <ArrowLeft size={20} />
              <span>Tools</span>
            </Link>
            
            <h1 className="neue-haas-grotesk-display text-xl text-foreground">
              Pi Game - 円周率暗記ゲーム
            </h1>
          </div>
        </nav>

        <div className="max-w-6xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Game Header */}
              <div className="border border-foreground/20 bg-gray/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                      π = 3.{PI_DIGITS.slice(2, Math.min(22, PI_DIGITS.length))}...
                    </h2>
                    <p className="noto-sans-jp text-sm text-foreground/70">
                      現在のレベル: {currentLevel?.name} ({currentLevel?.description})
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-2 border border-foreground/20 hover:bg-foreground/10"
                    >
                      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                    
                    <button
                      onClick={resetGame}
                      className="flex items-center space-x-1 px-3 py-2 border border-primary text-primary hover:bg-primary/10"
                    >
                      <RotateCcw size={16} />
                      <span>リセット</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="noto-sans-jp text-sm text-foreground/70">進捗</span>
                    <span className="noto-sans-jp text-sm text-foreground/70">
                      {gameStats.correctDigits} / {targetDigits + 1}
                    </span>
                  </div>
                  <div className="w-full bg-foreground/20 h-2">
                    <div
                      className="bg-primary h-2 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Current Digit Display */}
                <div className="text-center mb-6">
                  {gameState === 'ready' ? (
                    <div>
                      <p className="noto-sans-jp text-lg text-foreground/70 mb-4">
                        スタートボタンを押してゲームを開始
                      </p>
                      <button
                        onClick={startGame}
                        className="px-8 py-3 bg-primary text-white neue-haas-grotesk-display text-lg hover:bg-primary/90"
                      >
                        ゲーム開始
                      </button>
                    </div>
                  ) : gameState === 'playing' ? (
                    <div>
                      <p className="noto-sans-jp text-sm text-foreground/70 mb-2">
                        次の数字を入力してください
                      </p>
                      <div className="neue-haas-grotesk-display text-6xl text-primary mb-2">
                        {currentDigitValue}
                      </div>
                      <p className="noto-sans-jp text-sm text-foreground/60">
                        位置: {gameStats.currentDigit + 1} 桁目
                      </p>
                    </div>
                  ) : gameState === 'finished' ? (
                    <div>
                      <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
                      <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-2">
                        ゲーム完了！
                      </h3>
                      <p className="noto-sans-jp text-foreground/70 mb-4">
                        {gameStats.correctDigits} 桁正解 - 正解率 {gameStats.accuracy.toFixed(1)}%
                      </p>
                      <button
                        onClick={startGame}
                        className="px-6 py-2 bg-primary text-white neue-haas-grotesk-display hover:bg-primary/90 mr-2"
                      >
                        再挑戦
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Numpad */}
              <div className="border border-foreground/20 bg-gray/50 p-6">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 text-center">
                  テンキー
                </h3>
                
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleDigitInput(digit.toString())}
                      disabled={gameState !== 'playing'}
                      className="aspect-square border-2 border-foreground/20 bg-gray text-foreground neue-haas-grotesk-display text-2xl hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    onClick={() => handleDigitInput('0')}
                    disabled={gameState !== 'playing'}
                    className="col-start-2 aspect-square border-2 border-foreground/20 bg-gray text-foreground neue-haas-grotesk-display text-2xl hover:border-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    0
                  </button>
                </div>
                
                <p className="noto-sans-jp text-sm text-foreground/60 text-center mt-4">
                  キーボードの数字キーでも入力できます
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center">
                  <Target size={20} className="mr-2" />
                  統計
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="noto-sans-jp text-sm text-foreground/70">正解数</span>
                    <span className="neue-haas-grotesk-display text-primary">{gameStats.correctDigits}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="noto-sans-jp text-sm text-foreground/70">連続正解</span>
                    <span className="neue-haas-grotesk-display text-primary">{gameStats.consecutiveCorrect}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="noto-sans-jp text-sm text-foreground/70">最大連続</span>
                    <span className="neue-haas-grotesk-display text-primary">{gameStats.maxConsecutive}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="noto-sans-jp text-sm text-foreground/70">正解率</span>
                    <span className="neue-haas-grotesk-display text-primary">{gameStats.accuracy.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="noto-sans-jp text-sm text-foreground/70">経過時間</span>
                    <span className="neue-haas-grotesk-display text-primary">
                      {gameStats.startTime ? formatTime(gameStats.startTime, gameStats.endTime) : '0:00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Level Selection */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center">
                  <TrendingUp size={20} className="mr-2" />
                  難易度
                </h3>
                
                <div className="space-y-2">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setGameStats(prev => ({ ...prev, level: level.id as any }))}
                      disabled={gameState === 'playing'}
                      className={`w-full text-left p-3 border transition-colors disabled:opacity-50 ${
                        gameStats.level === level.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-foreground/20 hover:border-primary/50'
                      }`}
                    >
                      <div className="neue-haas-grotesk-display text-sm mb-1">{level.name}</div>
                      <div className="noto-sans-jp text-xs text-foreground/70">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* High Scores */}
              <div className="border border-foreground/20 bg-gray/50 p-4">
                <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-4 flex items-center">
                  <Award size={20} className="mr-2" />
                  ハイスコア
                </h3>
                
                {highScores.length === 0 ? (
                  <p className="noto-sans-jp text-sm text-foreground/60 text-center py-4">
                    まだスコアがありません
                  </p>
                ) : (
                  <div className="space-y-2">
                    {highScores.slice(0, 5).map((score, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border border-foreground/10 bg-gray/30"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="neue-haas-grotesk-display text-sm text-primary">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="noto-sans-jp text-xs text-foreground/70">
                              {score.level}
                            </div>
                            <div className="neue-haas-grotesk-display text-sm">
                              {score.score} 桁
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="noto-sans-jp text-xs text-foreground/70">
                            {score.accuracy.toFixed(1)}%
                          </div>
                          <div className="noto-sans-jp text-xs text-foreground/50">
                            {new Date(score.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}