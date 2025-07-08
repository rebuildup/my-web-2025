import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPage from './page';

// Mock process.env
const mockEnv = vi.hoisted(() => ({
  NODE_ENV: 'development',
}));

vi.stubGlobal('process', {
  env: mockEnv,
});

describe('Admin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render access denied when not in development mode', async () => {
    mockEnv.NODE_ENV = 'production';

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
    mockEnv.NODE_ENV = 'development';

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Content Management & Analytics')).toBeInTheDocument();
      expect(screen.getByText('Development Mode Only')).toBeInTheDocument();
    });
  });

  it('should render navigation in development mode', async () => {
    mockEnv.NODE_ENV = 'development';

    render(<AdminPage />);

    await waitFor(() => {
      const homeLink = screen.getByRole('link', { name: '← Home' });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  it('should render statistics overview', async () => {
    mockEnv.NODE_ENV = 'development';

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
    mockEnv.NODE_ENV = 'development';

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument(); // totalContent
      expect(screen.getByText('12,543')).toBeInTheDocument(); // totalViews
      expect(screen.getByText('1,834')).toBeInTheDocument(); // totalDownloads
      expect(screen.getByText('6,721')).toBeInTheDocument(); // totalSearches
    });
  });

  it('should render management tools section', async () => {
    mockEnv.NODE_ENV = 'development';

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
    mockEnv.NODE_ENV = 'development';

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
    mockEnv.NODE_ENV = 'development';

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
    mockEnv.NODE_ENV = 'development';

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
    mockEnv.NODE_ENV = 'development';

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('CONTENT')).toBeInTheDocument();
      expect(screen.getByText('VIEWS')).toBeInTheDocument();
      expect(screen.getByText('DOWNLOADS')).toBeInTheDocument();
      expect(screen.getByText('SEARCHES')).toBeInTheDocument();
    });
  });
});
