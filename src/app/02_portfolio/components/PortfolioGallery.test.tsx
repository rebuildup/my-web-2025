import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioGallery from './PortfolioGallery';

// Mock fetch globally
global.fetch = vi.fn();

describe('PortfolioGallery Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Portfolio Gallery component', () => {
    render(<PortfolioGallery />);

    expect(screen.getByRole('heading', { name: 'Portfolio Gallery' })).toBeInTheDocument();
  });

  it('should display all portfolio items by default', () => {
    render(<PortfolioGallery />);

    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.getByText('3D Interactive Experience')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
  });

  it('should display filter buttons', () => {
    render(<PortfolioGallery />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Web' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument();
  });

  it('should filter items by category', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    // Click Web filter
    const webButton = screen.getByRole('button', { name: 'Web' });
    await user.click(webButton);

    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();
    expect(screen.queryByText('Mobile App Design')).not.toBeInTheDocument();
  });

  it('should filter by 3D category', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const threeDButton = screen.getByRole('button', { name: '3d' });
    await user.click(threeDButton);

    expect(screen.getByText('3D Interactive Experience')).toBeInTheDocument();
    expect(screen.queryByText('Web Application Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Mobile App Design')).not.toBeInTheDocument();
  });

  it('should filter by Design category', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const designButton = screen.getByRole('button', { name: 'Design' });
    await user.click(designButton);

    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
    expect(screen.queryByText('Web Application Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();
  });

  it('should show all items when All filter is selected', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    // First filter by web
    await user.click(screen.getByRole('button', { name: 'Web' }));
    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();

    // Then show all
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.getByText('3D Interactive Experience')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
  });

  it('should display project descriptions', () => {
    render(<PortfolioGallery />);

    expect(
      screen.getByText('Modern responsive dashboard with real-time data visualization')
    ).toBeInTheDocument();
    expect(screen.getByText('Immersive 3D environment built with Three.js')).toBeInTheDocument();
    expect(screen.getByText('Clean and intuitive mobile interface design')).toBeInTheDocument();
  });

  it('should display technology tags', () => {
    render(<PortfolioGallery />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();
    expect(screen.getByText('Three.js')).toBeInTheDocument();
    expect(screen.getByText('WebGL')).toBeInTheDocument();
    expect(screen.getByText('Figma')).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<PortfolioGallery />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

    const heading = screen.getByRole('heading', { name: 'Portfolio Gallery' });
    expect(heading).toHaveClass(
      'neue-haas-grotesk-display',
      'mb-4',
      'text-xl',
      'font-bold',
      'text-blue-500'
    );
  });

  it('should handle button interactions', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    const codeButtons = screen.getAllByRole('button', { name: /code/i });

    expect(viewButtons.length).toBeGreaterThan(0);
    expect(codeButtons.length).toBeGreaterThan(0);

    // Test that buttons are clickable
    await user.click(viewButtons[0]);
    await user.click(codeButtons[0]);
  });
});
