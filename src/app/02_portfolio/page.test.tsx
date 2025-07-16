import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioPage from './page';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Portfolio Page', () => {
  it('should render gallery category cards with correct links', () => {
    render(<PortfolioPage />);
    expect(screen.getByRole('heading', { name: 'All Works' }).closest('a')).toHaveAttribute(
      'href',
      '/02_portfolio/gallery/all'
    );
    expect(screen.getByRole('heading', { name: 'Development' }).closest('a')).toHaveAttribute(
      'href',
      '/02_portfolio/gallery/develop'
    );
    expect(screen.getByRole('heading', { name: 'Video' }).closest('a')).toHaveAttribute(
      'href',
      '/02_portfolio/gallery/video'
    );
    expect(screen.getByRole('heading', { name: 'Video & Design' }).closest('a')).toHaveAttribute(
      'href',
      '/02_portfolio/gallery/video-design'
    );
  });
});
