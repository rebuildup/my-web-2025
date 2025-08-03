# Implementation Plan

- [x] 1 Core Infrastructure Setup
  - Create core markdown file management infrastructure and data model enhancements
  - _Requirements: 1.2, 1.4, 4.1, 4.2_

- [x] 1.1 Create core markdown file management infrastructure
  - Implement file management service for creating, reading, updating, and deleting markdown files
  - Create directory structure for markdown files organized by content type
  - Add file path generation utilities with proper naming conventions
  - _Requirements: 1.2, 1.4_

- [x] 1.2 Enhance data models to support markdown file references
  - Extend ContentItem interface to include markdownPath field
  - Add migration status tracking fields to content items
  - Update type definitions for enhanced content items with markdown support
  - _Requirements: 1.4, 4.1, 4.2_

- [x] 2 Markdown Editor Implementation
  - Implement markdown editor component for data manager with embed syntax support
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3_

- [x] 2.1 Implement markdown editor component for data manager
  - Create enhanced MarkdownEditor component with embed syntax support
  - Add live preview functionality that resolves embed references
  - Implement toolbar with embed insertion helpers
  - Add syntax validation for embed references
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.3_

- [x] 3 Content Processing System
  - Create content parser service for embed resolution and markdown rendering
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_

- [x] 3.1 Create content parser service for embed resolution
  - Implement parser to resolve image, video, and link index references
  - Add support for iframe embed preservation
  - Create media resolver service to map indices to actual URLs
  - Add validation for embed syntax and index bounds
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3.2 Implement markdown renderer component for detail pages
  - Create MarkdownRenderer component that fetches and displays markdown files
  - Integrate content parser to resolve embedded media
  - Add error handling for missing markdown files with fallback display
  - Implement proper styling and layout for rendered markdown content
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4 UI Integration
  - Update data manager form and detail pages to use markdown system
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 3.3, 3.4, 5.1, 5.2_

- [ ] 4.1 Update data manager form to use markdown editor
  - Replace existing content textarea with new MarkdownEditor component
  - Add file creation and update logic when saving content items
  - Implement preview panel updates to show resolved markdown content
  - Add migration helper UI for converting existing string content
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_

- [ ] 4.2 Update detail pages to render markdown content
  - Modify VideoDetailPanel to use MarkdownRenderer instead of plain text
  - Update DetailModal to display markdown content with embedded media
  - Add fallback handling when markdown files are missing
  - Ensure proper styling consistency with existing design
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5 Migration System
  - Create migration system for existing content and error handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 3.4, 2.4, 2.5_

- [ ] 5.1 Create migration system for existing content
  - Implement migration script to convert existing string content to markdown files
  - Update JSON data to reference markdown file paths instead of content strings
  - Add batch processing for migrating multiple content items
  - Create migration status tracking and error logging
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5.2 Add comprehensive error handling and validation
  - Implement file operation error handling with appropriate user feedback
  - Add embed reference validation with helpful error messages
  - Create fallback content display when markdown files are unavailable
  - Add file integrity checking and recovery mechanisms
  - _Requirements: 3.4, 2.4, 2.5_

- [ ] 6 Testing Implementation
  - Create comprehensive tests for markdown system components
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2_

- [ ] 6.1 Create unit tests for markdown system components
  - Write tests for file management service operations
  - Test content parser embed resolution functionality
  - Add tests for markdown editor component behavior
  - Test error handling scenarios and edge cases
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 6.2 Implement integration tests for end-to-end workflows
  - Test complete workflow from markdown creation to display
  - Verify embed resolution works correctly across components
  - Test migration process with existing content data
  - Add tests for concurrent file operations and data consistency
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2_

- [ ] 7 Final Migration
  - Perform manual migration of existing content data
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7.1 Perform manual migration of existing content data
  - Run migration script on current portfolio.json data
  - Create markdown files for all existing content items
  - Update JSON data to reference new markdown file paths
  - Verify all migrated content displays correctly in detail pages
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
