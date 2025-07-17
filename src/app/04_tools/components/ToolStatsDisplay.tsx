'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ToolStat {
  id: string;
  title: string;
  category: string;
  views: number;
}

interface ToolStatsDisplayProps {
  toolStats: ToolStat[];
}

export default function ToolStatsDisplay({ toolStats }: ToolStatsDisplayProps) {
  if (!toolStats || toolStats.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-foreground/70">No usage statistics available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Chart */}
      <div className="bg-card border-border rounded-lg border p-6">
        <h2 className="text-foreground mb-4 text-xl font-semibold">Tool Usage Chart</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toolStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} fontSize={12} />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="views" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border-border overflow-hidden rounded-lg border">
        <div className="border-border border-b p-6">
          <h2 className="text-foreground text-xl font-semibold">Detailed Statistics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left font-medium">Tool</th>
                <th className="p-4 text-left font-medium">Category</th>
                <th className="p-4 text-right font-medium">Views</th>
              </tr>
            </thead>
            <tbody>
              {toolStats.map((tool, index) => (
                <tr key={tool.id} className={index % 2 === 0 ? 'bg-muted/25' : ''}>
                  <td className="p-4 font-medium">{tool.title}</td>
                  <td className="text-foreground/70 p-4 capitalize">{tool.category}</td>
                  <td className="p-4 text-right font-mono">{tool.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
