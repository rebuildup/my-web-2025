import React from 'react';

const ColorPalette: React.FC = () => {
  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Color Palette Generator
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-none bg-gray-700 p-4">
          <div className="mb-2 h-16 w-full bg-blue-500"></div>
          <p className="text-sm text-gray-300">#0000FF</p>
        </div>
        <div className="rounded-none bg-gray-700 p-4">
          <div className="mb-2 h-16 w-full bg-gray-600"></div>
          <p className="text-sm text-gray-300">#4B5563</p>
        </div>
        <div className="rounded-none bg-gray-700 p-4">
          <div className="mb-2 h-16 w-full bg-gray-900"></div>
          <p className="text-sm text-gray-300">#111827</p>
        </div>
      </div>
      <div className="mt-4 rounded-none bg-gray-700 p-4">
        <p className="text-sm text-gray-300">
          Color palette generation tool - Generate harmonious color schemes for your projects
        </p>
      </div>
    </div>
  );
};

export default ColorPalette;
