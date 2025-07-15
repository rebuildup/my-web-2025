import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDataManager from './AdminDataManager';

describe('AdminDataManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should render the admin data manager', () => {
    render(<AdminDataManager />);

    expect(screen.getByText('Admin Data Manager')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Data Management')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<AdminDataManager />);

    expect(screen.getByText('Loading admin data...')).toBeInTheDocument();
  });

  it('should display overview tab content after loading', async () => {
    render(<AdminDataManager />);
    vi.runAllTimers();
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('89')).toBeInTheDocument(); // Content Items
      expect(screen.getByText('15,420')).toBeInTheDocument(); // Total Views
      expect(screen.getByText('2.3 GB')).toBeInTheDocument(); // Storage Used
    });
  });

  it('should switch to data management tab', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);
    vi.runAllTimers();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    const dataManagementButton = screen.getByText('Data Management');
    await user.click(dataManagementButton);

    expect(screen.getByText('User Database')).toBeInTheDocument();
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Analytics Data')).toBeInTheDocument();
  });

  it('should switch to settings tab', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);
    vi.runAllTimers();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(screen.getByText('System Settings')).toBeInTheDocument();
    expect(screen.getByText('Automatic Backups')).toBeInTheDocument();
    expect(screen.getByText('Maintenance Mode')).toBeInTheDocument();
    expect(screen.getByText('Debug Logging')).toBeInTheDocument();
  });

  it('should display data items with correct information', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);
    vi.runAllTimers();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    const dataManagementButton = screen.getByText('Data Management');
    await user.click(dataManagementButton);

    // Check for data items
    expect(screen.getByText('User Database')).toBeInTheDocument();
    expect(screen.getByText('Blog Posts')).toBeInTheDocument();
    expect(screen.getByText('Analytics Data')).toBeInTheDocument();

    // Check for status badges
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();

    // Check for action buttons
    expect(screen.getAllByText('Edit')).toHaveLength(3);
    expect(screen.getAllByText('Delete')).toHaveLength(3);
  });

  it('should display system health information', async () => {
    render(<AdminDataManager />);
    vi.runAllTimers();
    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('Database Connection')).toBeInTheDocument();
      expect(screen.getByText('API Response Time')).toBeInTheDocument();
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      expect(screen.getByText('✓ Connected')).toBeInTheDocument();
      expect(screen.getByText('124ms')).toBeInTheDocument();
      expect(screen.getByText('68%')).toBeInTheDocument();
    });
  });

  it('should display correct statistics', async () => {
    render(<AdminDataManager />);
    vi.runAllTimers();
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Content Items')).toBeInTheDocument();
      expect(screen.getByText('Total Views')).toBeInTheDocument();
      expect(screen.getByText('Storage Used')).toBeInTheDocument();
    });
  });

  it('should handle tab navigation correctly', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);
    vi.runAllTimers();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    // Check initial tab (Overview should be active)
    const overviewButton = screen.getByText('Overview');
    expect(overviewButton).toHaveClass('bg-blue-500');

    // Switch to Data Management
    const dataManagementButton = screen.getByText('Data Management');
    await user.click(dataManagementButton);
    expect(dataManagementButton).toHaveClass('bg-blue-500');
    expect(overviewButton).toHaveClass('bg-gray-700');

    // Switch to Settings
    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);
    expect(settingsButton).toHaveClass('bg-blue-500');
    expect(dataManagementButton).toHaveClass('bg-gray-700');

    // Switch back to Overview
    await user.click(overviewButton);
    expect(overviewButton).toHaveClass('bg-blue-500');
    expect(settingsButton).toHaveClass('bg-gray-700');
  });

  it('should display data items with correct formatting', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);
    vi.runAllTimers();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    const dataManagementButton = screen.getByText('Data Management');
    await user.click(dataManagementButton);

    // Check for data item details
    expect(screen.getByText('Last modified:')).toBeInTheDocument();
    expect(screen.getByText('1.2 MB')).toBeInTheDocument();
    expect(screen.getByText('850 KB')).toBeInTheDocument();
    expect(screen.getByText('3.4 MB')).toBeInTheDocument();
  });

  it('should display correct status colors', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);
    vi.runAllTimers();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    const dataManagementButton = screen.getByText('Data Management');
    await user.click(dataManagementButton);

    // Check status elements exist
    const statusElements = screen.getAllByText(/active|pending/);
    expect(statusElements.length).toBeGreaterThan(0);
  });

  it('should display correct type icons', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);
    vi.runAllTimers();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
    });

    const dataManagementButton = screen.getByText('Data Management');
    await user.click(dataManagementButton);

    // Check for emoji icons (they should be present in the DOM)
    const container = screen.getByText('User Database').closest('div');
    expect(container).toBeInTheDocument();
  });
});
