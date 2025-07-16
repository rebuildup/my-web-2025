import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Star } from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  downloads: number;
  rating: number;
  tags: string[];
  slug: string;
}

const PluginList: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const response = await fetch('/data/content/plugin.json');
        if (!response.ok) {
          throw new Error('Failed to fetch plugins');
        }
        const data = await response.json();
        setPlugins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlugins();
  }, []);

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  if (isLoading) {
    return <div>Loading plugins...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="rounded-none bg-gray-800 p-6 text-white">
      <h2 className="neue-haas-grotesk-display mb-4 text-xl font-bold text-blue-500">
        Plugin Library
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plugins.map(plugin => (
          <Link
            href={`/workshop/plugins/${plugin.slug}`}
            key={plugin.id}
            className="block rounded-none bg-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-blue-400">{plugin.name}</h3>
            <p className="mb-2 text-xs text-gray-400">v{plugin.version}</p>
            <p className="mb-4 text-sm text-gray-300">{plugin.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Download size={16} />
                <span>{formatDownloads(plugin.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} />
                <span>{plugin.rating}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PluginList;
