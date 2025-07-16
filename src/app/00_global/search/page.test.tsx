import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SearchPage from './page';

describe('SearchPage', () => {
  it('should render the search page', () => {
    render(<SearchPage />);

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('サイト内検索')).toBeInTheDocument();
  });

  it('should display search functionality placeholder', () => {
    render(<SearchPage />);

    expect(screen.getByText('検索機能')).toBeInTheDocument();
    expect(screen.getByText('サイト内検索機能の実装予定です。')).toBeInTheDocument();
  });
});
