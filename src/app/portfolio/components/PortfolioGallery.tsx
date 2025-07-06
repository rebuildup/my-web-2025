import React, { useState } from 'react';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  technologies: string[];
}

const PortfolioGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const portfolioItems: PortfolioItem[] = [
    {
      id: '1',
      title: 'Web Application Dashboard',
      description: 'Modern responsive dashboard with real-time data visualization',
      category: 'web',
      image: '/placeholder-project.jpg',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    },
    {
      id: '2',
      title: '3D Interactive Experience',
      description: 'Immersive 3D environment built with Three.js',
      category: '3d',
      image: '/placeholder-project.jpg',
      technologies: ['Three.js', 'WebGL', 'JavaScript'],
    },
    {
      id: '3',
      title: 'Mobile App Design',
      description: 'Clean and intuitive mobile interface design',
      category: 'design',
      image: '/placeholder-project.jpg',
      technologies: ['Figma', 'Sketch', 'Principle'],
    },
  ];

  const categories = ['all', 'web', '3d', 'design'];

  const filteredItems =
    selectedCategory === 'all'
      ? portfolioItems
      : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Portfolio Gallery
      </h2>

      {/* Filter buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-none px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Portfolio grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map(item => (
          <div key={item.id} className="overflow-hidden rounded-none bg-gray-700">
            <div className="flex h-48 w-full items-center justify-center bg-gray-600">
              <div className="text-center text-gray-400">
                <div className="mx-auto mb-2 h-16 w-16 rounded-none bg-gray-500"></div>
                <p className="text-sm">Project Image</p>
              </div>
            </div>
            <div className="p-4">
              <h3 className="mb-2 text-lg font-semibold text-blue-400">{item.title}</h3>
              <p className="mb-3 text-sm text-gray-300">{item.description}</p>
              <div className="mb-3 flex flex-wrap gap-1">
                {item.technologies.map(tech => (
                  <span
                    key={tech}
                    className="rounded-none bg-gray-600 px-2 py-1 text-xs text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="rounded-none bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600">
                  View
                </button>
                <button className="rounded-none bg-gray-600 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700">
                  Code
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioGallery;
