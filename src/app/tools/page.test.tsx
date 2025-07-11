import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToolsPage from './page';

// Mock Next.js modules
vi.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

describe('Tools Page', () => {
  it('should render the tools page', () => {
    render(<ToolsPage />);

    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
    expect(screen.getByText('便利なWebツール集')).toBeInTheDocument();
    expect(screen.getByText(/実用的なWebツールのコレクション/)).toBeInTheDocument();
  });

  it('should render statistics section', () => {
    render(<ToolsPage />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('総ツール数')).toBeInTheDocument();

    expect(screen.getByText('4.7K')).toBeInTheDocument();
    expect(screen.getByText('月間利用数')).toBeInTheDocument();

    expect(screen.getByText('98%')).toBeInTheDocument();
    expect(screen.getByText('稼働率')).toBeInTheDocument();

    expect(screen.getByText('24/7')).toBeInTheDocument();
    expect(screen.getByText('利用可能')).toBeInTheDocument();
  });

  it('should render Popular Tools section', () => {
    render(<ToolsPage />);

    expect(screen.getByRole('heading', { name: 'Popular Tools' })).toBeInTheDocument();

    // Color Palette
    expect(screen.getByRole('heading', { name: 'Color Palette' })).toBeInTheDocument();
    expect(screen.getByText('カラーパレット生成ツール')).toBeInTheDocument();
    expect(screen.getByText('• ランダムカラー生成')).toBeInTheDocument();
    expect(screen.getByText('• ハーモニーカラー計算')).toBeInTheDocument();
    expect(screen.getByText('• HEX・RGB・HSL対応')).toBeInTheDocument();
    expect(screen.getByText('• ワンクリックコピー')).toBeInTheDocument();
    expect(screen.getByText('1,247 利用 →')).toBeInTheDocument();

    // QR Generator
    expect(screen.getByRole('heading', { name: 'QR Generator' })).toBeInTheDocument();
    expect(screen.getByText('QRコード生成ツール')).toBeInTheDocument();
    expect(screen.getByText('• テキスト・URL対応')).toBeInTheDocument();
    expect(screen.getByText('• サイズ・エラー訂正レベル設定')).toBeInTheDocument();
    expect(screen.getByText('• PNG・SVG出力')).toBeInTheDocument();
    expect(screen.getByText('• 即座にダウンロード')).toBeInTheDocument();
    expect(screen.getByText('934 利用 →')).toBeInTheDocument();

    // Price Calculator
    expect(screen.getByRole('heading', { name: 'Price Calculator' })).toBeInTheDocument();
    expect(screen.getByText('制作依頼料金計算機')).toBeInTheDocument();
    expect(screen.getByText('• 開発・映像制作対応')).toBeInTheDocument();
    expect(screen.getByText('• 期間・オプション計算')).toBeInTheDocument();
    expect(screen.getByText('• 詳細な内訳表示')).toBeInTheDocument();
    expect(screen.getByText('• 見積書PDF出力')).toBeInTheDocument();
    expect(screen.getByText('687 利用 →')).toBeInTheDocument();
  });

  it('should render popular tools with correct links', () => {
    render(<ToolsPage />);

    const colorPaletteLink = screen.getByRole('link', { name: /Color Palette/ });
    expect(colorPaletteLink).toHaveAttribute('href', '/tools/color-palette');

    const qrGeneratorLink = screen.getByRole('link', { name: /QR Generator/ });
    expect(qrGeneratorLink).toHaveAttribute('href', '/tools/qr-generator');

    const priceCalculatorLink = screen.getByRole('link', { name: /Price Calculator/ });
    expect(priceCalculatorLink).toHaveAttribute('href', '/tools/price-calculator');
  });

  it('should render All Tools section', () => {
    render(<ToolsPage />);

    expect(screen.getByRole('heading', { name: 'All Tools' })).toBeInTheDocument();

    // AE Expression
    expect(screen.getByRole('heading', { name: 'AE Expression' })).toBeInTheDocument();
    expect(screen.getByText(/After Effectsエクスプレッション生成・編集ツール/)).toBeInTheDocument();

    // Business Mail Block
    expect(screen.getByRole('heading', { name: 'Business Mail Block' })).toBeInTheDocument();
    expect(screen.getByText(/ビジネスメールテンプレート生成ツール/)).toBeInTheDocument();

    // Text Counter
    expect(screen.getByRole('heading', { name: 'Text Counter' })).toBeInTheDocument();
    expect(
      screen.getByText(/テキストの文字数・単語数・行数をリアルタイムカウント/)
    ).toBeInTheDocument();

    // PNG Preview
    expect(screen.getByRole('heading', { name: 'PNG Preview' })).toBeInTheDocument();
    expect(screen.getByText(/連番PNG画像のプレビューツール/)).toBeInTheDocument();

    // SVG to TSX
    expect(screen.getByRole('heading', { name: 'SVG to TSX' })).toBeInTheDocument();
    expect(screen.getByText(/SVGファイルをReact TSXコンポーネントに変換/)).toBeInTheDocument();

    // Pi Game
    expect(screen.getByRole('heading', { name: 'Pi Game' })).toBeInTheDocument();
    expect(screen.getByText(/円周率記憶ゲーム/)).toBeInTheDocument();

    // Pomodoro Timer
    expect(screen.getByRole('heading', { name: 'Pomodoro Timer' })).toBeInTheDocument();
    expect(screen.getByText(/ポモドーロテクニック用タイマー/)).toBeInTheDocument();

    // ProtoType
    expect(screen.getByRole('heading', { name: 'ProtoType' })).toBeInTheDocument();
    expect(screen.getByText(/プロトタイピング・アイデア検証ツール/)).toBeInTheDocument();

    // More Tools
    expect(screen.getByRole('heading', { name: 'More Tools' })).toBeInTheDocument();
    expect(screen.getByText('Coming Soon...')).toBeInTheDocument();
  });

  it('should render all tools with correct links', () => {
    render(<ToolsPage />);

    expect(screen.getByRole('link', { name: /AE Expression/ })).toHaveAttribute(
      'href',
      '/tools/ae-expression'
    );
    expect(screen.getByRole('link', { name: /Business Mail Block/ })).toHaveAttribute(
      'href',
      '/tools/business-mail-block'
    );
    expect(screen.getByRole('link', { name: /Text Counter/ })).toHaveAttribute(
      'href',
      '/tools/text-counter'
    );
    expect(screen.getByRole('link', { name: /PNG Preview/ })).toHaveAttribute(
      'href',
      '/tools/sequential-png-preview'
    );
    expect(screen.getByRole('link', { name: /SVG to TSX/ })).toHaveAttribute(
      'href',
      '/tools/svg2tsx'
    );
    expect(screen.getByRole('link', { name: /Pi Game/ })).toHaveAttribute('href', '/tools/pi-game');
    expect(screen.getByRole('link', { name: /Pomodoro Timer/ })).toHaveAttribute(
      'href',
      '/tools/pomodoro'
    );
    expect(screen.getByRole('link', { name: /ProtoType/ })).toHaveAttribute(
      'href',
      '/tools/prototype'
    );
  });

  it('should render tool tags correctly', () => {
    render(<ToolsPage />);

    // AE Expression tags
    expect(screen.getByText('After Effects')).toBeInTheDocument();
    expect(screen.getByText('Expression')).toBeInTheDocument();

    // Business Mail Block tags
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();

    // Text Counter tags
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Counter')).toBeInTheDocument();

    // PNG Preview tags
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();

    // SVG to TSX tags
    expect(screen.getByText('SVG')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();

    // Pi Game tags
    expect(screen.getByText('Game')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();

    // Pomodoro Timer tags
    expect(screen.getByText('Timer')).toBeInTheDocument();
    expect(screen.getByText('Productivity')).toBeInTheDocument();

    // ProtoType tags
    expect(screen.getByText('Prototype')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('should render Usage Statistics section', () => {
    render(<ToolsPage />);

    expect(screen.getByRole('heading', { name: 'Usage Statistics' })).toBeInTheDocument();

    // 人気ツールランキング
    expect(screen.getByRole('heading', { name: '人気ツールランキング' })).toBeInTheDocument();
    expect(screen.getByText('Color Palette')).toBeInTheDocument();
    expect(screen.getByText('1,247 利用')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();

    expect(screen.getByText('QR Generator')).toBeInTheDocument();
    expect(screen.getByText('934 利用')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();

    expect(screen.getByText('Price Calculator')).toBeInTheDocument();
    expect(screen.getByText('687 利用')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();

    // 新着ツール
    expect(screen.getByRole('heading', { name: '新着ツール' })).toBeInTheDocument();
    expect(screen.getByText('SVG to TSX')).toBeInTheDocument();
    expect(screen.getByText('2025/01/15 追加')).toBeInTheDocument();

    expect(screen.getByText('PNG Preview')).toBeInTheDocument();
    expect(screen.getByText('2025/01/10 追加')).toBeInTheDocument();

    expect(screen.getByText('ProtoType')).toBeInTheDocument();
    expect(screen.getByText('2025/01/05 追加')).toBeInTheDocument();

    // Status badges
    expect(screen.getAllByText('NEW')).toHaveLength(2);
    expect(screen.getByText('BETA')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<ToolsPage />);

    expect(screen.getByRole('link', { name: '← Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'About →' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Portfolio →' })).toHaveAttribute('href', '/portfolio');
    expect(screen.getByRole('link', { name: 'Workshop →' })).toHaveAttribute('href', '/workshop');
  });

  it('should render JSON-LD script', () => {
    render(<ToolsPage />);

    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();

    const jsonContent = JSON.parse(jsonLdScript?.textContent || '{}');
    expect(jsonContent['@context']).toBe('https://schema.org');
    expect(jsonContent['@type']).toBe('CollectionPage');
    expect(jsonContent.name).toBe('samuido Tools');
    expect(jsonContent.description).toBe('実用的なWebツールのコレクション');
    expect(jsonContent.url).toBe('https://yusuke-kim.com/tools');
  });

  it('should render popular tools in grid layout', () => {
    render(<ToolsPage />);

    const popularToolsSection = screen
      .getByRole('heading', { name: 'Popular Tools' })
      .closest('section');
    const toolCards = popularToolsSection?.querySelectorAll('a[href^="/tools/"]');

    expect(toolCards).toHaveLength(3);
  });

  it('should render all tools in grid layout', () => {
    render(<ToolsPage />);

    const allToolsSection = screen.getByRole('heading', { name: 'All Tools' }).closest('section');
    const toolLinks = allToolsSection?.querySelectorAll('a[href^="/tools/"]');

    expect(toolLinks).toHaveLength(8); // 8 tools + 1 "More Tools" placeholder
  });

  it('should have proper accessibility structure', () => {
    render(<ToolsPage />);

    // Check heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1, name: 'Tools' });
    expect(h1).toBeInTheDocument();

    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThan(0);

    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBeGreaterThan(0);
  });

  it('should render hover effects for tool cards', () => {
    render(<ToolsPage />);

    const colorPaletteCard = screen.getByRole('link', { name: /Color Palette/ });
    expect(colorPaletteCard).toHaveClass('hover:border-blue-500');

    const qrGeneratorCard = screen.getByRole('link', { name: /QR Generator/ });
    expect(qrGeneratorCard).toHaveClass('hover:border-blue-500');
  });

  it('should display usage numbers correctly', () => {
    render(<ToolsPage />);

    // Check that popular tools display usage numbers
    expect(screen.getByText('1,247 利用 →')).toBeInTheDocument();
    expect(screen.getByText('934 利用 →')).toBeInTheDocument();
    expect(screen.getByText('687 利用 →')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => render(<ToolsPage />)).not.toThrow();
  });
});
