import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getContentByType } from '@/lib/utils/content-loader';
import { ArrowRight, FileText, Calculator, Code, Palette, Eye } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tools | samuido',
  description: 'Useful web tools for developers, designers, and content creators',
};

// Tool categories
const TOOL_CATEGORIES = [
  { id: 'text', label: 'Text Tools', icon: FileText },
  { id: 'calculator', label: 'Calculators', icon: Calculator },
  { id: 'developer', label: 'Developer Tools', icon: Code },
  { id: 'design', label: 'Design Tools', icon: Palette },
];

// Built-in tools (not from content API)
const BUILT_IN_TOOLS = [
  {
    id: 'text-counter',
    title: 'Text Counter',
    description: 'Count characters, words, sentences, and more in your text',
    category: 'text',
    path: '/04_tools/text-counter',
  },
];

export default async function ToolsPage() {
  // Get tools from content API
  const contentTools = await getContentByType('tool', {
    status: 'published',
    sortBy: 'priority',
    sortOrder: 'desc',
  });

  // Combine built-in tools with content tools
  const allTools = [
    ...BUILT_IN_TOOLS,
    ...contentTools.map(tool => ({
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: tool.category,
      path: `/04_tools/${tool.id}`,
    })),
  ];

  // Group tools by category
  const toolsByCategory = TOOL_CATEGORIES.map(category => ({
    ...category,
    tools: allTools.filter(tool => tool.category === category.id),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="neue-haas-grotesk-display text-foreground mb-2 text-3xl font-bold">Tools</h1>
        <p className="noto-sans-jp text-foreground/70">便利なツール</p>
        <div className="mt-4">
          <Link
            href="/04_tools/stats"
            className="text-foreground/70 hover:text-primary inline-flex items-center text-sm"
          >
            <Eye className="mr-1 h-4 w-4" />
            View Usage Statistics
          </Link>
        </div>
      </div>

      <div className="space-y-12">
        {toolsByCategory.map(category => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center">
              <category.icon className="text-primary mr-2 h-5 w-5" />
              <h2 className="neue-haas-grotesk-display text-foreground text-xl font-bold">
                {category.label}
              </h2>
            </div>

            {category.tools.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.tools.map(tool => (
                  <Link
                    key={tool.id}
                    href={tool.path}
                    className="group border-foreground/20 bg-gray/50 hover:border-primary/50 block border p-4"
                  >
                    <h3 className="text-foreground group-hover:text-primary text-lg font-medium">
                      {tool.title}
                    </h3>
                    <p className="text-foreground/70 mt-1 text-sm">{tool.description}</p>
                    <div className="text-foreground/60 group-hover:text-primary mt-3 flex items-center text-xs">
                      <span>Open tool</span>
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border-foreground/10 bg-gray/30 text-foreground/70 border p-4 text-center">
                <p>No tools available in this category yet.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
