import React, { useState } from 'react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  downloads: number;
  rating: number;
  tags: string[];
  isInstalled: boolean;
}

const PluginList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: '1',
      name: 'Code Formatter Plus',
      description: 'Advanced code formatting with customizable rules and support for multiple languages.',
      category: 'development',
      version: '2.1.0',
      downloads: 15420,
      rating: 4.8,
      tags: ['formatting', 'productivity', 'code quality'],
      isInstalled: false
    },
    {
      id: '2',
      name: 'Theme Designer',
      description: 'Create and customize beautiful themes for your applications with real-time preview.',
      category: 'design',
      version: '1.5.2',
      downloads: 8935,
      rating: 4.6,
      tags: ['themes', 'design', 'customization'],
      isInstalled: true
    },
    {
      id: '3',
      name: 'Performance Monitor',
      description: 'Real-time performance monitoring and optimization suggestions for web applications.',
      category: 'performance',
      version: '3.0.1',
      downloads: 12500,
      rating: 4.9,
      tags: ['monitoring', 'performance', 'optimization'],
      isInstalled: false
    }
  ]);

  const categories = ['all', 'development', 'design', 'performance'];

  const filteredPlugins = selectedCategory === 'all' 
    ? plugins 
    : plugins.filter(plugin => plugin.category === selectedCategory);

  const handleInstall = (pluginId: string) => {
    setPlugins(plugins.map(plugin => 
      plugin.id === pluginId 
        ? { ...plugin, isInstalled: !plugin.isInstalled }
        : plugin
    ));
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-none">
      <h2 className="text-blue-500 text-xl font-bold mb-4 neue-haas-grotesk-display">
        Plugin Library
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

      {/* Plugin grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlugins.map(plugin => (
          <div key={plugin.id} className="bg-gray-700 p-6 rounded-none">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-400">{plugin.name}</h3>
              <span className="text-xs text-gray-400">v{plugin.version}</span>
            </div>
            
            <p className="text-gray-300 text-sm mb-4">{plugin.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span>{plugin.rating}</span>
              </div>
              <span>{formatDownloads(plugin.downloads)} downloads</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {plugin.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-none"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleInstall(plugin.id)}
                className={`flex-1 py-2 px-4 rounded-none text-sm font-medium transition-colors ${
                  plugin.isInstalled
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {plugin.isInstalled ? 'Installed' : 'Install'}
              </button>
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-none transition-colors">
                Info
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PluginList;