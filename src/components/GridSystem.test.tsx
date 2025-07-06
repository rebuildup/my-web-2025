import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GridContainer, GridItem, GridSystemDemo } from './GridSystem';

describe('GridSystem Components', () => {
  describe('GridContainer', () => {
    it('renders with default grid-container class', () => {
      render(<GridContainer>Test Content</GridContainer>);
      const container = screen.getByText('Test Content').parentElement;
      expect(container).toHaveClass('grid-container');
    });

    it('accepts custom className', () => {
      render(<GridContainer className="custom-class">Test Content</GridContainer>);
      const container = screen.getByText('Test Content').parentElement;
      expect(container).toHaveClass('grid-container', 'custom-class');
    });

    it('renders children correctly', () => {
      render(
        <GridContainer>
          <div>Child 1</div>
          <div>Child 2</div>
        </GridContainer>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('GridItem', () => {
    it('renders with default col-12 class', () => {
      render(<GridItem>Test Content</GridItem>);
      const item = screen.getByText('Test Content');
      expect(item).toHaveClass('col-12');
    });

    it('applies custom span class', () => {
      render(<GridItem span={6}>Test Content</GridItem>);
      const item = screen.getByText('Test Content');
      expect(item).toHaveClass('col-6');
    });

    it('applies responsive span classes', () => {
      render(
        <GridItem 
          span={12} 
          smSpan={6} 
          mdSpan={4} 
          lgSpan={3} 
          xlSpan={2} 
          xl2Span={1}
        >
          Test Content
        </GridItem>
      );
      const item = screen.getByText('Test Content');
      expect(item).toHaveClass('col-12', 'sm:col-6', 'md:col-4', 'lg:col-3', 'xl:col-2', '2xl:col-1');
    });

    it('applies order classes', () => {
      render(
        <GridItem 
          order={3} 
          smOrder={2} 
          mdOrder={1}
        >
          Test Content
        </GridItem>
      );
      const item = screen.getByText('Test Content');
      expect(item).toHaveClass('order-3', 'sm:order-2', 'md:order-1');
    });

    it('accepts custom className', () => {
      render(<GridItem className="custom-item">Test Content</GridItem>);
      const item = screen.getByText('Test Content');
      expect(item).toHaveClass('custom-item', 'col-12');
    });

    it('filters out undefined responsive classes', () => {
      render(<GridItem span={6} smSpan={4}>Test Content</GridItem>);
      const item = screen.getByText('Test Content');
      expect(item).toHaveClass('col-6', 'sm:col-4');
      expect(item).not.toHaveClass('md:col-');
    });

    it('renders children correctly', () => {
      render(
        <GridItem>
          <span>Child Element</span>
        </GridItem>
      );
      expect(screen.getByText('Child Element')).toBeInTheDocument();
    });
  });

  describe('GridSystemDemo', () => {
    it('renders all demo sections', () => {
      render(<GridSystemDemo />);
      
      expect(screen.getByText('12-Column Grid System Demo')).toBeInTheDocument();
      expect(screen.getByText('Basic Grid Layout')).toBeInTheDocument();
      expect(screen.getByText('Responsive Grid Layout')).toBeInTheDocument();
      expect(screen.getByText('Order Control')).toBeInTheDocument();
      expect(screen.getByText('Complex Layout Example')).toBeInTheDocument();
    });

    it('renders basic grid examples', () => {
      render(<GridSystemDemo />);
      
      expect(screen.getByText('12 Columns')).toBeInTheDocument();
      expect(screen.getAllByText('6 Columns')).toHaveLength(2);
      expect(screen.getAllByText('4 Columns')).toHaveLength(3);
    });

    it('renders responsive grid examples', () => {
      render(<GridSystemDemo />);
      
      expect(screen.getAllByText('Responsive: 12 → 6 → 4')).toHaveLength(2);
      expect(screen.getByText('Responsive: 12 → 12 → 4')).toBeInTheDocument();
    });

    it('renders order control examples', () => {
      render(<GridSystemDemo />);
      
      expect(screen.getByText('First (Order 3)')).toBeInTheDocument();
      expect(screen.getByText('Second (Order 1)')).toBeInTheDocument();
      expect(screen.getByText('Third (Order 2)')).toBeInTheDocument();
    });

    it('renders complex layout examples', () => {
      render(<GridSystemDemo />);
      
      expect(screen.getByText('Header (12 columns)')).toBeInTheDocument();
      expect(screen.getByText('Main Content (12 → 8)')).toBeInTheDocument();
      expect(screen.getByText('Sidebar (12 → 4)')).toBeInTheDocument();
      expect(screen.getByText('Footer (12 columns)')).toBeInTheDocument();
    });

    it('applies correct CSS classes for styling', () => {
      render(<GridSystemDemo />);
      
      const mainContainer = screen.getByText('12-Column Grid System Demo').parentElement;
      expect(mainContainer).toHaveClass('p-8', 'bg-gray', 'text-white');
    });
  });

  describe('Component Integration', () => {
    it('works correctly when GridItem is used within GridContainer', () => {
      render(
        <GridContainer>
          <GridItem span={6}>Item 1</GridItem>
          <GridItem span={6}>Item 2</GridItem>
        </GridContainer>
      );
      
      const container = screen.getByText('Item 1').parentElement?.parentElement;
      expect(container).toHaveClass('grid-container');
      
      const item1 = screen.getByText('Item 1');
      const item2 = screen.getByText('Item 2');
      expect(item1).toHaveClass('col-6');
      expect(item2).toHaveClass('col-6');
    });

    it('handles nested content properly', () => {
      render(
        <GridContainer>
          <GridItem span={12}>
            <div>
              <h3>Nested Title</h3>
              <p>Nested paragraph</p>
            </div>
          </GridItem>
        </GridContainer>
      );
      
      expect(screen.getByText('Nested Title')).toBeInTheDocument();
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument();
    });
  });
});