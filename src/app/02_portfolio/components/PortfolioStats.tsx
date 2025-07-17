'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Filter, ExternalLink } from 'lucide-react';

interface PortfolioStat {
  id: string;
  title: string;
  category: string;
  views: number;
}

interface PortfolioStatsProps {
  portfolioStats: PortfolioStat[];
}

export default function PortfolioStats({ portfolioStats }: PortfolioStatsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...new Set(portfolioStats.map(stat => stat.category))];

  // Filter stats by category
  const filteredStats =
    selectedCategory === 'all'
      ? portfolioStats
      : portfolioStats.filter(stat => stat.category === selectedCategory);

  // Calculate total views
  const totalViews = portfolioStats.reduce((sum, stat) => sum + stat.views, 0);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Custom tooltip for chart
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: PortfolioStat }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="border-foreground/10 bg-background border p-3 shadow-md">
          <p className="text-sm font-medium">{data.title}</p>
          <p className="text-foreground/70 text-xs">{data.category}</p>
          <p className="mt-1 text-sm">
            <span className="font-medium">{data.views.toLocaleString()}</span> views
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-foreground/10 bg-gray/50 border p-4">
          <div className="flex items-center">
            <Eye className="text-primary mr-2 h-6 w-6" />
            <h3 className="text-foreground text-lg font-medium">Total Views</h3>
          </div>
          <p className="text-foreground mt-2 text-3xl font-bold">{totalViews.toLocaleString()}</p>
        </div>

        <div className="border-foreground/10 bg-gray/50 border p-4">
          <div className="flex items-center">
            <Filter className="text-primary mr-2 h-6 w-6" />
            <h3 className="text-foreground text-lg font-medium">Filter by Category</h3>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`border px-3 py-1 text-sm ${
                  selectedCategory === category
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {filteredStats.length > 0 ? (
        <div className="border-foreground/10 border p-4">
          <h3 className="text-foreground mb-4 text-lg font-medium">Portfolio Views by Item</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredStats} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis
                  dataKey="title"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" fill="#3b82f6" name="Views" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="border-foreground/10 bg-gray/30 border p-6 text-center">
          <p className="text-foreground/70">No statistics available for the selected category.</p>
        </div>
      )}

      {/* Table */}
      <div className="border-foreground/10 border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray/50">
                <th className="border-foreground/10 text-foreground border-b p-3 text-left text-sm font-medium">
                  Portfolio Item
                </th>
                <th className="border-foreground/10 text-foreground border-b p-3 text-left text-sm font-medium">
                  Category
                </th>
                <th className="border-foreground/10 text-foreground border-b p-3 text-right text-sm font-medium">
                  Views
                </th>
                <th className="border-foreground/10 text-foreground border-b p-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.length > 0 ? (
                filteredStats.map((stat, index) => (
                  <tr key={stat.id} className={index % 2 === 0 ? 'bg-transparent' : 'bg-gray/30'}>
                    <td className="border-foreground/10 text-foreground border-b p-3 text-sm">
                      {stat.title}
                    </td>
                    <td className="border-foreground/10 text-foreground/70 border-b p-3 text-sm">
                      {stat.category}
                    </td>
                    <td className="border-foreground/10 text-foreground border-b p-3 text-right text-sm font-medium">
                      {stat.views.toLocaleString()}
                    </td>
                    <td className="border-foreground/10 border-b p-3 text-right text-sm">
                      <Link
                        href={`/02_portfolio/${stat.id}`}
                        className="text-primary hover:text-primary/80 inline-flex items-center"
                      >
                        <ExternalLink size={14} className="mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="border-foreground/10 text-foreground/70 border-b p-3 text-center text-sm"
                  >
                    No statistics available for the selected category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
