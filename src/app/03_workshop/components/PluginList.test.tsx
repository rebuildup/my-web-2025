/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PluginList from './PluginList';

// Mock global.fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('PluginList Component', () => {
  const mockPluginData = [
    {
      id: '1',
      name: 'Test Plugin 1',
      description: 'Desc 1',
      version: '1.0',
      downloads: 1200,
      rating: 4.5,
      slug: 'p1',
      category: 'cat1',
      tags: ['tag1'],
    },
    {
      id: '2',
      name: 'Test Plugin 2',
      description: 'Desc 2',
      version: '2.0',
      downloads: 500,
      rating: 4.0,
      slug: 'p2',
      category: 'cat2',
      tags: ['tag2'],
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should display loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<PluginList />);
    expect(screen.getByText('Loading plugins...')).toBeInTheDocument();
  });

  it('should display plugins when data is loaded', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPluginData),
    });
    render(<PluginList />);
    await waitFor(() => {
      expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
      expect(screen.getByText('1.2k')).toBeInTheDocument(); // Check formatted downloads >= 1000
      expect(screen.getByText('500')).toBeInTheDocument(); // Check formatted downloads < 1000
    });
  });

  it('should display error message when fetch fails with a network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network request failed'));
    render(<PluginList />);
    await waitFor(() => {
      expect(screen.getByText('Network request failed')).toBeInTheDocument();
    });
  });

  it('should display error message when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });
    render(<PluginList />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch plugins')).toBeInTheDocument();
    });
  });

  it('should handle non-Error objects being thrown', async () => {
    mockFetch.mockRejectedValue('A custom error string');
    render(<PluginList />);
    await waitFor(() => {
      expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
    });
  });

  it('should handle empty plugin data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    render(<PluginList />);
    await waitFor(() => {
      expect(screen.getByText('Plugin Library')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });
});
