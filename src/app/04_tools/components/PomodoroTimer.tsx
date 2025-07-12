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
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Pomodoro Timer
      </h2>
      <div className="text-center">
        <div className="mb-6 rounded-none bg-gray-700 p-8">
          <div
            className={`mb-2 text-sm font-medium ${mode === 'work' ? 'text-blue-400' : 'text-green-400'}`}
          >
            {mode === 'work' ? 'WORK SESSION' : 'BREAK TIME'}
          </div>
          <div className="mb-4 font-mono text-6xl font-bold">{formatTime(time)}</div>
          <div className="h-2 w-full rounded-none bg-gray-600">
            <div
              className={`h-2 rounded-none transition-all duration-1000 ${
                mode === 'work' ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{
                width: `${(((mode === 'work' ? 25 * 60 : 5 * 60) - time) / (mode === 'work' ? 25 * 60 : 5 * 60)) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={isRunning ? handlePause : handleStart}
            className={`rounded-none px-6 py-2 font-medium transition-colors ${
              isRunning
                ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="rounded-none bg-gray-600 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
