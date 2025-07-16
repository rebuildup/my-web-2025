import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToolsPage from './page';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Tools Page', () => {
  it('should render all tool cards with correct links', () => {
    render(<ToolsPage />);
    const tools = [
      { id: 'ae-expression', href: '/04_tools/ae-expression' },
      { id: 'business-mail-block', href: '/04_tools/business-mail-block' },
      { id: 'color-palette', href: '/04_tools/color-palette' },
    ];

    tools.forEach(tool => {
      const link = screen.getByTestId(`tool-link-${tool.id}`);
      expect(link).toHaveAttribute('href', tool.href);
    });
  });
});
