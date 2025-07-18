import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import AboutPage from './page';

describe('About Page', () => {
  it('should render without crashing', () => {
    const { container } = render(<AboutPage />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });

  it('should render profile descriptions', () => {
    const { container } = render(<AboutPage />);

    // Check for profile descriptions
    const text = container.textContent;
    expect(text).toContain('採用担当者や企業向けの正式な自己紹介');
    expect(text).toContain('同業者向けのラフな自己紹介');
  });

  it('should render contact information', () => {
    const { container } = render(<AboutPage />);

    // Check for contact information
    const text = container.textContent;
    expect(text).toContain('361do.sleep@gmail.com');
    expect(text).toContain('@361do_sleep');
    expect(text).toContain('@361do_design');
  });

  it('should render featured works section', () => {
    const { container } = render(<AboutPage />);

    // Check for skills and achievements
    const text = container.textContent;
    expect(text).toContain('スキル & 実績');
    expect(text).toContain('受賞歴');
    expect(text).toContain('U-16プログラミングコンテスト');
  });
});
