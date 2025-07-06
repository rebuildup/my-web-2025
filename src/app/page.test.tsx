import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './page';

// Mock the stats module
vi.mock('@/lib/stats', () => ({
  updateStats: vi.fn(),
}));

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

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the main heading', () => {
    render(<HomePage />);

    expect(screen.getByText('Welcome to My Digital Workspace')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<HomePage />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Workshop')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('should render feature sections', () => {
    render(<HomePage />);

    expect(screen.getByText('Creative Development')).toBeInTheDocument();
    expect(screen.getByText('Digital Tools')).toBeInTheDocument();
    expect(screen.getByText('Open Source')).toBeInTheDocument();
  });

  it('should render call-to-action buttons', () => {
    render(<HomePage />);

    expect(screen.getByText('View Portfolio')).toBeInTheDocument();
    expect(screen.getByText('Explore Tools')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<HomePage />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should render without crashing', () => {
    expect(() => render(<HomePage />)).not.toThrow();
  });
});
