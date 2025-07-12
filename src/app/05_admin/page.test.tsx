import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPage from './page';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('Admin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render access denied when not in development mode', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'production' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText('Admin access is only available in development mode.')
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to Home' })).toHaveAttribute('href', '/');
    });
  });

  it('should render admin dashboard in development mode', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Content Management & Analytics')).toBeInTheDocument();
      expect(screen.getByText('Development Mode Only')).toBeInTheDocument();
    });
  });

  it('should render navigation in development mode', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      const homeLink = screen.getByRole('link', { name: '← Home' });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  it('should render statistics overview', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Items')).toBeInTheDocument();
      expect(screen.getByText('Page Views')).toBeInTheDocument();
      expect(screen.getByText('Total Downloads')).toBeInTheDocument();
      expect(screen.getByText('Search Queries')).toBeInTheDocument();
    });
  });

  it('should render stats values', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // totalContent
      expect(screen.getByText('12,543')).toBeInTheDocument(); // totalViews
      expect(screen.getByText('1,834')).toBeInTheDocument(); // totalDownloads
      expect(screen.getByText('6,721')).toBeInTheDocument(); // totalSearches
    });
  });

  it('should render management tools section', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Management Tools')).toBeInTheDocument();
      expect(screen.getByText('Content Manager')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Site Settings')).toBeInTheDocument();
    });
  });

  it('should render management tool links', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      const contentManagerLink = screen.getByText('Content Manager').closest('a');
      expect(contentManagerLink).toHaveAttribute('href', '/admin/content');

      const analyticsLink = screen.getByText('Analytics').closest('a');
      expect(analyticsLink).toHaveAttribute('href', '/admin/analytics');

      const userManagementLink = screen.getByText('User Management').closest('a');
      expect(userManagementLink).toHaveAttribute('href', '/admin/users');

      const siteSettingsLink = screen.getByText('Site Settings').closest('a');
      expect(siteSettingsLink).toHaveAttribute('href', '/admin/settings');
    });
  });

  it('should render tool descriptions', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Create, edit, and manage portfolio items, tools, and blog posts')
      ).toBeInTheDocument();
      expect(
        screen.getByText('View detailed statistics and user behavior analytics')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Manage user accounts and permissions (if applicable)')
      ).toBeInTheDocument();
    });
  });

  it('should render main content structure', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();

      const navElement = screen.getByRole('navigation');
      expect(navElement).toBeInTheDocument();

      const headerElement = screen.getByRole('banner');
      expect(headerElement).toBeInTheDocument();
    });
  });

  it('should render stats labels', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('CONTENT')).toBeInTheDocument();
      expect(screen.getByText('VIEWS')).toBeInTheDocument();
      expect(screen.getByText('DOWNLOADS')).toBeInTheDocument();
      expect(screen.getByText('SEARCHES')).toBeInTheDocument();
    });
  });

  it('should render additional management tools', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  it('should render additional management tool links', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      const performanceLink = screen.getByText('Performance Monitor').closest('a');
      expect(performanceLink).toHaveAttribute('href', '/admin/performance');

      const securityLink = screen.getByText('Security').closest('a');
      expect(securityLink).toHaveAttribute('href', '/admin/security');
    });
  });

  it('should render additional tool descriptions', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Configure site settings, SEO, and integrations')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Monitor site performance and optimization metrics')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Security settings, audit logs, and access control')
      ).toBeInTheDocument();
    });
  });

  it('should render Quick Actions section', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('System Status')).toBeInTheDocument();
    });
  });

  it('should render Recent Activity items', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('New portfolio item added')).toBeInTheDocument();
      expect(screen.getByText('2 hours ago')).toBeInTheDocument();
      expect(screen.getByText('Tool usage analytics updated')).toBeInTheDocument();
      expect(screen.getByText('4 hours ago')).toBeInTheDocument();
      expect(screen.getByText('Contact form submission')).toBeInTheDocument();
      expect(screen.getByText('6 hours ago')).toBeInTheDocument();
    });
  });

  it('should render System Status items', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Website Status')).toBeInTheDocument();
      expect(screen.getByText('Database')).toBeInTheDocument();
      expect(screen.getByText('Search Index')).toBeInTheDocument();

      // Status values
      const onlineStatuses = screen.getAllByText('Online');
      expect(onlineStatuses).toHaveLength(1);
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });
  });

  it('should render footer', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText('Admin Dashboard - Development Mode Only')).toBeInTheDocument();
    });
  });

  it('should initialize stats on component mount', async () => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: 'development' },
      writable: true,
    });

    render(<AdminPage />);

    await waitFor(() => {
      // These are the actual stats values set in useEffect
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('12,543')).toBeInTheDocument();
      expect(screen.getByText('1,834')).toBeInTheDocument();
      expect(screen.getByText('6,721')).toBeInTheDocument();
    });
  });
});
