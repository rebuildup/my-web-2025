import React from 'react';
import { render, screen } from '@testing-library/react';
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
  ArrowRight: () => <span data-testid="arrow-icon" />,
  FileText: () => <span data-testid="file-text-icon" />,
  Calculator: () => <span data-testid="calculator-icon" />,
  Code: () => <span data-testid="code-icon" />,
  Palette: () => <span data-testid="palette-icon" />,
  Eye: () => <span data-testid="eye-icon" />,
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

  it('should render the tools page with title and description', async () => {
    render(await ToolsPage());

    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText('便利なツール')).toBeInTheDocument();
  });

  it('should render tool categories', async () => {
    render(await ToolsPage());

    expect(screen.getByText('Text Tools')).toBeInTheDocument();
    expect(screen.getByText('Calculators')).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Design Tools')).toBeInTheDocument();
  });

  it('should render built-in tools', async () => {
    render(await ToolsPage());

    expect(screen.getByText('Text Counter')).toBeInTheDocument();
    expect(
      screen.getByText('Count characters, words, sentences, and more in your text')
    ).toBeInTheDocument();
  });

  it('should render content tools', async () => {
    render(await ToolsPage());

    expect(screen.getByText('Color Converter')).toBeInTheDocument();
    expect(screen.getByText('Convert colors between different formats')).toBeInTheDocument();
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
    expect(screen.getByText('Format and validate JSON data')).toBeInTheDocument();
  });

  it('should group tools by category', async () => {
    render(await ToolsPage());

    // Text Tools category should contain Text Counter
    const textToolsHeading = screen.getByText('Text Tools');
    const textCounter = screen.getByText('Text Counter');
    const textToolsSection = textToolsHeading.closest('section');
    const textCounterCard = textCounter.closest('div[class*="card"]');
    expect(textToolsSection?.contains(textCounterCard)).toBe(true);

    // Developer Tools category should contain JSON Formatter
    const devToolsHeading = screen.getByText('Developer Tools');
    const jsonFormatter = screen.getByText('JSON Formatter');
    const devToolsSection = devToolsHeading.closest('section');
    const jsonFormatterCard = jsonFormatter.closest('div[class*="card"]');
    expect(devToolsSection?.contains(jsonFormatterCard)).toBe(true);

    // Design Tools category should contain Color Converter
    const designToolsHeading = screen.getByText('Design Tools');
    const colorConverter = screen.getByText('Color Converter');
    const designToolsSection = designToolsHeading.closest('section');
    const colorConverterCard = colorConverter.closest('div[class*="card"]');
    expect(designToolsSection?.contains(colorConverterCard)).toBe(true);
  });

  it('should show empty state for categories with no tools', async () => {
    // Mock empty content tools
    (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    render(await ToolsPage());

    // Calculators category should show empty state
    const calculatorsHeading = screen.getByText('Calculators');
    const emptyState = screen.getAllByText('No tools available in this category yet.')[1]; // Second empty state is for calculators
    const calculatorsSection = calculatorsHeading.closest('section');
    expect(calculatorsSection?.contains(emptyState)).toBe(true);
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
