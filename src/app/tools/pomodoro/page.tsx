'use client';

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Settings, 
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Coffee,
  Target
} from "lucide-react";

interface PomodoroSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  enableNotifications: boolean;
  enableSound: boolean;
  volume: number; // 0-100
  soundType: 'bell' | 'chime' | 'beep';
}

interface PomodoroState {
  timeLeft: number; // in seconds
  isRunning: boolean;
  currentPhase: 'work' | 'shortBreak' | 'longBreak';
  completedSessions: number;
  totalSessionsToday: number;
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  enableNotifications: true,
  enableSound: true,
  volume: 50,
  soundType: 'bell'
};

const initialState: PomodoroState = {
  timeLeft: 25 * 60, // 25 minutes in seconds
  isRunning: false,
  currentPhase: 'work',
  completedSessions: 0,
  totalSessionsToday: 0
};

const phaseColors = {
  work: 'text-red-500',
  shortBreak: 'text-green-500',
  longBreak: 'text-blue-500'
};

const phaseNames = {
  work: '作業時間',
  shortBreak: '短い休憩',
  longBreak: '長い休憩'
};

export default function PomodoroPage() {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [state, setState] = useState<PomodoroState>(initialState);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    loadSettings();
    loadTodayStats();
    
    // Request notification permission
    if ('Notification' in window && settings.enableNotifications) {
      Notification.requestPermission();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(prevState => {
          const newTimeLeft = prevState.timeLeft - 1;
          
          if (newTimeLeft <= 0) {
            handlePhaseComplete();
            return prevState;
          }
          
          return { ...prevState, timeLeft: newTimeLeft };
        });
      }, 1000);
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
  }, [state.isRunning]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('pomodoro-settings');
      if (saved) {
        setSettings({...defaultSettings, ...JSON.parse(saved)});
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadTodayStats = () => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`pomodoro-stats-${today}`);
      if (saved) {
        const stats = JSON.parse(saved);
        setState(prev => ({ ...prev, totalSessionsToday: stats.totalSessions || 0 }));
      }
    } catch (error) {
      console.error('Failed to load today stats:', error);
    }
  };

  const saveTodayStats = (completedSessions: number) => {
    try {
      const today = new Date().toDateString();
      const stats = { totalSessions: completedSessions };
      localStorage.setItem(`pomodoro-stats-${today}`, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save today stats:', error);
    }
  };

  const playNotificationSound = useCallback(() => {
    if (!settings.enableSound) return;

    try {
      // Create AudioContext if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds based on settings
      const frequencies = {
        bell: [800, 600, 400],
        chime: [523, 659, 784],
        beep: [1000, 1000, 1000]
      };

      const freqSequence = frequencies[settings.soundType];
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(settings.volume / 100 * 0.3, audioContext.currentTime + 0.01);

      freqSequence.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.3);
        gain.gain.setValueAtTime(0, audioContext.currentTime + index * 0.3);
        gain.gain.linearRampToValueAtTime(settings.volume / 100 * 0.2, audioContext.currentTime + index * 0.3 + 0.01);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + index * 0.3 + 0.2);
        
        osc.start(audioContext.currentTime + index * 0.3);
        osc.stop(audioContext.currentTime + index * 0.3 + 0.2);
      });

    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  }, [settings.enableSound, settings.volume, settings.soundType]);

  const showNotification = (title: string, body: string) => {
    if (!settings.enableNotifications || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const handlePhaseComplete = () => {
    setState(prevState => {
      let newPhase: 'work' | 'shortBreak' | 'longBreak';
      let newTimeLeft: number;
      let newCompletedSessions = prevState.completedSessions;
      let newTotalSessionsToday = prevState.totalSessionsToday;

      if (prevState.currentPhase === 'work') {
        newCompletedSessions++;
        newTotalSessionsToday++;
        
        // Determine next break type
        if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
          newPhase = 'longBreak';
          newTimeLeft = settings.longBreakDuration * 60;
          showNotification('作業完了！', '長い休憩時間です');
        } else {
          newPhase = 'shortBreak';
          newTimeLeft = settings.shortBreakDuration * 60;
          showNotification('作業完了！', '短い休憩時間です');
        }
      } else {
        newPhase = 'work';
        newTimeLeft = settings.workDuration * 60;
        showNotification('休憩完了！', '作業時間を開始しましょう');
      }

      playNotificationSound();
      saveTodayStats(newTotalSessionsToday);

      // Auto-start next phase if enabled
      const shouldAutoStart = 
        (newPhase === 'work' && settings.autoStartWork) ||
        (newPhase !== 'work' && settings.autoStartBreaks);

      return {
        ...prevState,
        currentPhase: newPhase,
        timeLeft: newTimeLeft,
        completedSessions: newCompletedSessions,
        totalSessionsToday: newTotalSessionsToday,
        isRunning: shouldAutoStart
      };
    });
  };

  const startTimer = () => {
    setState(prev => ({ ...prev, isRunning: true }));
  };

  const pauseTimer = () => {
    setState(prev => ({ ...prev, isRunning: false }));
  };

  const stopTimer = () => {
    setState(prev => ({ 
      ...prev, 
      isRunning: false, 
      timeLeft: getDurationForPhase(prev.currentPhase) * 60 
    }));
  };

  const skipPhase = () => {
    handlePhaseComplete();
  };

  const resetSession = () => {
    setState({
      ...initialState,
      timeLeft: settings.workDuration * 60,
      totalSessionsToday: state.totalSessionsToday
    });
  };

  const getDurationForPhase = (phase: 'work' | 'shortBreak' | 'longBreak'): number => {
    switch (phase) {
      case 'work': return settings.workDuration;
      case 'shortBreak': return settings.shortBreakDuration;
      case 'longBreak': return settings.longBreakDuration;
      default: return settings.workDuration;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalDuration = getDurationForPhase(state.currentPhase) * 60;
    return ((totalDuration - state.timeLeft) / totalDuration) * 100;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pomodoro Timer",
    "description": "シンプルなポモドーロタイマー",
    "url": "https://yusuke-kim.com/tools/pomodoro",
    "applicationCategory": "ProductivityApplication",
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
            <Timer size={64} className="text-primary" />
          </div>
          <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
            Pomodoro Timer
          </h1>
          <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
            シンプルなポモドーロタイマー。<br />
            25分作業・5分休憩のサイクルで効率的な作業時間管理を実現。
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 pb-16">
          {/* Settings Panel */}
          {showSettings && (
            <section className="mb-8 border border-foreground/20 bg-gray/50 p-6">
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">タイマー設定</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Time Settings */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    作業時間 ({settings.workDuration}分)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    value={settings.workDuration}
                    onChange={(e) => saveSettings({...settings, workDuration: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    短い休憩 ({settings.shortBreakDuration}分)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.shortBreakDuration}
                    onChange={(e) => saveSettings({...settings, shortBreakDuration: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    長い休憩 ({settings.longBreakDuration}分)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={settings.longBreakDuration}
                    onChange={(e) => saveSettings({...settings, longBreakDuration: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">
                    長い休憩までのセット数 ({settings.sessionsUntilLongBreak})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.sessionsUntilLongBreak}
                    onChange={(e) => saveSettings({...settings, sessionsUntilLongBreak: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                {/* Sound Settings */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">音量 ({settings.volume}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => saveSettings({...settings, volume: Number(e.target.value)})}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">通知音</label>
                  <select
                    value={settings.soundType}
                    onChange={(e) => saveSettings({...settings, soundType: e.target.value as any})}
                    className="w-full p-2 border border-foreground/20 bg-gray text-foreground"
                  >
                    <option value="bell">ベル</option>
                    <option value="chime">チャイム</option>
                    <option value="beep">ビープ</option>
                  </select>
                </div>

                {/* Feature Toggles */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => saveSettings({...settings, autoStartBreaks: e.target.checked})}
                      className="rounded border-foreground/20"
                    />
                    <span className="noto-sans-jp text-sm text-foreground">休憩自動開始</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.autoStartWork}
                      onChange={(e) => saveSettings({...settings, autoStartWork: e.target.checked})}
                      className="rounded border-foreground/20"
                    />
                    <span className="noto-sans-jp text-sm text-foreground">作業自動開始</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => saveSettings({...settings, enableNotifications: e.target.checked})}
                      className="rounded border-foreground/20"
                    />
                    <span className="noto-sans-jp text-sm text-foreground">通知表示</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.enableSound}
                      onChange={(e) => saveSettings({...settings, enableSound: e.target.checked})}
                      className="rounded border-foreground/20"
                    />
                    <span className="noto-sans-jp text-sm text-foreground">効果音</span>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* Timer Display */}
          <section className="mb-8">
            <div className="text-center">
              {/* Phase Indicator */}
              <div className="mb-6">
                <div className={`inline-flex items-center space-x-2 px-4 py-2 border ${
                  state.currentPhase === 'work' ? 'border-red-500/30 bg-red-500/10' :
                  state.currentPhase === 'shortBreak' ? 'border-green-500/30 bg-green-500/10' :
                  'border-blue-500/30 bg-blue-500/10'
                }`}>
                  {state.currentPhase === 'work' ? <Target size={20} /> : <Coffee size={20} />}
                  <span className={`noto-sans-jp font-medium ${phaseColors[state.currentPhase]}`}>
                    {phaseNames[state.currentPhase]}
                  </span>
                </div>
              </div>

              {/* Time Display */}
              <div className="mb-8">
                <div className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-4">
                  {formatTime(state.timeLeft)}
                </div>
                
                {/* Progress Bar */}
                <div className="max-w-md mx-auto mb-4">
                  <div className="w-full bg-gray/50 border border-foreground/20 h-2">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        state.currentPhase === 'work' ? 'bg-red-500' :
                        state.currentPhase === 'shortBreak' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${getProgress()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4 mb-8">
                {!state.isRunning ? (
                  <button
                    onClick={startTimer}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-gray hover:bg-primary/90 transition-colors"
                  >
                    <Play size={20} />
                    <span className="noto-sans-jp font-medium">開始</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseTimer}
                    className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-gray hover:bg-yellow-600 transition-colors"
                  >
                    <Pause size={20} />
                    <span className="noto-sans-jp font-medium">一時停止</span>
                  </button>
                )}
                
                <button
                  onClick={stopTimer}
                  className="flex items-center space-x-2 px-6 py-3 border border-foreground/20 text-foreground hover:border-red-500 hover:text-red-500 transition-colors"
                >
                  <Square size={20} />
                  <span className="noto-sans-jp font-medium">停止</span>
                </button>
                
                <button
                  onClick={skipPhase}
                  className="flex items-center space-x-2 px-4 py-3 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <SkipForward size={20} />
                  <span className="noto-sans-jp text-sm">スキップ</span>
                </button>
              </div>

              {/* Additional Controls */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetSession}
                  className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <RotateCcw size={16} />
                  <span className="noto-sans-jp text-sm">リセット</span>
                </button>
                
                <button
                  onClick={playNotificationSound}
                  className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  {settings.enableSound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span className="noto-sans-jp text-sm">音声テスト</span>
                </button>
              </div>
            </div>
          </section>

          {/* Statistics */}
          <section>
            <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4 text-center">統計情報</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {state.completedSessions}
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  完了セット
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {state.totalSessionsToday}
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  今日の総セット
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {Math.floor(state.completedSessions / settings.sessionsUntilLongBreak)}
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  長い休憩回数
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {state.totalSessionsToday * settings.workDuration}
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  今日の作業時間(分)
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}