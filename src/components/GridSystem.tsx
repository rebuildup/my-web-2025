import React from 'react';

/**
 * Ultrathink Grid System
 * Uses Tailwind's native grid classes directly
 */
export const GridContainer: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`grid grid-cols-12 gap-4 ${className}`}>{children}</div>;

export const GridItem: React.FC<{ children?: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={className}>{children}</div>;

// No demo needed - use Tailwind classes directly
export default GridContainer;
