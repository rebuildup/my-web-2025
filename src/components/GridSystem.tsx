import React from 'react';

interface GridSystemProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * 12-Column Grid System Component
 * 
 * A modern, flexible grid system built with CSS Grid and Tailwind CSS v4.
 * Provides responsive design capabilities with mobile-first approach.
 */
export const GridContainer: React.FC<GridSystemProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid-container ${className}`}>
      {children}
    </div>
  );
};

interface GridItemProps {
  children?: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  smSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  mdSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  lgSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  xlSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  xl2Span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  order?: number;
  smOrder?: number;
  mdOrder?: number;
  lgOrder?: number;
  xlOrder?: number;
  xl2Order?: number;
}

export const GridItem: React.FC<GridItemProps> = ({ 
  children, 
  className = '', 
  span = 12,
  smSpan,
  mdSpan,
  lgSpan,
  xlSpan,
  xl2Span,
  order,
  smOrder,
  mdOrder,
  lgOrder,
  xlOrder,
  xl2Order
}) => {
  const getSpanClass = (breakpoint: string, spanValue?: number) => {
    if (!spanValue) return '';
    return breakpoint === '' 
      ? `col-${spanValue}` 
      : `${breakpoint}:col-${spanValue}`;
  };

  const getOrderClass = (breakpoint: string, orderValue?: number) => {
    if (!orderValue) return '';
    return breakpoint === '' 
      ? `order-${orderValue}` 
      : `${breakpoint}:order-${orderValue}`;
  };

  const classes = [
    className,
    getSpanClass('', span),
    getSpanClass('sm', smSpan),
    getSpanClass('md', mdSpan),
    getSpanClass('lg', lgSpan),
    getSpanClass('xl', xlSpan),
    getSpanClass('2xl', xl2Span),
    getOrderClass('', order),
    getOrderClass('sm', smOrder),
    getOrderClass('md', mdOrder),
    getOrderClass('lg', lgOrder),
    getOrderClass('xl', xlOrder),
    getOrderClass('2xl', xl2Order),
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

/**
 * Grid System Demo Component
 * 
 * Demonstrates the capabilities of the 12-column grid system
 */
export const GridSystemDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray text-white">
      <h2 className="text-golden-xl mb-8 text-center">12-Column Grid System Demo</h2>
      
      {/* Basic Grid Example */}
      <section className="mb-12">
        <h3 className="text-golden-lg mb-4">Basic Grid Layout</h3>
        <GridContainer className="gap-4">
          <GridItem span={12} className="bg-primary bg-opacity-20 p-4 text-center">
            12 Columns
          </GridItem>
          <GridItem span={6} className="bg-primary bg-opacity-20 p-4 text-center">
            6 Columns
          </GridItem>
          <GridItem span={6} className="bg-primary bg-opacity-20 p-4 text-center">
            6 Columns
          </GridItem>
          <GridItem span={4} className="bg-primary bg-opacity-20 p-4 text-center">
            4 Columns
          </GridItem>
          <GridItem span={4} className="bg-primary bg-opacity-20 p-4 text-center">
            4 Columns
          </GridItem>
          <GridItem span={4} className="bg-primary bg-opacity-20 p-4 text-center">
            4 Columns
          </GridItem>
        </GridContainer>
      </section>

      {/* Responsive Grid Example */}
      <section className="mb-12">
        <h3 className="text-golden-lg mb-4">Responsive Grid Layout</h3>
        <GridContainer className="gap-4">
          <GridItem 
            span={12} 
            mdSpan={6} 
            lgSpan={4} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            Responsive: 12 → 6 → 4
          </GridItem>
          <GridItem 
            span={12} 
            mdSpan={6} 
            lgSpan={4} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            Responsive: 12 → 6 → 4
          </GridItem>
          <GridItem 
            span={12} 
            mdSpan={12} 
            lgSpan={4} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            Responsive: 12 → 12 → 4
          </GridItem>
        </GridContainer>
      </section>

      {/* Order Control Example */}
      <section className="mb-12">
        <h3 className="text-golden-lg mb-4">Order Control</h3>
        <GridContainer className="gap-4">
          <GridItem 
            span={4} 
            order={3} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            First (Order 3)
          </GridItem>
          <GridItem 
            span={4} 
            order={1} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            Second (Order 1)
          </GridItem>
          <GridItem 
            span={4} 
            order={2} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            Third (Order 2)
          </GridItem>
        </GridContainer>
      </section>

      {/* Complex Layout Example */}
      <section>
        <h3 className="text-golden-lg mb-4">Complex Layout Example</h3>
        <GridContainer className="gap-4">
          <GridItem span={12} className="bg-primary bg-opacity-20 p-4 text-center">
            Header (12 columns)
          </GridItem>
          <GridItem 
            span={12} 
            mdSpan={8} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            Main Content (12 → 8)
          </GridItem>
          <GridItem 
            span={12} 
            mdSpan={4} 
            className="bg-primary bg-opacity-20 p-4 text-center"
          >
            Sidebar (12 → 4)
          </GridItem>
          <GridItem span={12} className="bg-primary bg-opacity-20 p-4 text-center">
            Footer (12 columns)
          </GridItem>
        </GridContainer>
      </section>
    </div>
  );
};

export default GridSystemDemo;