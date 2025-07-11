import React from 'react';

/**
 * Tailwind CSS v4対応 384px基準グリッドシステム
 *
 * v4の新機能:
 * - CSS-first設定
 * - 動的ユーティリティ値（無制限グリッドサイズ）
 * - 内蔵コンテナクエリ
 * - subgridサポート
 */

// メインレイアウトラッパー
export const GridLayout: React.FC<{
  children: React.ReactNode;
  className?: string;
  background?: boolean;
}> = ({ children, className = '', background = true }) => (
  <div
    className={`${background ? 'bg-[var(--color-background)]' : ''} min-h-screen text-[var(--color-foreground)] ${className}`}
  >
    {children}
  </div>
);

// 384px基準のコンテナ（CSS-first設定を使用）
export const GridContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}> = ({ children, className = '', padding = true }) => (
  <div className="container-grid">
    <div className={`${padding ? 'xs:px-6 px-4 md:px-8' : ''} ${className}`}>{children}</div>
  </div>
);

// v4の動的ユーティリティ値を活用したレスポンシブグリッド
export const GridContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  cols?: {
    base?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}> = ({ children, className = '', cols = { base: 1, md: 2, xl: 3, '2xl': 4 }, gap = 'md' }) => {
  // v4の動的ユーティリティ値：任意の数値でgrid-colsが使用可能
  const gapClass = {
    sm: 'gap-2 xs:gap-3 md:gap-4',
    md: 'gap-4 xs:gap-6 md:gap-8',
    lg: 'gap-6 xs:gap-8 md:gap-12',
  }[gap];

  // v4では grid-cols-15 なども設定なしで使用可能
  const gridCols = [
    cols.base ? `grid-cols-${cols.base}` : 'grid-cols-1',
    cols.xs ? `xs:grid-cols-${cols.xs}` : '',
    cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : 'md:grid-cols-2',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.xl ? `xl:grid-cols-${cols.xl}` : 'xl:grid-cols-3',
    cols['2xl'] ? `2xl:grid-cols-${cols['2xl']}` : '2xl:grid-cols-4',
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={`grid ${gapClass} ${gridCols} ${className}`}>{children}</div>;
};

// コンテナクエリ対応グリッド（v4新機能）
export const ContainerGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`@container ${className}`}>
    <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-4">{children}</div>
  </div>
);

// subgrid対応コンポーネント（v4新機能）
export const SubGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  cols?: number;
}> = ({ children, className = '', cols = 3 }) => (
  <div className={`col-span-${cols} grid grid-cols-subgrid gap-4 ${className}`}>{children}</div>
);

// セクション用ラッパー
export const GridSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  container?: boolean;
}> = ({ children, className = '', spacing = 'md', container = true }) => {
  const spacingClass = {
    sm: 'py-6 xs:py-8',
    md: 'py-8 xs:py-12 md:py-16',
    lg: 'py-12 xs:py-16 md:py-20 xl:py-24',
    xl: 'py-16 xs:py-20 md:py-24 xl:py-32',
  }[spacing];

  const content = container ? <GridContainer>{children}</GridContainer> : children;

  return <section className={`${spacingClass} ${className}`}>{content}</section>;
};

// グリッドアイテム
export const GridItem: React.FC<{
  children: React.ReactNode;
  className?: string;
  span?: {
    base?: number;
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
}> = ({ children, className = '', span }) => {
  const spanClasses = span
    ? [
        span.base ? `col-span-${span.base}` : '',
        span.xs ? `xs:col-span-${span.xs}` : '',
        span.sm ? `sm:col-span-${span.sm}` : '',
        span.md ? `md:col-span-${span.md}` : '',
        span.lg ? `lg:col-span-${span.lg}` : '',
        span.xl ? `xl:col-span-${span.xl}` : '',
        span['2xl'] ? `2xl:col-span-${span['2xl']}` : '',
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return <div className={`${spanClasses} ${className}`.trim()}>{children}</div>;
};

// 任意の値サポート（v4新機能）
export const AutoFitGrid: React.FC<{
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}> = ({ children, minWidth = '384px', className = '' }) => (
  <div
    className={`grid grid-cols-[repeat(auto-fit,minmax(min(100%,${minWidth}),1fr))] gap-4 ${className}`}
  >
    {children}
  </div>
);

export default GridLayout;
