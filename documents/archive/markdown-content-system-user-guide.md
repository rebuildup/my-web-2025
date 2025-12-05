# Markdown Content System - User Guide

## Overview

The Markdown Content System allows you to create rich, formatted content for your portfolio items using Markdown syntax with embedded media support. This system replaces the simple text content with powerful Markdown files that support images, videos, links, and custom styling.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Embed Syntax Reference](#embed-syntax-reference)
3. [Data Manager Guide](#data-manager-guide)
4. [Migration Process](#migration-process)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### What is the Markdown Content System?

The Markdown Content System extends your portfolio content management by:

- Storing detailed content in separate Markdown files
- Supporting rich formatting with standard Markdown syntax
- Enabling embedded images, videos, and links using index references
- Providing live preview and editing capabilities
- Maintaining backward compatibility with existing content

### Key Features

- **Rich Text Formatting**: Use standard Markdown syntax for headers, lists, emphasis, code blocks, and more
- **Media Embeds**: Reference images, videos, and links from your portfolio data using simple index syntax
- **Tailwind CSS Support**: Apply responsive styling and custom classes to embedded content
- **Live Preview**: See your content rendered in real-time as you edit
- **Safe iframe Embeds**: Embed external content with proper security measures
- **Migration Support**: Seamlessly convert existing text content to Markdown

## Embed Syntax Reference

### Image Embeds

Reference images from your portfolio's image array using index-based syntax:

#### Basic Image Embed

```markdown
![image:0]
```

Displays the first image (index 0) from your portfolio's images array.

#### Image with Alt Text

```markdown
![image:1 "Screenshot of the application interface"]
```

Displays the second image with descriptive alt text for accessibility.

#### Image with Tailwind CSS Classes

```markdown
![image:2 "Mobile responsive view" class="w-full md:w-1/2 rounded-lg shadow-md"]
```

Displays the third image with responsive sizing and styling.

#### Common Image Class Examples

```markdown
<!-- Full width responsive image -->

![image:0 "Hero image" class="w-full h-auto rounded-xl shadow-lg"]

<!-- Grid layout images -->

![image:1 "Gallery item" class="w-full sm:w-1/2 lg:w-1/3 p-2 rounded-lg"]

<!-- Centered image with margin -->

![image:2 "Diagram" class="w-2/3 mx-auto my-4 border border-gray-200 rounded"]
```

### Video Embeds

Reference videos from your portfolio's video array:

#### Basic Video Embed

```markdown
![video:0]
```

Embeds the first video from your portfolio's videos array.

#### Video with Title

```markdown
![video:1 "Project demonstration walkthrough"]
```

Embeds the second video with a custom title.

#### Video with Responsive Styling

```markdown
![video:2 "Tutorial video" class="w-full h-64 md:h-96 rounded-lg shadow-md"]
```

Embeds the third video with responsive height and styling.

#### Common Video Class Examples

```markdown
<!-- Aspect ratio controlled video -->

![video:0 "Demo" class="aspect-video w-full rounded-lg"]

<!-- Smaller embedded video -->

![video:1 "Quick demo" class="w-full sm:w-2/3 md:w-1/2 mx-auto rounded-lg shadow"]

<!-- Full-width video with custom height -->

![video:2 "Full presentation" class="w-full h-96 rounded-xl"]
```

### Link Embeds

Reference external links from your portfolio's links array:

#### Basic Link Embed

```markdown
[link:0]
```

Creates a link using the original title from your portfolio's links array.

#### Link with Custom Text

```markdown
[link:1 "Visit the live demo"]
```

Creates a link with custom display text.

#### Styled Link with CSS Classes

```markdown
[link:2 "View Source Code" class="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"]
```

Creates a button-styled link with hover effects.

#### Common Link Class Examples

```markdown
<!-- Button-style links -->

[link:0 "Live Demo" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"]

<!-- Badge-style links -->

[link:1 "GitHub" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"]

<!-- Inline styled links -->

[link:2 "Documentation" class="text-blue-600 hover:text-blue-800 underline font-medium"]
```

### iframe Embeds

Embed external content directly using HTML iframe syntax:

#### Basic iframe

```html
<iframe
  src="https://example.com/embed"
  title="External content"
  class="w-full h-96 rounded-lg border-0"
></iframe>
```

#### CodePen Embed

```html
<iframe
  src="https://codepen.io/username/embed/abc123"
  title="CodePen Demo"
  class="w-full h-64 md:h-80 rounded-lg shadow-md border border-gray-200"
></iframe>
```

#### YouTube Embed (Alternative to video index)

```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube Video"
  class="aspect-video w-full rounded-lg"
  allowfullscreen
></iframe>
```

### Tailwind CSS Class Reference

#### Sizing Classes

- `w-full`, `w-1/2`, `w-1/3`, `w-1/4` - Width control
- `h-auto`, `h-32`, `h-64`, `h-96` - Height control
- `aspect-video`, `aspect-square` - Aspect ratio control

#### Spacing Classes

- `p-2`, `p-4`, `px-4`, `py-2` - Padding
- `m-2`, `m-4`, `mx-auto`, `my-4` - Margin

#### Visual Classes

- `rounded`, `rounded-lg`, `rounded-xl` - Border radius
- `shadow`, `shadow-md`, `shadow-lg` - Drop shadows
- `border`, `border-gray-200` - Borders

#### Responsive Classes

- `sm:w-1/2`, `md:w-1/3`, `lg:w-1/4` - Responsive breakpoints
- `sm:h-48`, `md:h-64`, `lg:h-96` - Responsive heights

## Data Manager Guide

### Accessing the Markdown Editor

1. Open the Data Manager from your portfolio dashboard
2. Select an existing portfolio item or create a new one
3. Navigate to the "Content Details" section
4. You'll see the Markdown Editor with live preview

### Editor Features

#### Live Preview

- The right panel shows a real-time preview of your markdown content
- Embedded media is resolved and displayed as it will appear on the live site
- Changes are reflected immediately as you type

#### Syntax Highlighting

- Markdown syntax is highlighted for better readability
- Embed references are highlighted in different colors
- Invalid syntax is marked with error indicators

#### Embed Helper

- Click the "Insert Image" button to add image embeds with proper syntax
- Use the "Insert Video" button for video embeds
- The "Insert Link" button helps create link embeds
- Dropdown menus show available media indices

#### Auto-completion

- Type `![image:` to see available image indices
- Type `![video:` to see available video options
- Type `[link:` to see available link options
- Tailwind CSS classes are auto-suggested when typing `class="`

### Creating Content with Markdown

1. **Start with a clear structure**:

   ```markdown
   # Project Title

   ## Overview

   Brief description of your project.

   ## Features

   - Feature 1
   - Feature 2

   ## Screenshots

   ![image:0 "Main interface" class="w-full rounded-lg shadow-md"]
   ```

2. **Add media embeds**:
   - Use the embed helper buttons for quick insertion
   - Reference your uploaded images, videos, and links by index
   - Add descriptive alt text and titles

3. **Apply styling**:
   - Use Tailwind CSS classes for responsive design
   - Test different class combinations in the preview
   - Ensure mobile responsiveness with responsive classes

4. **Save and preview**:
   - Click "Save" to store your markdown content
   - The system automatically creates a markdown file
   - Preview the content on the actual detail page

### Editing Existing Content

1. **Open existing item**: Select a portfolio item that already has content
2. **Migration prompt**: If the item uses old text content, you'll see a migration option
3. **Edit markdown**: Make changes in the markdown editor
4. **Auto-save**: Changes are automatically saved as you work
5. **Version history**: Previous versions are backed up automatically

## Migration Process

### Automatic Migration

The system provides one-click migration for existing content:

1. **Identify legacy content**: Items with old text-based content show a migration indicator
2. **Click "Migrate to Markdown"**: A button appears for items that need migration
3. **Review converted content**: The system converts your text to markdown format
4. **Edit and enhance**: Add embeds and formatting to the migrated content
5. **Save changes**: The migration is complete when you save

### Manual Migration Steps

If you prefer manual control:

1. **Copy existing content**: Copy your current text content
2. **Open markdown editor**: Access the markdown editor for the item
3. **Paste and format**: Paste the content and add markdown formatting
4. **Add embeds**: Replace text references with actual embed syntax
5. **Test and save**: Preview the content and save when satisfied

### Migration Best Practices

- **Backup first**: The system automatically backs up original content
- **Migrate gradually**: Don't migrate all content at once
- **Test thoroughly**: Check each migrated item on the detail page
- **Enhance progressively**: Add embeds and formatting after basic migration
- **Use preview**: Always preview before saving migrated content

## Best Practices

### Content Organization

1. **Use clear headings**: Structure your content with H2 and H3 headings
2. **Keep paragraphs short**: Break up long text for better readability
3. **Add descriptive alt text**: Always include alt text for images
4. **Use semantic markup**: Use lists, blockquotes, and emphasis appropriately

### Media Management

1. **Optimize images first**: Ensure images are properly sized before uploading
2. **Use descriptive filenames**: Name your media files clearly
3. **Test embed indices**: Verify that your embed references work correctly
4. **Plan your media order**: Organize images, videos, and links logically

### Styling Guidelines

1. **Mobile-first approach**: Always test responsive classes
2. **Consistent spacing**: Use consistent margin and padding classes
3. **Accessible colors**: Ensure sufficient contrast for text and backgrounds
4. **Performance considerations**: Avoid excessive styling that might slow loading

### Content Writing

1. **Write for your audience**: Consider who will read your portfolio
2. **Include technical details**: Explain your development process and decisions
3. **Show, don't just tell**: Use images and videos to demonstrate features
4. **Keep it updated**: Regularly review and update your content

## Troubleshooting

### Common Issues and Solutions

#### "Markdown file not found" Error

**Problem**: The detail page shows an error that the markdown file cannot be found.

**Solutions**:

1. Check if the file exists in `public/data/content/markdown/portfolio/`
2. Verify the file path in your portfolio data matches the actual file
3. Try re-saving the content in the data manager
4. Check file permissions if running locally

#### Embed References Not Working

**Problem**: `![image:0]` shows as text instead of displaying the image.

**Solutions**:

1. Verify the image index exists in your portfolio's images array
2. Check that the image URL is valid and accessible
3. Ensure the embed syntax is correct (no extra spaces or characters)
4. Try refreshing the page or clearing browser cache

#### Preview Not Updating

**Problem**: Changes in the markdown editor don't appear in the preview.

**Solutions**:

1. Check your internet connection
2. Try refreshing the page
3. Clear browser cache and cookies
4. Check browser console for JavaScript errors

#### Styling Not Applied

**Problem**: Tailwind CSS classes in embed syntax don't work.

**Solutions**:

1. Verify the class names are correct Tailwind CSS classes
2. Check for typos in the class attribute syntax
3. Ensure classes are within quotes: `class="w-full rounded-lg"`
4. Test with simpler classes first (e.g., `class="w-full"`)

#### Migration Failed

**Problem**: The migration process doesn't complete or shows errors.

**Solutions**:

1. Try migrating one item at a time instead of bulk migration
2. Check that you have write permissions to the markdown directory
3. Ensure there's sufficient disk space
4. Contact support if the issue persists

#### Performance Issues

**Problem**: The editor or preview is slow to load or respond.

**Solutions**:

1. Check if you have very large images or videos
2. Reduce the number of embeds in a single document
3. Clear browser cache
4. Try using a different browser
5. Check your internet connection speed

### Getting Help

If you encounter issues not covered in this guide:

1. **Check the browser console**: Look for error messages that might provide clues
2. **Test in different browsers**: Some issues may be browser-specific
3. **Try incognito/private mode**: This helps identify cache-related issues
4. **Document the issue**: Note the exact steps that led to the problem
5. **Contact support**: Provide detailed information about the issue and your environment

### Error Messages Reference

| Error Message             | Meaning                                            | Solution                                         |
| ------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| "Invalid embed index"     | The index number doesn't exist in your media array | Check available indices in your portfolio data   |
| "Malformed embed syntax"  | The embed syntax has incorrect formatting          | Review the syntax examples in this guide         |
| "File permission denied"  | Cannot write to the markdown file                  | Check file permissions or contact administrator  |
| "Markdown file too large" | The markdown file exceeds size limits              | Reduce content size or split into multiple items |
| "Invalid CSS class"       | A Tailwind CSS class is not recognized             | Use only valid Tailwind CSS classes              |

---

## Quick Reference Card

### Essential Embed Syntax

```markdown
![image:0] # Basic image
![image:0 "Alt text"] # Image with alt text
![image:0 "Alt text" class="w-full rounded"] # Styled image

![video:0] # Basic video
![video:0 "Title"] # Video with title
![video:0 "Title" class="aspect-video"] # Styled video

[link:0] # Basic link
[link:0 "Custom text"] # Link with custom text
[link:0 "Text" class="btn btn-primary"] # Styled link
```

### Common Tailwind Classes

```css
/* Sizing */
w-full w-1/2 w-1/3 w-1/4
h-auto h-32 h-64 h-96
aspect-video aspect-square

/* Spacing */
p-2 p-4 px-4 py-2
m-2 m-4 mx-auto my-4

/* Visual */
rounded rounded-lg rounded-xl
shadow shadow-md shadow-lg
border border-gray-200

/* Responsive */
sm:w-1/2 md:w-1/3 lg:w-1/4
sm:h-48 md:h-64 lg:h-96
```

This user guide provides comprehensive documentation for using the Markdown Content System effectively. Keep this guide handy as you create and manage your portfolio content.
