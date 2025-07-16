import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkshopPage from './page';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Workshop Page', () => {
  it('should render the main heading and description', () => {
    render(<WorkshopPage />);
    expect(screen.getByRole('heading', { level: 1, name: 'Workshop' })).toBeInTheDocument();
    expect(screen.getByText('プラグイン・ブログ・素材配布')).toBeInTheDocument();
  });

  it('should render the statistics section correctly', () => {
    render(<WorkshopPage />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
  });

  it('should render category cards with correct links', () => {
    render(<WorkshopPage />);
    expect(screen.getByRole('link', { name: /Blog/ })).toHaveAttribute('href', '/03_workshop/blog');
    expect(screen.getByRole('link', { name: /Plugins/ })).toHaveAttribute(
      'href',
      '/03_workshop/plugins'
    );
    expect(screen.getByRole('link', { name: /Downloads/ })).toHaveAttribute(
      'href',
      '/03_workshop/downloads'
    );
  });

  it('should render the latest content section', () => {
    render(<WorkshopPage />);
    expect(screen.getByRole('heading', { name: 'Latest Content' })).toBeInTheDocument();
    expect(screen.getByText('React 19の新機能解説')).toBeInTheDocument();
  });

  it('should render the popular content section', () => {
    render(<WorkshopPage />);
    expect(screen.getByRole('heading', { name: 'Popular Content' })).toBeInTheDocument();
    expect(screen.getByText('Next.js 15の新機能')).toBeInTheDocument();
  });
});
