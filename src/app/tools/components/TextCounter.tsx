import React, { useState, useMemo } from 'react';

const TextCounter: React.FC = () => {
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).length : 0;
    const lines = text.split('\n').length;

    return {
      characters,
      charactersNoSpaces,
      words,
      paragraphs,
      lines
    };
  }, [text]);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        Text Counter
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter your text:
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-64 px-3 py-2 bg-gray-700 border border-gray-600 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div className="bg-gray-700 p-4 rounded-none">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Characters:</span>
              <span className="text-white font-mono">{stats.characters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Characters (no spaces):</span>
              <span className="text-white font-mono">{stats.charactersNoSpaces}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Words:</span>
              <span className="text-white font-mono">{stats.words}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Paragraphs:</span>
              <span className="text-white font-mono">{stats.paragraphs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Lines:</span>
              <span className="text-white font-mono">{stats.lines}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCounter;