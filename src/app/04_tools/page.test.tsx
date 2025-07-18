import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToolsPage from './page';
import { getContentByType } from '@/lib/utils/content-loader';
import type { ContentItem } from '@/types/content';

// Mock dependencies
vi.mock('@/lib/utils/content-loader', () => ({
  getContentByType: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-icon">ArrowRight</span>,
  FileText: () => <span data-testid="file-text-icon">FileText</span>,
  Calculator: () => <span data-testid="calculator-icon">Calculator</span>,
  Code: () => <span data-testid="code-icon">Code</span>,
  Palette: () => <span data-testid="palette-icon">Palette</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
}));

describe('ToolsPage', () => {
  const mockContentTools: ContentItem[] = [
    {
      id: 'color-converter',
      type: 'tool' as import('@/types/content').ContentType,
      title: 'Color Converter',
      description: 'Convert colors between different formats',
      category: 'design',
      tags: ['color', 'design'],
      status: 'published',
      priority: 80,
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 'json-formatter',
      type: 'tool' as import('@/types/content').ContentType,
      title: 'JSON Formatter',
      description: 'Format and validate JSON data',
      category: 'developer',
      tags: ['json', 'developer'],
      status: 'published',
      priority: 70,
      createdAt: '2024-01-02T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockContentTools);
  });

  it('should render without crashing', async () => {
    const ToolsPageComponent = await ToolsPage();
    const { container } = render(ToolsPageComponent);
    expect(container).toBeTruthy();
  });

  it('should display page title and description', async () => {
    const ToolsPageComponent = await ToolsPage();
    const { getByText } = render(ToolsPageComponent);

    expect(getByText('Tools')).toBeInTheDocument();
    expect(getByText('便利なツール')).toBeInTheDocument();
  });

  it('should display tool categories', async () => {
    const ToolsPageComponent = await ToolsPage();
    const { getByText } = render(ToolsPageComponent);

    expect(getByText('Text Tools')).toBeInTheDocument();
    expect(getByText('Calculators')).toBeInTheDocument();
    expect(getByText('Developer Tools')).toBeInTheDocument();
    expect(getByText('Design Tools')).toBeInTheDocument();
  });

  it('should display built-in tools', async () => {
    const ToolsPageComponent = await ToolsPage();
    const { getByText } = render(ToolsPageComponent);

    expect(getByText('Text Counter')).toBeInTheDocument();
    expect(
      getByText('Count characters, words, sentences, and more in your text')
    ).toBeInTheDocument();
  });

  it('should display content tools from API', async () => {
    const ToolsPageComponent = await ToolsPage();
    const { getByText } = render(ToolsPageComponent);

    expect(getByText('Color Converter')).toBeInTheDocument();
    expect(getByText('Convert colors between different formats')).toBeInTheDocument();
    expect(getByText('JSON Formatter')).toBeInTheDocument();
    expect(getByText('Format and validate JSON data')).toBeInTheDocument();
  });

  it('should fetch tools from content API', async () => {
    await ToolsPage();

    expect(getContentByType).toHaveBeenCalledWith('tool', {
      status: 'published',
      sortBy: 'priority',
      sortOrder: 'desc',
    });
  });
});
