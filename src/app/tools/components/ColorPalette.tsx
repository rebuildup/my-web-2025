import React from 'react';

const ColorPalette: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        Color Palette Generator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded-none">
          <div className="w-full h-16 bg-blue-500 mb-2"></div>
          <p className="text-sm text-gray-300">#0000FF</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-none">
          <div className="w-full h-16 bg-gray-600 mb-2"></div>
          <p className="text-sm text-gray-300">#4B5563</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-none">
          <div className="w-full h-16 bg-gray-900 mb-2"></div>
          <p className="text-sm text-gray-300">#111827</p>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-700 rounded-none">
        <p className="text-gray-300 text-sm">
          Color palette generation tool - Generate harmonious color schemes for your projects
        </p>
      </div>
    </div>
  );
};

export default ColorPalette;