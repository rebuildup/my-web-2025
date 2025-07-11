import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioGallery from './PortfolioGallery';

describe('PortfolioGallery Component', () => {
  it('should render the portfolio gallery with title', () => {
    render(<PortfolioGallery />);

    expect(screen.getByRole('heading', { name: 'Portfolio Gallery' })).toBeInTheDocument();
    expect(screen.getByText('Portfolio Gallery')).toHaveClass('text-blue-500');
  });

  it('should render all category filter buttons', () => {
    render(<PortfolioGallery />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Web' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Design' })).toBeInTheDocument();
  });

  it('should have "All" category selected by default', () => {
    render(<PortfolioGallery />);

    const allButton = screen.getByRole('button', { name: 'All' });
    expect(allButton).toHaveClass('bg-blue-500', 'text-white');

    const webButton = screen.getByRole('button', { name: 'Web' });
    expect(webButton).toHaveClass('bg-gray-700', 'text-gray-300');
  });

  it('should render all portfolio items by default', () => {
    render(<PortfolioGallery />);

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

  it('should display technologies for each project', () => {
    render(<PortfolioGallery />);

    // Web Application Dashboard technologies
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Tailwind CSS')).toBeInTheDocument();

    // 3D Interactive Experience technologies
    expect(screen.getByText('Three.js')).toBeInTheDocument();
    expect(screen.getByText('WebGL')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    // Mobile App Design technologies
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText('Sketch')).toBeInTheDocument();
    expect(screen.getByText('Principle')).toBeInTheDocument();
  });

  it('should have View and Code buttons for each project', () => {
    render(<PortfolioGallery />);

    const viewButtons = screen.getAllByText('View');
    const codeButtons = screen.getAllByText('Code');

    expect(viewButtons).toHaveLength(3);
    expect(codeButtons).toHaveLength(3);

    viewButtons.forEach(button => {
      expect(button).toHaveClass('bg-blue-500');
    });

    codeButtons.forEach(button => {
      expect(button).toHaveClass('bg-gray-600');
    });
  });

  it('should filter projects by web category', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const webButton = screen.getByRole('button', { name: 'Web' });
    await user.click(webButton);

    // Should show only web project
    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();
    expect(screen.queryByText('Mobile App Design')).not.toBeInTheDocument();

    // Web button should be selected
    expect(webButton).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should filter projects by 3d category', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const threeDButton = screen.getByRole('button', { name: '3d' });
    await user.click(threeDButton);

    // Should show only 3D project
    expect(screen.getByText('3D Interactive Experience')).toBeInTheDocument();
    expect(screen.queryByText('Web Application Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Mobile App Design')).not.toBeInTheDocument();

    // 3D button should be selected
    expect(threeDButton).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should filter projects by design category', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const designButton = screen.getByRole('button', { name: 'Design' });
    await user.click(designButton);

    // Should show only design project
    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
    expect(screen.queryByText('Web Application Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();

    // Design button should be selected
    expect(designButton).toHaveClass('bg-blue-500', 'text-white');
  });

  it('should switch back to all projects when All button is clicked', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    // First filter by web
    await user.click(screen.getByRole('button', { name: 'Web' }));
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();

    // Then switch back to all
    await user.click(screen.getByRole('button', { name: 'All' }));

    // Should show all projects again
    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.getByText('3D Interactive Experience')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Design')).toBeInTheDocument();
  });

  it('should update button states when filtering', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const allButton = screen.getByRole('button', { name: 'All' });
    const webButton = screen.getByRole('button', { name: 'Web' });

    // Initially All should be selected
    expect(allButton).toHaveClass('bg-blue-500', 'text-white');
    expect(webButton).toHaveClass('bg-gray-700', 'text-gray-300');

    // Click Web button
    await user.click(webButton);

    // Web should be selected, All should be unselected
    expect(webButton).toHaveClass('bg-blue-500', 'text-white');
    expect(allButton).toHaveClass('bg-gray-700', 'text-gray-300');
  });

  it('should display project placeholders correctly', () => {
    render(<PortfolioGallery />);

    const projectImages = screen.getAllByText('Project Image');
    expect(projectImages).toHaveLength(3);

    projectImages.forEach(placeholder => {
      expect(placeholder).toBeInTheDocument();
      expect(placeholder).toHaveClass('text-sm');
    });
  });

  it('should have proper CSS classes for styling', () => {
    const { container } = render(<PortfolioGallery />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

    const gridDiv = container.querySelector('.grid');
    expect(gridDiv).toHaveClass('grid-cols-1', 'gap-6', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('should handle click events on View buttons', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const viewButtons = screen.getAllByText('View');

    // Click should not cause errors (functionality depends on implementation)
    await user.click(viewButtons[0]);
    expect(viewButtons[0]).toBeInTheDocument();
  });

  it('should handle click events on Code buttons', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    const codeButtons = screen.getAllByText('Code');

    // Click should not cause errors (functionality depends on implementation)
    await user.click(codeButtons[0]);
    expect(codeButtons[0]).toBeInTheDocument();
  });

  it('should display project titles with correct styling', () => {
    render(<PortfolioGallery />);

    const webTitle = screen.getByText('Web Application Dashboard');
    const threeDTitle = screen.getByText('3D Interactive Experience');
    const designTitle = screen.getByText('Mobile App Design');

    expect(webTitle).toHaveClass('text-lg', 'font-semibold', 'text-blue-400');
    expect(threeDTitle).toHaveClass('text-lg', 'font-semibold', 'text-blue-400');
    expect(designTitle).toHaveClass('text-lg', 'font-semibold', 'text-blue-400');
  });

  it('should display technology badges with correct styling', () => {
    render(<PortfolioGallery />);

    const reactBadge = screen.getByText('React');
    expect(reactBadge).toHaveClass(
      'rounded-none',
      'bg-gray-600',
      'px-2',
      'py-1',
      'text-xs',
      'text-gray-300'
    );
  });

  it('should maintain filter state across interactions', async () => {
    const user = userEvent.setup();
    render(<PortfolioGallery />);

    // Filter to web
    await user.click(screen.getByRole('button', { name: 'Web' }));
    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();

    // Click a View button - filter should remain
    const viewButton = screen.getByText('View');
    await user.click(viewButton);

    expect(screen.getByText('Web Application Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('3D Interactive Experience')).not.toBeInTheDocument();
  });
});
