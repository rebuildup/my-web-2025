import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPalette from './ColorPalette';

describe('ColorPalette Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn(() => Promise.resolve()) },
      configurable: true,
    });
  });

  it('should copy color hex to clipboard when copy button is clicked', async () => {
    render(<ColorPalette />);
    const firstCopyButton = screen.getAllByRole('button', { name: /Copy/ })[0];

    await user.click(firstCopyButton);

    // Use a case-insensitive regex to match the hex value
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringMatching(/#3b82f6/i));
  });
});
