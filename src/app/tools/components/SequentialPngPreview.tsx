import React from 'react';

const SequentialPngPreview: React.FC = () => {
  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Sequential PNG Preview
      </h2>
      <div className="rounded-none bg-gray-700 p-4">
        <p className="text-sm text-gray-300">
          Sequential PNG animation preview - Coming soon with file upload support
        </p>
      </div>
    </div>
  );
};

export default SequentialPngPreview;