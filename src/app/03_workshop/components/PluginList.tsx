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
      description:
        'Advanced code formatting with customizable rules and support for multiple languages.',
      category: 'development',
      version: '2.1.0',
      downloads: 15420,
      rating: 4.8,
      tags: ['formatting', 'productivity', 'code quality'],
      isInstalled: false,
    },
    {
      id: '2',
      name: 'Theme Designer',
      description:
        'Create and customize beautiful themes for your applications with real-time preview.',
      category: 'design',
      version: '1.5.2',
      downloads: 8935,
      rating: 4.6,
      tags: ['themes', 'design', 'customization'],
      isInstalled: true,
    },
    {
      id: '3',
      name: 'Performance Monitor',
      description:
        'Real-time performance monitoring and optimization suggestions for web applications.',
      category: 'performance',
      version: '3.0.1',
      downloads: 12500,
      rating: 4.9,
      tags: ['monitoring', 'performance', 'optimization'],
      isInstalled: false,
    },
  ]);

  const categories = ['all', 'development', 'design', 'performance'];

  const filteredPlugins =
    selectedCategory === 'all'
      ? plugins
      : plugins.filter(plugin => plugin.category === selectedCategory);

  const handleInstall = (pluginId: string) => {
    setPlugins(
      plugins.map(plugin =>
        plugin.id === pluginId ? { ...plugin, isInstalled: !plugin.isInstalled } : plugin
      )
    );
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Plugin Library
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

      {/* Plugin grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlugins.map(plugin => (
          <div key={plugin.id} className="rounded-none bg-gray-700 p-6">
            <div className="mb-3 flex items-start justify-between">
              <h3 className="text-lg font-semibold text-blue-400">{plugin.name}</h3>
              <span className="text-xs text-gray-400">v{plugin.version}</span>
            </div>

            <p className="mb-4 text-sm text-gray-300">{plugin.description}</p>

            <div className="mb-3 flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                <span>{plugin.rating}</span>
              </div>
              <span>{formatDownloads(plugin.downloads)} downloads</span>
            </div>

            <div className="mb-4 flex flex-wrap gap-1">
              {plugin.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-none bg-gray-600 px-2 py-1 text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleInstall(plugin.id)}
                className={`flex-1 rounded-none px-4 py-2 text-sm font-medium transition-colors ${
                  plugin.isInstalled
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {plugin.isInstalled ? 'Installed' : 'Install'}
              </button>
              <button className="rounded-none bg-gray-600 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700">
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
