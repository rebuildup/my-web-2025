import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

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

describe('NotFound', () => {
  it('should render 404 heading', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should render not found message', () => {
    render(<NotFound />);

    expect(screen.getByText('ページが見つかりません / Page Not Found')).toBeInTheDocument();
  });

  it('should render home link', () => {
    render(<NotFound />);

    const homeLink = screen.getByText('ホーム / Home');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should render search suggestion', () => {
    render(<NotFound />);

    expect(screen.getByText('お探しのコンテンツを検索してみてください')).toBeInTheDocument();
  });

  it('should have proper accessibility structure', () => {
    render(<NotFound />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => render(<NotFound />)).not.toThrow();
  });
});
