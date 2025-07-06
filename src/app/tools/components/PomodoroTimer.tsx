import React, { useState, useEffect } from 'react';

const PomodoroTimer: React.FC = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      // Switch between work and break modes
      if (mode === 'work') {
        setMode('break');
        setTime(5 * 60); // 5 minute break
      } else {
        setMode('work');
        setTime(25 * 60); // 25 minute work
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, time, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTime(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        Pomodoro Timer
      </h2>
      <div className="text-center">
        <div className="bg-gray-700 p-8 rounded-none mb-6">
          <div className={`text-sm font-medium mb-2 ${mode === 'work' ? 'text-blue-400' : 'text-green-400'}`}>
            {mode === 'work' ? 'WORK SESSION' : 'BREAK TIME'}
          </div>
          <div className="text-6xl font-mono font-bold mb-4">
            {formatTime(time)}
          </div>
          <div className="w-full bg-gray-600 h-2 rounded-none">
            <div 
              className={`h-2 rounded-none transition-all duration-1000 ${
                mode === 'work' ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${((mode === 'work' ? 25 * 60 : 5 * 60) - time) / (mode === 'work' ? 25 * 60 : 5 * 60) * 100}%` 
              }}
            />
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={isRunning ? handlePause : handleStart}
            className={`px-6 py-2 rounded-none font-medium transition-colors ${
              isRunning 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-black' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-none font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;