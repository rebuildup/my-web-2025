import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BusinessMailBlocker from './BusinessMailBlocker';

// Mock clipboard API
vi.mock('navigator.clipboard', () => ({
  writeText: vi.fn(),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Copy: () => <div data-testid="copy-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  Check: () => <div data-testid="check-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('BusinessMailBlocker', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();

    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement for anchor element
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
    };

    const originalCreateElement = document.createElement;
    document.createElement = vi.fn(tag => {
      if (tag === 'a') return mockAnchor;
      return originalCreateElement(tag);
    });
  });

  it('should render the business mail blocker component', () => {
    render(<BusinessMailBlocker />);

    expect(screen.getByText('Business Mail Blocker')).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter email addresses/)).toBeInTheDocument();
    expect(screen.getByText('Analyze Emails')).toBeInTheDocument();
  });

  it('should analyze emails when button is clicked', async () => {
    render(<BusinessMailBlocker />);

    // Enter emails
    const textarea = screen.getByPlaceholderText(/example@company.com/);
    fireEvent.change(textarea, {
      target: {
        value: 'info@company.com\npersonal@gmail.com',
      },
    });

    // Click analyze button
    const analyzeButton = screen.getByText('Analyze Emails');
    fireEvent.click(analyzeButton);

    // Check if results are displayed
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
      expect(screen.getByText('Total Emails')).toBeInTheDocument();
      expect(screen.getByText('Business Emails')).toBeInTheDocument();
      expect(screen.getByText('Personal Emails')).toBeInTheDocument();
    });

    // Check if emails are in the table
    expect(screen.getByText('info@company.com')).toBeInTheDocument();
    expect(screen.getByText('personal@gmail.com')).toBeInTheDocument();

    // Check if domains are displayed
    expect(screen.getByText('company.com')).toBeInTheDocument();
    expect(screen.getByText('gmail.com')).toBeInTheDocument();
  });

  it('should filter results when filter buttons are clicked', async () => {
    render(<BusinessMailBlocker />);

    // Enter emails
    const textarea = screen.getByPlaceholderText(/example@company.com/);
    fireEvent.change(textarea, {
      target: {
        value: 'info@company.com\npersonal@gmail.com\nsales@business.org',
      },
    });

    // Click analyze button
    const analyzeButton = screen.getByText('Analyze Emails');
    fireEvent.click(analyzeButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });

    // Click business only filter
    const businessOnlyButton = screen.getByText('Business Only');
    fireEvent.click(businessOnlyButton);

    // Check if only business emails are displayed
    expect(screen.getByText('info@company.com')).toBeInTheDocument();
    expect(screen.getByText('sales@business.org')).toBeInTheDocument();
    expect(screen.queryByText('personal@gmail.com')).not.toBeInTheDocument();

    // Click personal only filter
    const personalOnlyButton = screen.getByText('Personal Only');
    fireEvent.click(personalOnlyButton);

    // Check if only personal emails are displayed
    expect(screen.queryByText('info@company.com')).not.toBeInTheDocument();
    expect(screen.queryByText('sales@business.org')).not.toBeInTheDocument();
    expect(screen.getByText('personal@gmail.com')).toBeInTheDocument();

    // Click show all filter
    const showAllButton = screen.getByText('Show All');
    fireEvent.click(showAllButton);

    // Check if all emails are displayed
    expect(screen.getByText('info@company.com')).toBeInTheDocument();
    expect(screen.getByText('sales@business.org')).toBeInTheDocument();
    expect(screen.getByText('personal@gmail.com')).toBeInTheDocument();
  });

  it('should copy filtered emails when copy button is clicked', async () => {
    render(<BusinessMailBlocker />);

    // Enter emails
    const textarea = screen.getByPlaceholderText(/example@company.com/);
    fireEvent.change(textarea, {
      target: {
        value: 'info@company.com\npersonal@gmail.com',
      },
    });

    // Click analyze button
    const analyzeButton = screen.getByText('Analyze Emails');
    fireEvent.click(analyzeButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });

    // Click copy emails button
    const copyButton = screen.getByText('Copy Emails');
    fireEvent.click(copyButton);

    // Check if clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('info@company.com')
    );
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('personal@gmail.com')
    );

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText('Filtered emails copied!')).toBeInTheDocument();
    });

    // Message should disappear after timeout
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Filtered emails copied!')).not.toBeInTheDocument();
    });
  });

  it('should export results when export buttons are clicked', async () => {
    render(<BusinessMailBlocker />);

    // Enter emails
    const textarea = screen.getByPlaceholderText(/example@company.com/);
    fireEvent.change(textarea, {
      target: {
        value: 'info@company.com\npersonal@gmail.com',
      },
    });

    // Click analyze button
    const analyzeButton = screen.getByText('Analyze Emails');
    fireEvent.click(analyzeButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });

    // Click export CSV button
    const exportCsvButton = screen.getByText('Export CSV');
    fireEvent.click(exportCsvButton);

    // Check if anchor was created and clicked
    expect(document.createElement).toHaveBeenCalledWith('a');
    const mockAnchor = document.createElement('a');
    expect(mockAnchor.download).toMatch(/email-analysis-.+\.csv/);
    expect(mockAnchor.click).toHaveBeenCalled();

    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText('Results exported as CSV')).toBeInTheDocument();
    });

    // Reset mocks
    vi.clearAllMocks();
    (mockAnchor.click as ReturnType<typeof vi.fn>).mockClear();

    // Click export JSON button
    const exportJsonButton = screen.getByText('Export JSON');
    fireEvent.click(exportJsonButton);

    // Check if anchor was created and clicked
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.download).toMatch(/email-analysis-.+\.json/);
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('should clear all data when clear button is clicked', async () => {
    render(<BusinessMailBlocker />);

    // Enter emails
    const textarea = screen.getByPlaceholderText(/example@company.com/);
    fireEvent.change(textarea, {
      target: {
        value: 'info@company.com\npersonal@gmail.com',
      },
    });

    // Click analyze button
    const analyzeButton = screen.getByText('Analyze Emails');
    fireEvent.click(analyzeButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Analysis Results')).toBeInTheDocument();
    });

    // Click clear button
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    // Check if data is cleared
    expect(textarea).toHaveValue('');
    expect(screen.queryByText('Analysis Results')).not.toBeInTheDocument();
  });

  it('should show error when trying to analyze without emails', async () => {
    render(<BusinessMailBlocker />);

    // Click analyze button without entering emails
    const analyzeButton = screen.getByText('Analyze Emails');
    fireEvent.click(analyzeButton);

    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText('Please enter at least one email address')).toBeInTheDocument();
    });

    // Message should disappear after timeout
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText('Please enter at least one email address')).not.toBeInTheDocument();
    });
  });
});
