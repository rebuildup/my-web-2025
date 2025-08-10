# Implementation Plan

- [x] 1. Implement global scrollbar consistency system
  - Create CSS utilities for stable scrollbar behavior using `scrollbar-gutter: stable`
  - Add scrollbar utility classes to `src/app/globals.css`
  - Apply scrollbar utilities to main layout containers to prevent layout shift
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Update portfolio/gallery/all category filter system
  - Remove "Video&Design" filter option from available categories
  - Add "Design" as a separate filter option in the category dropdown
  - Implement filtering logic to show design-related items when "Design" filter is selected
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Implement text truncation system for portfolio cards
  - Create CSS utilities for 2-line description truncation with ellipsis
  - Create CSS utilities for 1-line tag display with fixed height
  - Implement "+N" format for tag overflow display
  - Update PortfolioCard component to use new truncation system
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Fix button sizing in develop gallery page
  - Update "Descending" button styling to prevent text overflow
  - Implement responsive button sizing that adjusts to content
  - Ensure button text is fully visible across all screen sizes
  - _Requirements: 4.1, 4.2_

- [x] 5. Redesign video gallery card layout
  - Implement 2-line description truncation for video cards
  - Move tags above the date in video card layout
  - Implement "+N" format for tag overflow in video cards
  - Remove thumbnail overlay icons from video cards
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Enhance video&design gallery hover effects
  - Implement text visibility only on hover state
  - Update hover effects to scale only the image, keeping frame static
  - Ensure smooth transitions and proper z-index management
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 7. Improve video&design gallery grid layout algorithm
  - Update grid layout algorithm in `src/lib/portfolio/grid-layout-utils.ts`
  - Implement better bottom row alignment logic
  - Ensure consistent spacing and alignment for incomplete bottom rows
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 8. Update Browse by Category navigation cards
  - Left-align project counts in category cards
  - Remove status tags (Complete, Active, etc.) from category cards
  - Right-align arrows with consistent design across all cards
  - Implement unified arrow style for all category navigation cards
  - _Requirements: 8.1, 8.2, 8.3, 8.4_
