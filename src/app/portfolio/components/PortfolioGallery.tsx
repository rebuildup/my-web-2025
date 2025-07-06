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
      technologies: ['React', 'TypeScript', 'Tailwind CSS']
    },
    {
      id: '2',
      title: '3D Interactive Experience',
      description: 'Immersive 3D environment built with Three.js',
      category: '3d',
      image: '/placeholder-project.jpg',
      technologies: ['Three.js', 'WebGL', 'JavaScript']
    },
    {
      id: '3',
      title: 'Mobile App Design',
      description: 'Clean and intuitive mobile interface design',
      category: 'design',
      image: '/placeholder-project.jpg',
      technologies: ['Figma', 'Sketch', 'Principle']
    }
  ];

  const categories = ['all', 'web', '3d', 'design'];

  const filteredItems = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        Portfolio Gallery
      </h2>
      
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-none text-sm font-medium transition-colors ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-gray-700 rounded-none overflow-hidden">
            <div className="w-full h-48 bg-gray-600 flex items-center justify-center">
              <div className="text-gray-400 text-center">
                <div className="w-16 h-16 bg-gray-500 mx-auto mb-2 rounded-none"></div>
                <p className="text-sm">Project Image</p>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-400">{item.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{item.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {item.technologies.map(tech => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-none"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-none transition-colors">
                  View
                </button>
                <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-none transition-colors">
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