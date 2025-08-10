# Design Document

## Overview

This design addresses multiple UI/UX improvements across the portfolio gallery system to create a more polished and consistent user experience. The improvements focus on visual stability, content organization, text overflow handling, and navigation consistency.

## Architecture

### Component Structure

The portfolio gallery system consists of several key components that need modifications:

1. **Global Layout Components**
   - `src/app/globals.css` - Global scrollbar and layout styles
   - Layout wrapper components for consistent scrollbar behavior

2. **Gallery Page Components**
   - `src/app/portfolio/gallery/all/` - All projects gallery with category filters
   - `src/app/portfolio/gallery/develop/` - Development projects gallery
   - `src/app/portfolio/gallery/video/` - Video projects gallery
   - `src/app/portfolio/gallery/video&design/` - Video & Design gallery

3. **Card Components**
   - `PortfolioCard.tsx` - Main card component for all gallery
   - Video card components for video gallery
   - Video & Design gallery item components

4. **Main Portfolio Page**
   - `src/app/portfolio/page.tsx` - Browse by Category section

## Components and Interfaces

### 1. Scrollbar Consistency System

**Component**: Global CSS scrollbar utilities
**Location**: `src/app/globals.css`

```css
/* Consistent scrollbar behavior */
.scrollbar-stable {
  scrollbar-gutter: stable;
}

.scrollbar-always {
  overflow-y: scroll;
}

.scrollbar-auto-stable {
  overflow-y: auto;
  scrollbar-gutter: stable;
}
```

**Implementation Strategy**:

- Use `scrollbar-gutter: stable` to reserve space for scrollbar
- Apply to main content containers to prevent layout shift
- Provide utility classes for different scrollbar behaviors

### 2. Category Filter Enhancement

**Component**: Category filter system
**Location**: `src/app/portfolio/gallery/all/components/`

**Current State**: Shows "Video&Design" filter option
**Target State**: Remove "Video&Design", add separate "Design" filter

**Filter Logic Changes**:

```typescript
// Remove video&design from filter options
const availableCategories = categories.filter((cat) => cat !== "video&design");

// Add design category logic
const designItems = items.filter(
  (item) =>
    item.category === "design" ||
    (item.category === "video&design" && hasDesignElements(item)),
);
```

### 3. Text Truncation System

**Component**: Text truncation utilities and card layouts
**Location**: Multiple card components

**Text Truncation Specifications**:

- Description text: Exactly 2 lines with ellipsis
- Tags: 1 line with "+N" overflow indicator
- Consistent line-height and spacing

**CSS Implementation**:

```css
.text-truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  height: 3em; /* 2 lines * 1.5 line-height */
}

.tags-container {
  height: 1.5em; /* Fixed height for 1 line */
  overflow: hidden;
}
```

### 4. Button Sizing System

**Component**: Button auto-sizing utilities
**Location**: `src/app/portfolio/gallery/develop/components/`

**Implementation**:

- Use `min-width` and `padding` to ensure text fits
- Responsive text sizing for different screen sizes
- Consistent button height across all states

### 5. Video Card Layout System

**Component**: Video card redesign
**Location**: `src/app/portfolio/gallery/video/components/`

**Layout Changes**:

- Remove thumbnail overlay icons
- Move tags above date
- Implement 2-line description truncation
- Tag overflow with "+N" format

### 6. Video & Design Hover Effects

**Component**: Enhanced hover system
**Location**: `src/app/portfolio/gallery/video&design/components/`

**Hover Behavior**:

- Text visibility: Only on hover
- Image scaling: Only image scales, frame stays static
- Smooth transitions with proper z-index management

### 7. Grid Layout Algorithm

**Component**: Enhanced grid layout system
**Location**: `src/lib/portfolio/grid-layout-utils.ts`

**Algorithm Improvements**:

- Better bottom row alignment
- Improved spacing distribution
- Consistent grid item sizing
- Fallback layouts for incomplete rows

### 8. Category Navigation Cards

**Component**: Browse by Category section
**Location**: `src/app/portfolio/page.tsx`

**Design Changes**:

- Left-align project counts
- Remove status tags (Complete, Active, etc.)
- Right-align arrows with consistent design
- Unified arrow style across all cards

## Data Models

### Enhanced Filter State

```typescript
interface FilterState {
  category: "all" | "develop" | "video" | "design"; // Remove 'video&design'
  year: string;
  sortBy: "priority" | "date" | "title";
}
```

### Card Display Configuration

```typescript
interface CardDisplayConfig {
  descriptionLines: 2;
  tagLines: 1;
  showOverlayIcons: boolean;
  truncationIndicator: "...";
  tagOverflowFormat: "+{count}";
}
```

### Grid Layout Configuration

```typescript
interface GridLayoutConfig {
  minItemsPerRow: number;
  maxItemsPerRow: number;
  gapSize: string;
  alignmentStrategy: "balanced" | "left" | "center";
  bottomRowHandling: "stretch" | "center" | "left";
}
```

## Error Handling

### Scrollbar Fallbacks

- Detect browser scrollbar support
- Provide fallback spacing for unsupported browsers
- Graceful degradation for older browsers

### Text Truncation Fallbacks

- CSS fallback for browsers without `-webkit-line-clamp`
- JavaScript-based truncation as secondary option
- Ensure accessibility with proper ARIA labels

### Grid Layout Error Handling

- Handle empty or insufficient data gracefully
- Provide placeholder layouts for loading states
- Maintain layout stability during data updates

### Image Loading Error Handling

- Fallback thumbnails for missing images
- Proper error states for video thumbnails
- Consistent placeholder designs

## Testing Strategy

### Visual Regression Testing

- Screenshot comparisons for layout consistency
- Scrollbar behavior across different content lengths
- Text truncation accuracy across different text lengths

### Responsive Testing

- Test all breakpoints for layout stability
- Verify button sizing across screen sizes
- Ensure grid layouts work on mobile devices

### Accessibility Testing

- Keyboard navigation for all interactive elements
- Screen reader compatibility for truncated text
- Focus management for hover effects

### Performance Testing

- Grid layout algorithm performance with large datasets
- Hover effect smoothness and frame rates
- Image loading and caching efficiency

### Cross-browser Testing

- Scrollbar behavior consistency
- CSS grid support and fallbacks
- Hover effect compatibility

### User Experience Testing

- Category filter usability
- Text readability with truncation
- Navigation flow between gallery pages

## Implementation Phases

### Phase 1: Global Layout Improvements

1. Implement scrollbar consistency system
2. Update global CSS with utility classes
3. Apply scrollbar utilities to main layouts

### Phase 2: Category Filter Enhancement

1. Remove Video&Design filter option
2. Implement Design category logic
3. Update filter UI components

### Phase 3: Text and Layout Improvements

1. Implement text truncation system
2. Update all card components
3. Fix button sizing issues

### Phase 4: Video Gallery Improvements

1. Redesign video cards
2. Remove overlay icons
3. Implement tag positioning changes

### Phase 5: Video & Design Gallery Polish

1. Enhance hover effects
2. Improve grid layout algorithm
3. Fix bottom row alignment

### Phase 6: Navigation Consistency

1. Update Browse by Category cards
2. Standardize arrow designs
3. Implement consistent spacing

## Technical Considerations

### CSS Custom Properties

Use CSS custom properties for consistent spacing and sizing:

```css
:root {
  --card-description-lines: 2;
  --card-tag-lines: 1;
  --card-padding: 1rem;
  --grid-gap: 1.5rem;
}
```

### Performance Optimization

- Use CSS transforms for hover effects (GPU acceleration)
- Implement efficient grid layout calculations
- Optimize image loading and caching

### Accessibility Compliance

- Maintain WCAG 2.1 AA compliance
- Ensure proper focus management
- Provide appropriate ARIA labels for truncated content

### Browser Compatibility

- Support modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
- Provide graceful degradation for older browsers
- Test scrollbar behavior across different operating systems
