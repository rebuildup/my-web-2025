import React, { useState } from 'react';

const QrGenerator: React.FC = () => {
  const [text, setText] = useState('');

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        QR Code Generator
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Enter text or URL:
            </label>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Enter text to generate QR code"
              className="w-full rounded-none border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button className="w-full rounded-none bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600">
            Generate QR Code
          </button>
        </div>
        <div className="rounded-none bg-gray-700 p-4">
          <div className="flex h-48 w-full items-center justify-center bg-gray-600">
            <div className="text-center text-gray-400">
              <div className="mx-auto mb-2 h-16 w-16 bg-gray-500"></div>
              <p className="text-sm">QR Code will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;
