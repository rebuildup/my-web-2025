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
      lines,
    };
  }, [text]);

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Text Counter
      </h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Enter your text:</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="h-64 w-full resize-none rounded-none border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="rounded-none bg-gray-700 p-4">
          <h3 className="mb-4 text-lg font-semibold text-blue-400">Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Characters:</span>
              <span className="font-mono text-white">{stats.characters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Characters (no spaces):</span>
              <span className="font-mono text-white">{stats.charactersNoSpaces}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Words:</span>
              <span className="font-mono text-white">{stats.words}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Paragraphs:</span>
              <span className="font-mono text-white">{stats.paragraphs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Lines:</span>
              <span className="font-mono text-white">{stats.lines}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCounter;
