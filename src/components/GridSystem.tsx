import React from 'react';

/**
 * 384px基準のグリッドシステム
 * 画面幅に応じて384px倍数での幅制御を行い、中央揃えで表示
 */

// メインレイアウトラッパー（背景とページ全体の構造）
export const GridLayout: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  background?: boolean;
}> = ({ 
  children, 
  className = '',
  background = true 
}) => (
  <div className={`${background ? 'bg-background' : ''} min-h-screen ${className}`}>
    {children}
  </div>
);

// 384px倍数での幅制御とセンタリング
export const GridContainer: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  padding?: boolean;
}> = ({ 
  children, 
  className = '',
  padding = true 
}) => (
  <div className="mx-auto w-full max-w-grid-xs xs:max-w-grid-xs md:max-w-grid-md xl:max-w-grid-xl 2xl:max-w-grid-2xl">
    <div className={`${padding ? 'px-4 xs:px-6 md:px-8' : ''} ${className}`}>
      {children}
    </div>
  </div>
);

// レスポンシブグリッドコンテンツ（列数可変）
export const GridContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  cols?: {
    xs?: number;
    md?: number;
    xl?: number;
    '2xl'?: number;
  };
}> = ({ 
  children, 
  className = '',
  cols = { xs: 1, md: 2, xl: 3, '2xl': 3 }
}) => {
  const gridCols = [
    cols.xs ? `grid-cols-${cols.xs}` : 'grid-cols-1',
    cols.md ? `md:grid-cols-${cols.md}` : 'md:grid-cols-2',
    cols.xl ? `xl:grid-cols-${cols.xl}` : 'xl:grid-cols-3',
    cols['2xl'] ? `2xl:grid-cols-${cols['2xl']}` : '2xl:grid-cols-3',
  ].join(' ');

  return (
    <div className={`grid gap-4 xs:gap-6 md:gap-8 ${gridCols} ${className}`}>
      {children}
    </div>
  );
};

// セクション用ラッパー
export const GridSection: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}> = ({ 
  children, 
  className = '',
  spacing = 'md'
}) => {
  const spacingClass = {
    sm: 'py-8',
    md: 'py-12 xs:py-16',
    lg: 'py-16 xs:py-20 md:py-24',
  }[spacing];

  return (
    <section className={`${spacingClass} ${className}`}>
      <GridContainer>
        {children}
      </GridContainer>
    </section>
  );
};

export default GridLayout;
