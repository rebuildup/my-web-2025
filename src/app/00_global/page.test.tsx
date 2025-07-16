/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from './page';
import { searchContent, getPopularSearchTerms } from '@/lib/search';

// searchContentとgetPopularSearchTermsをモック化
vi.mock('@/lib/search', () => ({
  searchContent: vi.fn(),
  getPopularSearchTerms: vi.fn(),
}));

const mockedSearchContent = searchContent as vi.Mock;
const mockedGetPopularSearchTerms = getPopularSearchTerms as vi.Mock;

const mockSearchResults = [
  {
    id: '1',
    title: 'React Guide',
    description: 'A comprehensive guide to React.',
    category: 'workshop',
    type: 'blog',
    url: '/workshop/blog/react-guide',
    lastModified: '2023-10-01',
    score: 0.9,
  },
  {
    id: '2',
    title: 'Unknown Category',
    description: 'This item has a category and type that does not exist.',
    category: 'non-existent-category',
    type: 'non-existent-type',
    url: '/somewhere/else',
    lastModified: '2023-10-02',
    score: 0.8,
  },
];

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSearchContent.mockResolvedValue([]);
    mockedGetPopularSearchTerms.mockResolvedValue(['React', 'Next.js']);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should render search form and popular keywords on initial load', async () => {
    render(<SearchPage />);
    expect(screen.getByPlaceholderText(/検索キーワードを入力/)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument();
    });
  });

  it('should trigger search with input text and search button', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/);
    const searchButton = screen.getByRole('button', { name: '検索' });
    await user.type(searchInput, 'Test Query');
    await user.click(searchButton);
    await waitFor(() => {
      expect(mockedSearchContent).toHaveBeenCalledWith('Test Query', { category: 'all', type: 'all' });
    });
  });

  it('should trigger search with Enter key', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/);
    await user.type(searchInput, 'Enter Key Test');
    await user.keyboard('{enter}');
    await waitFor(() => {
      expect(mockedSearchContent).toHaveBeenCalledWith('Enter Key Test', { category: 'all', type: 'all' });
    });
  });

  it('should not trigger search if query is empty', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchButton = screen.getByRole('button', { name: '検索' });
    await user.click(searchButton);
    expect(mockedSearchContent).not.toHaveBeenCalled();
  });

  it('should update filters and trigger search with them', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/);
    const categorySelect = screen.getByLabelText('カテゴリー');
    const typeSelect = screen.getByLabelText('タイプ');
    const searchButton = screen.getByRole('button', { name: '検索' });
    await user.selectOptions(categorySelect, 'portfolio');
    await user.selectOptions(typeSelect, 'tool');
    await user.type(searchInput, 'Filtered Search');
    await user.click(searchButton);
    await waitFor(() => {
      expect(mockedSearchContent).toHaveBeenCalledWith('Filtered Search', { category: 'portfolio', type: 'tool' });
    });
  });

  it('should display search results and handle unknown categories/types', async () => {
    mockedSearchContent.mockResolvedValue(mockSearchResults);
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/);
    await user.type(searchInput, 'React');
    await user.keyboard('{enter}');
    await waitFor(() => {
      expect(screen.getByText('React Guide')).toBeInTheDocument();
      expect(screen.getByText('Unknown Category')).toBeInTheDocument();
    });
  });

  it('should display "no results" message when search returns empty', async () => {
    mockedSearchContent.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/);
    await user.type(searchInput, 'No Result Test');
    await user.keyboard('{enter}');
    await waitFor(() => {
      expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument();
    });
  });

  it('should handle search API errors gracefully', async () => {
    const searchError = new Error('API Error');
    mockedSearchContent.mockRejectedValue(searchError);
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/);
    await user.type(searchInput, 'Error Test');
    await user.keyboard('{enter}');
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Search error:', searchError);
      expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument();
    });
  });

  it('should trigger search when a popular keyword is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument();
    });
    const reactButton = screen.getByRole('button', { name: 'React' });
    await user.click(reactButton);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/検索キーワードを入力/)).toHaveValue('React');
      expect(mockedSearchContent).toHaveBeenCalledWith('React', expect.any(Object));
    });
  });

  it('should show loading state on button and results', async () => {
    let resolveSearch: (value: unknown) => void;
    mockedSearchContent.mockImplementation(() => new Promise(resolve => {
      resolveSearch = resolve;
    }));
    const user = userEvent.setup();
    render(<SearchPage />);
    const searchInput = screen.getByPlaceholderText(/検索キーワードを入力/);
    const searchButton = screen.getByRole('button', { name: '検索' });
    await user.type(searchInput, 'Loading Test');
    await user.click(searchButton);
    
    await waitFor(() => {
      expect(searchButton).toBeDisabled();
      expect(screen.getAllByText('検索中...').length).toBeGreaterThan(0);
    });

    // @ts-ignore
    resolveSearch([]); // Complete the search
    await waitFor(() => {
      expect(searchButton).not.toBeDisabled();
    });
  });

  it('should not throw error if meta description tag does not exist', () => {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.remove();
    expect(() => render(<SearchPage />)).not.toThrow();
  });

  it('should set meta description if it exists', () => {
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'initial';
    document.head.appendChild(meta);
    render(<SearchPage />);
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。'
    );
    document.head.removeChild(meta);
  });
});