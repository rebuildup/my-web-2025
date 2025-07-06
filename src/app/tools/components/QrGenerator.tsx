import React, { useState } from 'react';

const QrGenerator: React.FC = () => {
  const [text, setText] = useState('');

  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        QR Code Generator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter text or URL:
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to generate QR code"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-none transition-colors">
            Generate QR Code
          </button>
        </div>
        <div className="bg-gray-700 p-4 rounded-none">
          <div className="w-full h-48 bg-gray-600 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="w-16 h-16 bg-gray-500 mx-auto mb-2"></div>
              <p className="text-sm">QR Code will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QrGenerator;