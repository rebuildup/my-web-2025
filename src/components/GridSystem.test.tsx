import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@/test/test-utils';
import {
  GridLayout,
  GridContainer,
  GridContent,
  ContainerGrid,
  SubGrid,
  GridSection,
  GridItem,
  AutoFitGrid,
} from './GridSystem';

describe('GridSystem Components', () => {
  describe('GridLayout', () => {
    it('should render with default props', () => {
      render(
        <GridLayout>
          <div>Test content</div>
        </GridLayout>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const container = testContent.parentElement;
      expect(container).toHaveClass('min-h-screen');
      expect(container?.className).toContain('bg-[var(--color-background)]');
      expect(container?.className).toContain('text-[var(--color-foreground)]');
    });

    it('should render without background', () => {
      render(
        <GridLayout background={false}>
          <div>Test content</div>
        </GridLayout>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const container = testContent.parentElement;
      expect(container?.className).not.toContain('bg-[var(--color-background)]');
      expect(container).toHaveClass('min-h-screen');
      expect(container?.className).toContain('text-[var(--color-foreground)]');
    });

    it('should apply custom className', () => {
      render(
        <GridLayout className="custom-class">
          <div>Test content</div>
        </GridLayout>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const container = testContent.parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('GridContainer', () => {
    it('should render with default props', () => {
      render(
        <GridContainer>
          <div>Test content</div>
        </GridContainer>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const container = testContent.closest('.container-grid');
      expect(container).toBeInTheDocument();
      const innerDiv = testContent.parentElement;
      expect(innerDiv).toHaveClass('xs:px-6', 'px-4', 'md:px-8');
    });

    it('should render without padding', () => {
      render(
        <GridContainer padding={false}>
          <div>Test content</div>
        </GridContainer>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const container = testContent.closest('.container-grid');
      expect(container).toBeInTheDocument();
      const innerDiv = testContent.parentElement;
      expect(innerDiv).not.toHaveClass('xs:px-6', 'px-4', 'md:px-8');
    });

    it('should apply custom className', () => {
      render(
        <GridContainer className="custom-class">
          <div>Test content</div>
        </GridContainer>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const innerDiv = testContent.parentElement;
      expect(innerDiv).toHaveClass('custom-class');
    });
  });

  describe('GridContent', () => {
    it('should render with default props', () => {
      render(
        <GridContent>
          <div>Item 1</div>
          <div>Item 2</div>
        </GridContent>
      );

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument();
      const grid = item1.parentElement;
      expect(grid).toHaveClass('grid', 'gap-4', 'xs:gap-6', 'md:gap-8');
      expect(grid).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2',
        'xl:grid-cols-3',
        '2xl:grid-cols-4'
      );
    });

    it('should render with custom columns', () => {
      render(
        <GridContent
          cols={{
            base: 2,
            sm: 3,
            md: 4,
            lg: 5,
            xl: 6,
            '2xl': 7,
          }}
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </GridContent>
      );

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument();
      const grid = item1.parentElement;
      expect(grid).toHaveClass(
        'grid-cols-2',
        'sm:grid-cols-3',
        'md:grid-cols-4',
        'lg:grid-cols-5',
        'xl:grid-cols-6',
        '2xl:grid-cols-7'
      );
    });

    it('should render with custom gap', () => {
      render(
        <GridContent gap="lg">
          <div>Item 1</div>
          <div>Item 2</div>
        </GridContent>
      );

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument();
      const grid = item1.parentElement;
      expect(grid).toHaveClass('gap-6', 'xs:gap-8', 'md:gap-12');
    });

    it('should apply custom className', () => {
      render(
        <GridContent className="custom-class">
          <div>Test content</div>
        </GridContent>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const grid = testContent.parentElement;
      expect(grid).toHaveClass('custom-class');
    });
  });

  describe('ContainerGrid', () => {
    it('should render with container query classes', () => {
      render(<ContainerGrid>Test content</ContainerGrid>);

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const container = testContent.parentElement?.parentElement;
      expect(container).toHaveClass('@container');
    });

    it('should apply custom className', () => {
      render(<ContainerGrid className="custom-class">Test content</ContainerGrid>);

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const container = testContent.parentElement?.parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('SubGrid', () => {
    it('should render with default props', () => {
      render(
        <SubGrid>
          <div>Item 1</div>
          <div>Item 2</div>
        </SubGrid>
      );

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument();
      const subgrid = item1.parentElement;
      expect(subgrid).toHaveClass('col-span-3', 'grid', 'grid-cols-subgrid', 'gap-4');
    });

    it('should render with custom columns', () => {
      render(
        <SubGrid cols={5}>
          <div>Item 1</div>
          <div>Item 2</div>
        </SubGrid>
      );

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument();
      const subgrid = item1.parentElement;
      expect(subgrid).toHaveClass('col-span-5');
    });

    it('should apply custom className', () => {
      render(
        <SubGrid className="custom-class">
          <div>Test content</div>
        </SubGrid>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const subgrid = testContent.parentElement;
      expect(subgrid).toHaveClass('custom-class');
    });
  });

  describe('GridSection', () => {
    it('should render with default props', () => {
      render(
        <GridSection>
          <div>Test content</div>
        </GridSection>
      );

      const section = screen.getByText('Test content').closest('section');
      expect(section).toHaveClass('py-8', 'xs:py-12', 'md:py-16');
    });

    it('should render with custom spacing', () => {
      render(
        <GridSection spacing="xl">
          <div>Test content</div>
        </GridSection>
      );

      const section = screen.getByText('Test content').closest('section');
      expect(section).toHaveClass('py-16', 'xs:py-20', 'md:py-24', 'xl:py-32');
    });

    it('should render without container', () => {
      render(
        <GridSection container={false}>
          <div>Test content</div>
        </GridSection>
      );

      const section = screen.getByText('Test content').closest('section');
      expect(section).toBeInTheDocument();
      expect(section?.querySelector('.container-grid')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <GridSection className="custom-class">
          <div>Test content</div>
        </GridSection>
      );

      const section = screen.getByText('Test content').closest('section');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('GridItem', () => {
    it('should render without span', () => {
      render(
        <GridItem>
          <div>Test content</div>
        </GridItem>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const item = testContent.parentElement;
      expect(item).toBeInTheDocument();
      expect(item?.className.trim()).toBe('');
    });

    it('should render with span classes', () => {
      render(
        <GridItem
          span={{
            base: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 5,
            '2xl': 6,
          }}
        >
          <div>Test content</div>
        </GridItem>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const item = testContent.parentElement;
      expect(item).toHaveClass(
        'col-span-1',
        'sm:col-span-2',
        'md:col-span-3',
        'lg:col-span-4',
        'xl:col-span-5',
        '2xl:col-span-6'
      );
    });

    it('should apply custom className', () => {
      render(
        <GridItem className="custom-class">
          <div>Test content</div>
        </GridItem>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const item = testContent.parentElement;
      expect(item).toHaveClass('custom-class');
    });

    it('should handle partial span configuration', () => {
      render(
        <GridItem
          span={{
            base: 2,
            md: 4,
          }}
        >
          <div>Test content</div>
        </GridItem>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const item = testContent.parentElement;
      expect(item).toHaveClass('col-span-2', 'md:col-span-4');
      expect(item).not.toHaveClass('sm:col-span-', 'lg:col-span-', 'xl:col-span-', '2xl:col-span-');
    });
  });

  describe('AutoFitGrid', () => {
    it('should render with default props', () => {
      render(
        <AutoFitGrid>
          <div>Item 1</div>
          <div>Item 2</div>
        </AutoFitGrid>
      );

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument();
      const grid = item1.parentElement;
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-[repeat(auto-fit,minmax(min(100%,384px),1fr))]',
        'gap-4'
      );
    });

    it('should render with custom minWidth', () => {
      render(
        <AutoFitGrid minWidth="200px">
          <div>Item 1</div>
          <div>Item 2</div>
        </AutoFitGrid>
      );

      const item1 = screen.getByText('Item 1');
      expect(item1).toBeInTheDocument();
      const grid = item1.parentElement;
      expect(grid).toHaveClass('grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))]');
    });

    it('should apply custom className', () => {
      render(
        <AutoFitGrid className="custom-class">
          <div>Test content</div>
        </AutoFitGrid>
      );

      const testContent = screen.getByText('Test content');
      expect(testContent).toBeInTheDocument();
      const grid = testContent.parentElement;
      expect(grid).toHaveClass('custom-class');
    });
  });

  describe('Component Integration', () => {
    it('should work together in a complex layout', () => {
      render(
        <GridLayout>
          <GridContainer>
            <GridSection>
              <GridContent cols={{ base: 1, md: 2 }}>
                <GridItem span={{ base: 1, md: 2 }}>
                  <div>Header</div>
                </GridItem>
                <GridItem>
                  <div>Sidebar</div>
                </GridItem>
                <GridItem>
                  <div>Main Content</div>
                </GridItem>
              </GridContent>
            </GridSection>
          </GridContainer>
        </GridLayout>
      );

      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Sidebar')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should handle nested grids', () => {
      render(
        <GridContent cols={{ base: 1, md: 2 }}>
          <GridItem>
            <SubGrid cols={2}>
              <div>Nested Item 1</div>
              <div>Nested Item 2</div>
            </SubGrid>
          </GridItem>
          <GridItem>
            <div>Regular Item</div>
          </GridItem>
        </GridContent>
      );

      expect(screen.getByText('Nested Item 1')).toBeInTheDocument();
      expect(screen.getByText('Nested Item 2')).toBeInTheDocument();
      expect(screen.getByText('Regular Item')).toBeInTheDocument();
    });
  });
});
