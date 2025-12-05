# Data Manager - Markdown Editing Guide

## Overview

This guide covers how to use the Data Manager's markdown editing features to create and manage rich content for your portfolio items. The markdown editor provides a powerful interface for creating formatted content with embedded media.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Editor Interface](#editor-interface)
3. [Creating New Content](#creating-new-content)
4. [Editing Existing Content](#editing-existing-content)
5. [Using Embed Features](#using-embed-features)
6. [Preview and Validation](#preview-and-validation)
7. [Saving and File Management](#saving-and-file-management)
8. [Advanced Features](#advanced-features)

## Getting Started

### Accessing the Markdown Editor

1. **Open Data Manager**
   - Navigate to your portfolio dashboard
   - Click on "Data Manager" or "Content Management"
   - Select "Portfolio Items" from the menu

2. **Select an Item**
   - Choose an existing portfolio item to edit
   - Or click "Create New Item" to start fresh

3. **Navigate to Content Section**
   - Scroll to the "Content Details" or "Description" section
   - You'll see the markdown editor interface

### First Time Setup

When you first access the markdown editor:

1. **Migration Prompt** (if applicable)
   - Items with existing text content will show a migration option
   - Click "Migrate to Markdown" to convert existing content
   - Or start with a blank markdown editor

2. **Editor Initialization**
   - The editor loads with syntax highlighting
   - Live preview panel appears on the right
   - Toolbar with formatting options is available

## Editor Interface

### Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Toolbar: [B] [I] [H1] [H2] [Image] [Video] [Link] [Preview] │
├─────────────────────────┬───────────────────────────────────┤
│                         │                                   │
│    Markdown Editor      │        Live Preview               │
│    (Left Panel)         │        (Right Panel)              │
│                         │                                   │
│ # My Project            │  My Project                       │
│                         │  ═══════════                      │
│ This is **bold** text   │  This is bold text                │
│                         │                                   │
│ ![image:0]              │  [Image displays here]            │
│                         │                                   │
├─────────────────────────┴───────────────────────────────────┤
│ Status: Auto-saved 2 minutes ago    [Save] [Cancel] [Help] │
└─────────────────────────────────────────────────────────────┘
```

### Toolbar Features

#### Text Formatting

- **Bold** (B): Make selected text bold
- **Italic** (I): Make selected text italic
- **H1, H2, H3**: Insert heading levels
- **List**: Create bulleted or numbered lists
- **Quote**: Insert blockquotes
- **Code**: Insert inline code or code blocks

#### Media Insertion

- **Image**: Insert image embed with index selector
- **Video**: Insert video embed with options
- **Link**: Insert external link embed
- **iframe**: Insert custom iframe embed

#### Editor Controls

- **Preview Toggle**: Show/hide live preview
- **Split View**: Toggle between split and full-width modes
- **Fullscreen**: Expand editor to full screen
- **Help**: Show syntax reference

### Keyboard Shortcuts

| Shortcut  | Action             |
| --------- | ------------------ |
| Ctrl+B    | Bold text          |
| Ctrl+I    | Italic text        |
| Ctrl+K    | Insert link        |
| Ctrl+S    | Save content       |
| Ctrl+Z    | Undo               |
| Ctrl+Y    | Redo               |
| Tab       | Indent (in lists)  |
| Shift+Tab | Outdent (in lists) |

## Creating New Content

### Starting with a Template

When creating new content, use this basic template:

```markdown
# Project Title

## Overview

Brief description of what this project does and why it's important.

## Key Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Screenshots

![image:0 "Main interface" class="w-full rounded-lg shadow-md"]

## Demo Video

![video:0 "Project walkthrough" class="aspect-video w-full rounded-lg"]

## Technology Stack

- **Frontend**: Technologies used
- **Backend**: Server technologies
- **Database**: Data storage solution
- **Deployment**: Hosting platform

## Implementation Highlights

Interesting technical details about how you built this project.

## Results

What was achieved with this project.

## Links

[link:0 "Live Demo" class="bg-blue-500 text-white px-4 py-2 rounded-lg"]
[link:1 "Source Code" class="bg-gray-800 text-white px-4 py-2 rounded-lg ml-2"]
```

### Step-by-Step Content Creation

#### 1. Set Up Basic Structure

Start with headings to organize your content:

```markdown
# Main Project Title

## Overview

## Features

## Screenshots

## Technology

## Links
```

#### 2. Add Content Sections

Fill in each section with relevant information:

```markdown
## Overview

This project is a web application that helps users manage their daily tasks.
It features a clean interface, real-time updates, and mobile responsiveness.

## Features

- **Task Management**: Create, edit, and delete tasks
- **Categories**: Organize tasks by project or priority
- **Real-time Sync**: Changes sync across all devices
- **Mobile Responsive**: Works perfectly on phones and tablets
```

#### 3. Insert Media Content

Use the toolbar buttons or type embed syntax directly:

```markdown
## Screenshots

![image:0 "Desktop interface" class="w-full md:w-2/3 rounded-lg shadow-lg mx-auto"]

_The main dashboard showing task overview and quick actions_

![image:1 "Mobile view" class="w-full sm:w-1/2 rounded-lg shadow-md mx-auto mt-4"]

_Mobile-optimized interface for on-the-go task management_
```

#### 4. Add Interactive Elements

Include videos and links to make content engaging:

```markdown
## Demo Video

![video:0 "Full application walkthrough" class="aspect-video w-full rounded-xl shadow-2xl"]

## Try It Yourself

Ready to see it in action?

[link:0 "🚀 Live Demo" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"]

[link:1 "📚 Documentation" class="bg-white text-blue-600 px-6 py-3 rounded-lg border-2 border-blue-500 hover:bg-blue-50 transition-colors font-medium ml-4"]
```

## Editing Existing Content

### Opening Existing Content

1. **Select Portfolio Item**
   - Find the item in your portfolio list
   - Click "Edit" or the item title

2. **Navigate to Content**
   - Scroll to the markdown editor section
   - Content loads automatically if markdown file exists

3. **Handle Legacy Content**
   - If item has old text content, you'll see migration options
   - Choose "Migrate to Markdown" or "Start Fresh"

### Making Edits

#### Text Changes

- Click anywhere in the editor to start typing
- Use standard markdown syntax for formatting
- Changes appear in live preview immediately

#### Adding New Media

1. **Upload Media First**
   - Go to the "Media" section of the item
   - Upload new images, videos, or add links
   - Note the index numbers (0, 1, 2, etc.)

2. **Insert Embed References**

   ```markdown
   # New image at index 2

   ![image:2 "New screenshot" class="w-full rounded-lg"]

   # New video at index 1

   ![video:1 "Updated demo" class="aspect-video w-full"]
   ```

#### Restructuring Content

- Use drag-and-drop to reorder sections (if supported)
- Cut and paste text blocks to reorganize
- Update heading levels as needed

### Version History

The system automatically saves versions:

1. **View History**
   - Click "Version History" button
   - See list of previous saves with timestamps

2. **Restore Previous Version**
   - Select a version from the history
   - Click "Restore" to revert changes
   - Current version is backed up automatically

## Using Embed Features

### Image Embeds

#### Basic Image Insertion

1. **Using Toolbar**
   - Click the "Image" button in toolbar
   - Select image index from dropdown
   - Choose optional alt text and CSS classes
   - Click "Insert"

2. **Manual Syntax**
   ```markdown
   ![image:0] # Basic
   ![image:0 "Screenshot of main page"] # With alt text
   ![image:0 "Screenshot" class="w-full rounded"] # With styling
   ```

#### Image Styling Options

```markdown
# Responsive gallery

![image:0 "Image 1" class="w-full md:w-1/3 p-2 rounded-lg"]
![image:1 "Image 2" class="w-full md:w-1/3 p-2 rounded-lg"]
![image:2 "Image 3" class="w-full md:w-1/3 p-2 rounded-lg"]

# Hero image

![image:0 "Hero" class="w-full h-64 md:h-96 object-cover rounded-xl shadow-2xl"]

# Centered with border

![image:1 "Diagram" class="w-2/3 mx-auto border-2 border-gray-300 rounded-lg p-4"]
```

### Video Embeds

#### Video Insertion Process

1. **Prepare Video Data**
   - Ensure video is added to the item's video array
   - Note the index number
   - Verify video URL is accessible

2. **Insert Video Embed**
   ```markdown
   ![video:0] # Basic embed
   ![video:0 "Demo walkthrough"] # With title
   ![video:0 "Demo" class="aspect-video w-full"] # With styling
   ```

#### Video Styling Examples

```markdown
# Full-width responsive video

![video:0 "Project demo" class="aspect-video w-full rounded-lg shadow-lg"]

# Smaller embedded video

![video:1 "Feature highlight" class="w-full sm:w-2/3 md:w-1/2 mx-auto aspect-video rounded-lg"]

# Video grid

![video:0 "Overview" class="w-full md:w-1/2 p-2 aspect-video"]
![video:1 "Details" class="w-full md:w-1/2 p-2 aspect-video"]
```

### Link Embeds

#### Link Insertion Methods

1. **Toolbar Method**
   - Click "Link" button
   - Select link index
   - Enter custom text (optional)
   - Choose styling classes
   - Click "Insert"

2. **Manual Entry**
   ```markdown
   [link:0] # Uses original title
   [link:0 "Visit the demo"] # Custom text
   [link:0 "Demo" class="btn btn-primary"] # With styling
   ```

#### Link Styling Patterns

```markdown
# Button-style links

[link:0 "Live Demo" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"]

# Badge-style links

[link:1 "GitHub" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"]

# Inline links

Visit the [link:0 "project demo" class="text-blue-600 hover:underline"] to try it yourself.
```

### iframe Embeds

#### Custom iframe Insertion

For content not covered by image/video/link embeds:

```html
<iframe
  src="https://codepen.io/username/embed/abc123"
  title="CodePen Demo"
  class="w-full h-96 rounded-lg border border-gray-200"
  loading="lazy"
>
</iframe>
```

#### Common iframe Examples

```html
<!-- YouTube (alternative to video embed) -->
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube Demo"
  class="aspect-video w-full rounded-lg"
  allowfullscreen
>
</iframe>

<!-- Interactive demo -->
<iframe
  src="https://example.com/interactive-demo"
  title="Interactive Demo"
  class="w-full h-screen max-h-96 rounded-lg border-0"
>
</iframe>

<!-- Code sandbox -->
<iframe
  src="https://codesandbox.io/embed/project-id"
  title="Code Sandbox"
  class="w-full h-96 rounded-lg border border-gray-300"
  sandbox="allow-scripts allow-same-origin"
>
</iframe>
```

## Preview and Validation

### Live Preview Features

#### Real-time Updates

- Changes appear in preview immediately
- Embeds are resolved and displayed
- Styling is applied as you type

#### Preview Controls

- **Toggle Preview**: Show/hide preview panel
- **Sync Scroll**: Preview scrolls with editor
- **Full Preview**: View preview in full screen

### Content Validation

#### Automatic Validation

The editor automatically checks for:

1. **Embed Reference Errors**
   - Invalid indices (e.g., image:99 when only 3 images exist)
   - Malformed syntax (missing quotes, wrong brackets)
   - Unreachable media URLs

2. **CSS Class Validation**
   - Invalid Tailwind CSS classes
   - Typos in class names
   - Unsupported class combinations

3. **Markdown Syntax Issues**
   - Unclosed code blocks
   - Malformed tables
   - Invalid heading structures

#### Validation Indicators

- **Green checkmark**: Content is valid
- **Yellow warning**: Minor issues detected
- **Red error**: Critical problems found

#### Error Messages

Common validation messages:

```
❌ Invalid image index: 5 (only 3 images available)
⚠️  CSS class 'custom-class' is not a valid Tailwind class
❌ Unclosed code block starting at line 15
⚠️  Missing alt text for image embed at line 8
```

### Testing Your Content

#### Preview Checklist

Before saving, verify:

- [ ] All images display correctly
- [ ] Videos play properly
- [ ] Links are clickable and work
- [ ] Responsive design looks good
- [ ] Text formatting is correct
- [ ] No validation errors

#### Cross-Device Testing

1. **Desktop Preview**
   - Check full-width layout
   - Verify large image displays
   - Test hover effects on links

2. **Mobile Preview**
   - Use browser dev tools mobile view
   - Check responsive image sizing
   - Verify touch-friendly link buttons

3. **Tablet Preview**
   - Test medium-width layouts
   - Check grid arrangements
   - Verify video aspect ratios

## Saving and File Management

### Save Options

#### Auto-Save

- Content is automatically saved every 30 seconds
- Indicated by "Auto-saved" status message
- Prevents data loss during editing

#### Manual Save

- Click "Save" button to save immediately
- Use Ctrl+S keyboard shortcut
- Recommended before closing editor

#### Save and Continue

- Saves content and keeps editor open
- Useful for long editing sessions
- Preserves undo/redo history

### File Management

#### File Naming

- Files are automatically named based on item ID
- Format: `portfolio-{timestamp}.md`
- Example: `portfolio-1753705784056.md`

#### File Location

```
public/data/content/markdown/
├── portfolio/
│   ├── portfolio-1753705784056.md
│   ├── portfolio-1753840532952.md
│   └── ...
├── download/
│   └── ...
└── other/
    └── ...
```

#### Backup System

- Previous versions are automatically backed up
- Backups stored with timestamp suffixes
- Example: `portfolio-123.md.backup.2024-01-15-14-30`

### Export Options

#### Export Markdown

- Download raw markdown file
- Useful for external editing or backup
- Preserves all embed syntax

#### Export HTML

- Download rendered HTML version
- Includes resolved embeds
- Useful for external publishing

## Advanced Features

### Bulk Operations

#### Batch Editing

- Select multiple portfolio items
- Apply common changes across items
- Update styling or structure consistently

#### Find and Replace

- Search across all markdown content
- Replace text patterns globally
- Update embed syntax in bulk

### Custom Styling

#### CSS Class Library

- Access to predefined class combinations
- Save frequently used class sets
- Apply consistent styling across projects

#### Style Templates

- Create reusable content templates
- Include common layouts and styling
- Speed up content creation process

### Integration Features

#### External Editor Support

- Export to external markdown editors
- Import from external sources
- Maintain embed syntax compatibility

#### Version Control

- Git integration for markdown files
- Track changes over time
- Collaborate with team members

### Accessibility Features

#### Alt Text Management

- Automatic alt text suggestions
- Accessibility compliance checking
- Screen reader optimization

#### Keyboard Navigation

- Full keyboard accessibility
- Tab order optimization
- Screen reader announcements

## Tips and Best Practices

### Content Organization

1. **Use Consistent Structure**
   - Follow the same heading hierarchy
   - Use similar section names across projects
   - Maintain consistent styling patterns

2. **Plan Your Media**
   - Upload and organize media before writing
   - Use descriptive filenames
   - Optimize image sizes for web

3. **Write for Your Audience**
   - Consider who will read your portfolio
   - Include appropriate technical detail
   - Use clear, engaging language

### Performance Optimization

1. **Optimize Media Usage**
   - Don't embed too many large images
   - Use appropriate video formats
   - Consider lazy loading for heavy content

2. **Efficient Styling**
   - Use consistent CSS classes
   - Avoid overly complex styling
   - Test performance on slower devices

### Maintenance

1. **Regular Updates**
   - Review content quarterly
   - Update screenshots and demos
   - Fix broken links

2. **Backup Strategy**
   - Export important content regularly
   - Keep local backups of media files
   - Document your content structure

This guide provides comprehensive coverage of the Data Manager's markdown editing capabilities. Use it as a reference while creating and managing your portfolio content.
