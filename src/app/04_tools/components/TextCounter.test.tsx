import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TextCounter from './TextCounter';

// ... (mocks)

describe('TextCounter Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update character and word counts', async () => {
    render(<TextCounter />);
    const textarea = screen.getByPlaceholderText(/Paste or type your text here/);
    await user.type(textarea, 'Hello world.');
    screen.debug();
    await waitFor(() => {
      const statsSection = screen.getByRole('heading', { name: /Basic Statistics/ }).parentElement!;
      expect(within(statsSection).getByText('12')).toBeInTheDocument();
      expect(within(statsSection).getByText('2')).toBeInTheDocument();
      expect(within(statsSection).getByText('1')).toBeInTheDocument();
    });
  });

  // ... (other tests)
});