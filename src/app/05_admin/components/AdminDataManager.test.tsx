import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDataManager from './AdminDataManager';

describe('AdminDataManager', () => {
  beforeEach(() => {
    // No mocks to clear in this version
  });

  it('should render loading state initially and then the content', async () => {
    render(<AdminDataManager />);
    // Since data loading is synchronous in useEffect, the loading state is very brief.
    // We'll just check for the final state.
    await waitFor(() => {
      expect(screen.getByText('Admin Data Manager')).toBeInTheDocument();
    });
    expect(screen.queryByText('Loading admin data...')).not.toBeInTheDocument();
  });

  it('should render the admin data manager and switch tabs', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    // Switch to Data Management tab
    await user.click(screen.getByText('Data Management'));
    await waitFor(() => {
      expect(screen.getByText('User Database')).toBeInTheDocument();
    });

    // Switch to Settings tab
    await user.click(screen.getByText('Settings'));
    await waitFor(() => {
      expect(screen.getByText('System Settings')).toBeInTheDocument();
    });
  });

  it('should display correct data in overview', async () => {
    render(<AdminDataManager />);
    await waitFor(() => {
      expect(screen.getByText('1247')).toBeInTheDocument();
      expect(screen.getByText('89')).toBeInTheDocument();
      expect(screen.getByText('15,420')).toBeInTheDocument();
      expect(screen.getByText('2.3 GB')).toBeInTheDocument();
    });
  });

  it('should render all data types and statuses, and handle button clicks', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);

    // Wait for data to load and switch to the data tab
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Data Management'));

    // Check if all items are rendered
    await waitFor(() => {
      expect(screen.getByText('User Database')).toBeInTheDocument();
      expect(screen.getByText('Blog Posts')).toBeInTheDocument();
      expect(screen.getByText('Analytics Data')).toBeInTheDocument();
      expect(screen.getByText('Unknown Type Data')).toBeInTheDocument();
    });

    // Check for icons (indirectly testing getTypeIcon)
    expect(screen.getByText('👥')).toBeInTheDocument();
    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();

    // Check for statuses (indirectly testing getStatusColor)
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('inactive')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('unknown')).toBeInTheDocument();

    // Check button clicks
    const editButtons = screen.getAllByText('Edit');
    const deleteButtons = screen.getAllByText('Delete');

    expect(editButtons.length).toBe(4);
    expect(deleteButtons.length).toBe(4);

    await user.click(editButtons[0]);
    await user.click(deleteButtons[0]);

    // We don't have a real action, so we just ensure they are clickable without error
  });
});
