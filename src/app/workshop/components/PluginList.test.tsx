import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PluginList from './PluginList';

// Mock the fetch function
global.fetch = vi.fn();

describe('PluginList Component', () => {
  const mockPluginData = [
    {
      id: '1',
      name: 'Test Plugin 1',
      description: 'This is a test plugin description',
      version: '1.0.0',
      downloads: 150,
      category: 'After Effects',
      slug: 'test-plugin-1',
    },
    {
      id: '2',
      name: 'Test Plugin 2',
      description: 'Another test plugin description',
      version: '2.1.0',
      downloads: 300,
      category: 'Premiere Pro',
      slug: 'test-plugin-2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PluginList Component', () => {
    it('should render the plugin list component', () => {
      render(<PluginList />);

      expect(screen.getByRole('heading', { name: 'Plugins' })).toBeInTheDocument();
      expect(screen.getByText('After Effects and Premiere Pro plugins')).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<PluginList />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Plugins' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<PluginList />)).not.toThrow();
    });

    it('should display loading state initially', () => {
      render(<PluginList />);

      expect(screen.getByText('Loading plugins...')).toBeInTheDocument();
    });

    it('should display plugins when data is loaded', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPluginData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Test Plugin 1')).toBeInTheDocument();
        expect(screen.getByText('Test Plugin 2')).toBeInTheDocument();
      });
    });

    it('should display error message when fetch fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'));

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load plugins')).toBeInTheDocument();
      });
    });

    it('should display plugin descriptions', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPluginData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('This is a test plugin description')).toBeInTheDocument();
        expect(screen.getByText('Another test plugin description')).toBeInTheDocument();
      });
    });

    it('should display plugin versions', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPluginData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('v1.0.0')).toBeInTheDocument();
        expect(screen.getByText('v2.1.0')).toBeInTheDocument();
      });
    });

    it('should display download counts', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPluginData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('150 downloads')).toBeInTheDocument();
        expect(screen.getByText('300 downloads')).toBeInTheDocument();
      });
    });

    it('should display plugin categories', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPluginData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('After Effects')).toBeInTheDocument();
        expect(screen.getByText('Premiere Pro')).toBeInTheDocument();
      });
    });

    it('should handle empty plugin data', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('No plugins found')).toBeInTheDocument();
      });
    });

    it('should handle network error gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load plugins')).toBeInTheDocument();
      });
    });

    it('should handle malformed JSON response', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load plugins')).toBeInTheDocument();
      });
    });

    it('should handle plugins with missing fields', async () => {
      const incompleteData = [
        {
          id: '1',
          name: 'Test Plugin',
          // Missing description, version, downloads, category
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Test Plugin')).toBeInTheDocument();
      });
    });

    it('should display plugin links correctly', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPluginData,
      });

      render(<PluginList />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/workshop/plugins/test-plugin-1');
        expect(links[1]).toHaveAttribute('href', '/workshop/plugins/test-plugin-2');
      });
    });

    it('should handle plugins with special characters in names', async () => {
      const specialData = [
        {
          id: '1',
          name: 'Test & Special Plugin: "Quotes" and <Tags>',
          description: 'Special characters test',
          version: '1.0.0',
          downloads: 100,
          category: 'After Effects',
          slug: 'test-special-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => specialData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Test & Special Plugin: "Quotes" and <Tags>')).toBeInTheDocument();
      });
    });

    it('should handle plugins with long names', async () => {
      const longNameData = [
        {
          id: '1',
          name: 'This is a very long plugin name that should be handled properly by the component without breaking the layout or causing any rendering issues',
          description: 'Long name test',
          version: '1.0.0',
          downloads: 100,
          category: 'After Effects',
          slug: 'long-name-test',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => longNameData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText(/This is a very long plugin name/)).toBeInTheDocument();
      });
    });

    it('should handle plugins with zero downloads', async () => {
      const zeroDownloadsData = [
        {
          id: '1',
          name: 'Zero Downloads Plugin',
          description: 'Testing zero downloads',
          version: '1.0.0',
          downloads: 0,
          category: 'After Effects',
          slug: 'zero-downloads-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => zeroDownloadsData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('0 downloads')).toBeInTheDocument();
      });
    });

    it('should handle plugins with large download numbers', async () => {
      const largeDownloadsData = [
        {
          id: '1',
          name: 'Popular Plugin',
          description: 'Testing large download numbers',
          version: '1.0.0',
          downloads: 1500000,
          category: 'After Effects',
          slug: 'popular-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => largeDownloadsData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('1,500,000 downloads')).toBeInTheDocument();
      });
    });

    it('should handle plugins with missing categories', async () => {
      const noCategoryData = [
        {
          id: '1',
          name: 'No Category Plugin',
          description: 'Testing no category',
          version: '1.0.0',
          downloads: 100,
          category: '',
          slug: 'no-category-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => noCategoryData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('No Category Plugin')).toBeInTheDocument();
        // Should not crash when there is no category
      });
    });

    it('should handle plugins with null or undefined categories', async () => {
      const nullCategoryData = [
        {
          id: '1',
          name: 'Null Category Plugin',
          description: 'Testing null category',
          version: '1.0.0',
          downloads: 100,
          category: null,
          slug: 'null-category-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => nullCategoryData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Null Category Plugin')).toBeInTheDocument();
        // Should not crash when category is null
      });
    });

    it('should handle plugins with invalid versions', async () => {
      const invalidVersionData = [
        {
          id: '1',
          name: 'Invalid Version Plugin',
          description: 'Testing invalid version',
          version: 'invalid-version',
          downloads: 100,
          category: 'After Effects',
          slug: 'invalid-version-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidVersionData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Invalid Version Plugin')).toBeInTheDocument();
        // Should handle invalid versions gracefully
      });
    });

    it('should handle plugins with missing slugs', async () => {
      const noSlugData = [
        {
          id: '1',
          name: 'No Slug Plugin',
          description: 'Testing no slug',
          version: '1.0.0',
          downloads: 100,
          category: 'After Effects',
          // Missing slug
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => noSlugData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('No Slug Plugin')).toBeInTheDocument();
        // Should handle missing slugs gracefully
      });
    });

    it('should handle plugins with negative download counts', async () => {
      const negativeDownloadsData = [
        {
          id: '1',
          name: 'Negative Downloads Plugin',
          description: 'Testing negative downloads',
          version: '1.0.0',
          downloads: -50,
          category: 'After Effects',
          slug: 'negative-downloads-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => negativeDownloadsData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('Negative Downloads Plugin')).toBeInTheDocument();
        // Should handle negative downloads gracefully
      });
    });

    it('should handle plugins with decimal version numbers', async () => {
      const decimalVersionData = [
        {
          id: '1',
          name: 'Decimal Version Plugin',
          description: 'Testing decimal version',
          version: '1.5.2',
          downloads: 100,
          category: 'After Effects',
          slug: 'decimal-version-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => decimalVersionData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('v1.5.2')).toBeInTheDocument();
      });
    });

    it('should handle plugins with pre-release versions', async () => {
      const preReleaseData = [
        {
          id: '1',
          name: 'Pre-release Plugin',
          description: 'Testing pre-release version',
          version: '2.0.0-beta.1',
          downloads: 100,
          category: 'After Effects',
          slug: 'pre-release-plugin',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => preReleaseData,
      });

      render(<PluginList />);

      await waitFor(() => {
        expect(screen.getByText('v2.0.0-beta.1')).toBeInTheDocument();
      });
    });
  });
});
