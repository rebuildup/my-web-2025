# Requirements Document

## Introduction

この機能は、現在のポートフォリオコンテンツデータシステムを拡張し、詳細コンテンツ（detail部分）をMarkdown形式で管理できるようにするものです。現在は文字列として直接格納されているコンテンツを、Markdownファイルとして外部化し、画像・動画・リンクなどの埋め込みコンテンツをインデックス指定やiframe記述で表示できる仕組みを提供します。

## Requirements

### Requirement 1

**User Story:** As a content manager, I want to create and edit content details in Markdown format through the data manager, so that I can use rich formatting and embedded content.

#### Acceptance Criteria

1. WHEN I access the data manager THEN the system SHALL provide a Markdown editor for content details
2. WHEN I create new content THEN the system SHALL generate a corresponding .md file in the appropriate directory
3. WHEN I edit existing content THEN the system SHALL update the corresponding .md file
4. WHEN I save content THEN the system SHALL store the file path reference instead of the content string in the JSON data

### Requirement 2

**User Story:** As a content creator, I want to embed images, videos, and links using index references in Markdown, so that I can create rich content with media assets.

#### Acceptance Criteria

1. WHEN I write Markdown content THEN the system SHALL support image embedding using index syntax like `![image:0]`
2. WHEN I write Markdown content THEN the system SHALL support video embedding using index syntax like `![video:1]`
3. WHEN I write Markdown content THEN the system SHALL support link embedding using index syntax like `[link:2]`
4. WHEN content is rendered THEN the system SHALL resolve index references to actual media URLs from the content data
5. WHEN I use iframe syntax in Markdown THEN the system SHALL render embedded content safely

### Requirement 3

**User Story:** As a developer, I want the detail pages to automatically render Markdown content with embedded media, so that users can view rich formatted content.

#### Acceptance Criteria

1. WHEN a detail page loads THEN the system SHALL fetch the Markdown file based on the stored file path
2. WHEN rendering Markdown THEN the system SHALL process embedded media references and replace them with actual content
3. WHEN displaying content THEN the system SHALL maintain proper styling and layout for embedded elements
4. IF a Markdown file is missing THEN the system SHALL display an appropriate fallback message

### Requirement 4

**User Story:** As a content manager, I want to migrate existing string-based content to Markdown files, so that all content uses the new system consistently.

#### Acceptance Criteria

1. WHEN migrating existing content THEN the system SHALL convert current string content to Markdown files
2. WHEN migration occurs THEN the system SHALL update JSON data to reference file paths instead of content strings
3. WHEN migration is complete THEN all existing content SHALL be accessible through the new Markdown system
4. WHEN migration fails for any item THEN the system SHALL log the error and continue with other items

### Requirement 5

**User Story:** As a content manager, I want the data manager to provide preview functionality for Markdown content, so that I can see how content will appear before saving.

#### Acceptance Criteria

1. WHEN I edit Markdown content THEN the system SHALL provide a live preview panel
2. WHEN preview is displayed THEN the system SHALL render embedded media correctly
3. WHEN I make changes THEN the preview SHALL update in real-time
4. WHEN embedded content fails to load THEN the preview SHALL show appropriate placeholder or error message
