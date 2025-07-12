import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import SearchPage from './page';

describe('SearchPage', () => {
  it('should render the search page', () => {
    render(<SearchPage />);

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('サイト内検索')).toBeInTheDocument();
  });

  it('should handle search with mixed content', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('検索キーワードを入力...');
    await user.type(searchInput, 'React Next.js');

    expect(searchInput).toHaveValue('React Next.js');
  });
});
