# 12-Column Grid System

A modern, flexible 12-column grid system built with CSS Grid and Tailwind CSS v4, designed for responsive web layouts with mobile-first approach.

## Features

- **12-column grid system** with 1-12 column spans
- **Responsive breakpoints**: `sm`, `md`, `lg`, `xl`, `2xl`
- **Mobile-first design** approach
- **Advanced positioning** with order control
- **Flexible gap system** with customizable spacing
- **Auto-width columns** for dynamic layouts
- **Nested grid support** for complex layouts

## Components

### GridContainer

The main container component that establishes the 12-column grid layout.

```tsx
import { GridContainer } from './GridSystem';

<GridContainer className="gap-4">
  {/* Grid items go here */}
</GridContainer>
```

**Props:**
- `children`: React nodes to render inside the grid
- `className`: Additional CSS classes

### GridItem

Individual grid items that can span 1-12 columns and respond to different breakpoints.

```tsx
import { GridItem } from './GridSystem';

<GridItem span={6} mdSpan={4} lgSpan={3}>
  Content
</GridItem>
```

**Props:**
- `span`: Column span (1-12) for all screen sizes
- `smSpan`: Column span for small screens and up (≥640px)
- `mdSpan`: Column span for medium screens and up (≥768px)
- `lgSpan`: Column span for large screens and up (≥1024px)
- `xlSpan`: Column span for extra large screens and up (≥1280px)
- `xl2Span`: Column span for 2xl screens and up (≥1536px)
- `order`: Display order for all screen sizes
- `smOrder`, `mdOrder`, `lgOrder`, `xlOrder`, `xl2Order`: Responsive order control
- `className`: Additional CSS classes

## Breakpoints

The grid system uses the following breakpoints:

| Breakpoint | Min Width | Description |
|------------|-----------|-------------|
| Default    | 0px       | Mobile (base) |
| `sm`       | 640px     | Small devices |
| `md`       | 768px     | Tablets |
| `lg`       | 1024px    | Desktops |
| `xl`       | 1280px    | Large desktops |
| `2xl`      | 1536px    | Extra large screens |

## Usage Examples

### Basic Grid Layout

```tsx
<GridContainer className="gap-4">
  <GridItem span={12}>Full width header</GridItem>
  <GridItem span={6}>Half width</GridItem>
  <GridItem span={6}>Half width</GridItem>
  <GridItem span={4}>One third</GridItem>
  <GridItem span={4}>One third</GridItem>
  <GridItem span={4}>One third</GridItem>
</GridContainer>
```

### Responsive Layout

```tsx
<GridContainer className="gap-4">
  <GridItem 
    span={12}     // Full width on mobile
    mdSpan={8}    // 8 columns on tablet+
    lgSpan={9}    // 9 columns on desktop+
  >
    Main content
  </GridItem>
  <GridItem 
    span={12}     // Full width on mobile
    mdSpan={4}    // 4 columns on tablet+
    lgSpan={3}    // 3 columns on desktop+
  >
    Sidebar
  </GridItem>
</GridContainer>
```

### Order Control

```tsx
<GridContainer className="gap-4">
  <GridItem span={4} order={3}>Appears third</GridItem>
  <GridItem span={4} order={1}>Appears first</GridItem>
  <GridItem span={4} order={2}>Appears second</GridItem>
</GridContainer>
```

### Complex Responsive Layout

```tsx
<GridContainer className="gap-4">
  <GridItem span={12}>
    Header
  </GridItem>
  <GridItem 
    span={12} 
    mdSpan={8} 
    order={2} 
    mdOrder={1}
  >
    Main content (reordered on desktop)
  </GridItem>
  <GridItem 
    span={12} 
    mdSpan={4} 
    order={1} 
    mdOrder={2}
  >
    Sidebar (reordered on desktop)
  </GridItem>
  <GridItem span={12}>
    Footer
  </GridItem>
</GridContainer>
```

## CSS Classes

The grid system provides the following CSS classes for direct use:

### Column Spans
- `.col-1` through `.col-12` - Column spans
- `.col-auto` - Auto-width columns

### Responsive Column Spans
- `.sm:col-1` through `.sm:col-12`
- `.md:col-1` through `.md:col-12`
- `.lg:col-1` through `.lg:col-12`
- `.xl:col-1` through `.xl:col-12`
- `.2xl:col-1` through `.2xl:col-12`

### Order Control
- `.order-1` through `.order-12`
- `.order-first`, `.order-last`, `.order-none`
- Responsive variants: `.sm:order-*`, `.md:order-*`, etc.

### Positioning
- `.items-start`, `.items-center`, `.items-end`, `.items-stretch`, `.items-baseline`
- `.justify-start`, `.justify-center`, `.justify-end`, `.justify-between`, `.justify-around`, `.justify-evenly`

### Gap Control
- `.gap-0` through `.gap-24` - Overall gap
- `.gap-x-*` - Column gap
- `.gap-y-*` - Row gap

## Color Scheme Updates

The grid system follows the updated color scheme:

- **Text Color**: `#ffffff` (white) for all text elements
- **Background**: `#222222` (dark gray) as base
- **Accent**: `#0000ff` (blue) for backgrounds only, never for text
- **Focus**: Blue outline for accessibility

## Accessibility

The grid system includes:
- Proper focus management with visible focus indicators
- Semantic HTML structure
- Screen reader friendly layouts
- Keyboard navigation support

## Performance

- **CSS Grid** based for optimal performance
- **Minimal CSS** footprint with utility classes
- **Tree-shaking** compatible with Tailwind CSS
- **Mobile-first** approach reduces unused CSS

## Migration from Previous Grid

If migrating from the old 4-column system:

```tsx
// Old system
<div className="grid-4">
  <div>Content</div>
</div>

// New system
<GridContainer>
  <GridItem span={3}>Content</GridItem>
  <GridItem span={3}>Content</GridItem>
  <GridItem span={3}>Content</GridItem>
  <GridItem span={3}>Content</GridItem>
</GridContainer>
```

## Demo

Use the `GridSystemDemo` component to see all features in action:

```tsx
import { GridSystemDemo } from './GridSystem';

<GridSystemDemo />
```

This will render a comprehensive demo showing all grid system capabilities.