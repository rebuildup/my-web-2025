import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from './page';

// Mock Next.js modules
vi.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// Mock document for SEO testing
const mockDocumentTitle = vi.fn();
const mockSetAttribute = vi.fn();
const mockQuerySelector = vi.fn(() => ({
  setAttribute: mockSetAttribute,
}));

Object.defineProperty(global, 'document', {
  value: {
    title: '',
    querySelector: mockQuerySelector,
  },
  writable: true,
});

Object.defineProperty(global.document, 'title', {
  set: mockDocumentTitle,
  get: () => 'Search - samuido | サイト内検索',
});

describe('Search Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the search page', () => {
    render(<SearchPage />);

    expect(screen.getByRole('heading', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByText('サイト内検索')).toBeInTheDocument();
    expect(
      screen.getByText(/プロフィール、ポートフォリオ、ワークショップ、ツールから/)
    ).toBeInTheDocument();
  });

  it('should set SEO metadata on mount', () => {
    render(<SearchPage />);

    expect(mockDocumentTitle).toHaveBeenCalledWith('Search - samuido | サイト内検索');
    expect(mockQuerySelector).toHaveBeenCalledWith('meta[name="description"]');
    expect(mockSetAttribute).toHaveBeenCalledWith(
      'content',
      'samuidoのサイト内検索。プロフィール、ポートフォリオ、ワークショップ、ツールから必要な情報を素早く見つけられます。'
    );
  });

  it('should render search form elements', () => {
    render(<SearchPage />);

    expect(screen.getByLabelText('キーワード検索')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('検索キーワードを入力...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '検索' })).toBeInTheDocument();
    expect(screen.getByLabelText('カテゴリー')).toBeInTheDocument();
    expect(screen.getByLabelText('タイプ')).toBeInTheDocument();
  });

  it('should render category and type options', () => {
    render(<SearchPage />);

    // Category options
    expect(screen.getByDisplayValue('全て')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Workshop' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Tools' })).toBeInTheDocument();

    // Type options - there are two "全て" options, so we need to be specific
    const typeSelect = screen.getAllByDisplayValue('全て')[1];
    expect(typeSelect).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    await user.type(searchInput, 'React');

    expect(searchInput).toHaveValue('React');
  });

  it('should handle category filter changes', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const categorySelect = screen.getByLabelText('カテゴリー');
    await user.selectOptions(categorySelect, 'portfolio');

    expect(categorySelect).toHaveValue('portfolio');
  });

  it('should handle type filter changes', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const typeSelect = screen.getByLabelText('タイプ');
    await user.selectOptions(typeSelect, 'blog');

    expect(typeSelect).toHaveValue('blog');
  });

  it('should perform search on button click', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'React');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('検索結果')).toBeInTheDocument();
      expect(screen.getByText('"React" の検索結果: 3件')).toBeInTheDocument();
    });
  });

  it('should perform search on Enter key press', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');

    await user.type(searchInput, 'React');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('検索結果')).toBeInTheDocument();
    });
  });

  it('should not search with empty query', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchButton = screen.getByRole('button', { name: '検索' });
    await user.click(searchButton);

    expect(screen.queryByText('検索結果')).not.toBeInTheDocument();
  });

  it('should disable search button when loading', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'React');
    await user.click(searchButton);

    // During loading, button should show loading text
    expect(screen.getByRole('button', { name: '検索中...' })).toBeDisabled();
  });

  it('should display search results', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'React');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('React Portfolio Website')).toBeInTheDocument();
      expect(screen.getByText('Next.js 15 + React 19の新機能解説')).toBeInTheDocument();
    });
  });

  it('should filter search results by category', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const categorySelect = screen.getByLabelText('カテゴリー');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'React');
    await user.selectOptions(categorySelect, 'portfolio');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('"React" の検索結果: 1件')).toBeInTheDocument();
      expect(screen.getByText('React Portfolio Website')).toBeInTheDocument();
      expect(screen.queryByText('Next.js 15 + React 19の新機能解説')).not.toBeInTheDocument();
    });
  });

  it('should filter search results by type', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const typeSelect = screen.getByLabelText('タイプ');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'React');
    await user.selectOptions(typeSelect, 'blog');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('"React" の検索結果: 1件')).toBeInTheDocument();
      expect(screen.getByText('Next.js 15 + React 19の新機能解説')).toBeInTheDocument();
      expect(screen.queryByText('React Portfolio Website')).not.toBeInTheDocument();
    });
  });

  it('should display no results message', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'nonexistent');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument();
      expect(screen.getByText('別のキーワードでお試しください')).toBeInTheDocument();
    });
  });

  it('should render search hints when not searched', () => {
    render(<SearchPage />);

    expect(screen.getByText('検索のヒント')).toBeInTheDocument();
    expect(screen.getByText('検索対象')).toBeInTheDocument();
    expect(screen.getByText('検索のコツ')).toBeInTheDocument();
    expect(screen.getByText('• プロフィールページ')).toBeInTheDocument();
    expect(screen.getByText('• 具体的なキーワードを使用')).toBeInTheDocument();
  });

  it('should render popular search keywords', () => {
    render(<SearchPage />);

    expect(screen.getByText('人気の検索キーワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next.js' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'カラーパレット' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'QRコード' })).toBeInTheDocument();
  });

  it('should handle popular keyword clicks', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const reactKeyword = screen.getByRole('button', { name: 'React' });
    await user.click(reactKeyword);

    await waitFor(() => {
      expect(screen.getByDisplayValue('React')).toBeInTheDocument();
      expect(screen.getByText('検索結果')).toBeInTheDocument();
    });
  });

  it('should render navigation links', () => {
    render(<SearchPage />);

    expect(screen.getByRole('link', { name: '← Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'About →' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Portfolio →' })).toHaveAttribute('href', '/portfolio');
    expect(screen.getByRole('link', { name: 'Contact →' })).toHaveAttribute('href', '/contact');
  });

  it('should render search results with proper links', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'React');
    await user.click(searchButton);

    await waitFor(() => {
      const portfolioLink = screen.getByRole('link', { name: /React Portfolio Website/ });
      expect(portfolioLink).toHaveAttribute('href', '/portfolio/detail/react-portfolio');
    });
  });

  it('should render JSON-LD script', () => {
    render(<SearchPage />);

    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();
  });

  it('should hide search hints after searching', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    // Initially, search hints should be visible
    expect(screen.getByText('検索のヒント')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'React');
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.queryByText('検索のヒント')).not.toBeInTheDocument();
      expect(screen.getByText('検索結果')).toBeInTheDocument();
    });
  });

  it('should display result badges correctly', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, 'Color');
    await user.click(searchButton);

    await waitFor(() => {
      // Check category badge
      expect(screen.getByText('Tools')).toBeInTheDocument();
      // Check type badge
      expect(screen.getByText('ツール')).toBeInTheDocument();
    });
  });

  it('should handle search with whitespace-only query', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    const searchButton = screen.getByRole('button', { name: '検索' });

    await user.type(searchInput, '   ');
    await user.click(searchButton);

    expect(screen.queryByText('検索結果')).not.toBeInTheDocument();
  });
});
