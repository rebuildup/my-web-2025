# Markdown Embed Syntax Reference

## Quick Reference

This document provides a comprehensive reference for all supported embed syntax in the Markdown Content System.

## Image Embeds

### Basic Syntax

```markdown
![image:INDEX]
```

### With Alt Text

```markdown
![image:INDEX "Alt text description"]
```

### With Tailwind CSS Classes

```markdown
![image:INDEX "Alt text" class="tailwind-classes"]
```

### Examples

#### Responsive Image Gallery

```markdown
<!-- Mobile: full width, Desktop: 1/3 width -->

![image:0 "Project screenshot" class="w-full md:w-1/3 p-2 rounded-lg shadow-md"]
![image:1 "Mobile view" class="w-full md:w-1/3 p-2 rounded-lg shadow-md"]
![image:2 "Desktop view" class="w-full md:w-1/3 p-2 rounded-lg shadow-md"]
```

#### Hero Image

```markdown
![image:0 "Project hero image" class="w-full h-64 md:h-96 object-cover rounded-xl shadow-lg"]
```

#### Centered Image with Border

```markdown
![image:1 "Architecture diagram" class="w-2/3 mx-auto border-2 border-gray-300 rounded-lg p-4"]
```

## Video Embeds

### Basic Syntax

```markdown
![video:INDEX]
```

### With Title

```markdown
![video:INDEX "Video title"]
```

### With Tailwind CSS Classes

```markdown
![video:INDEX "Video title" class="tailwind-classes"]
```

### Examples

#### Responsive Video Player

```markdown
![video:0 "Project demonstration" class="aspect-video w-full rounded-lg shadow-md"]
```

#### Smaller Embedded Video

```markdown
![video:1 "Quick feature demo" class="w-full sm:w-2/3 md:w-1/2 mx-auto h-64 rounded-lg"]
```

#### Video Grid Layout

```markdown
![video:0 "Overview" class="w-full md:w-1/2 p-2 aspect-video rounded-lg"]
![video:1 "Details" class="w-full md:w-1/2 p-2 aspect-video rounded-lg"]
```

## Link Embeds

### Basic Syntax

```markdown
[link:INDEX]
```

### With Custom Text

```markdown
[link:INDEX "Custom link text"]
```

### With Tailwind CSS Classes

```markdown
[link:INDEX "Custom text" class="tailwind-classes"]
```

### Examples

#### Button-Style Links

```markdown
[link:0 "Live Demo" class="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"]
[link:1 "Source Code" class="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium ml-4"]
```

#### Badge-Style Links

```markdown
[link:2 "GitHub" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium mr-2"]
[link:3 "Documentation" class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-2"]
```

#### Inline Text Links

```markdown
Check out the [link:0 "live demo" class="text-blue-600 hover:text-blue-800 underline"] or view the [link:1 "source code" class="text-green-600 hover:text-green-800 underline"].
```

## iframe Embeds

### Basic Syntax

```html
<iframe src="URL" title="Description" class="tailwind-classes"></iframe>
```

### Common Attributes

- `src`: The URL to embed
- `title`: Accessible description
- `class`: Tailwind CSS classes
- `width`: Width (use Tailwind classes instead)
- `height`: Height (use Tailwind classes instead)
- `allowfullscreen`: For video embeds
- `loading`: Set to "lazy" for performance

### Examples

#### CodePen Embed

```html
<iframe
  src="https://codepen.io/username/embed/abc123?default-tab=html,result"
  title="CodePen Demo - Project Name"
  class="w-full h-96 rounded-lg border border-gray-200 shadow-md"
  loading="lazy"
>
</iframe>
```

#### YouTube Embed

```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="YouTube Video - Project Demo"
  class="aspect-video w-full rounded-lg shadow-lg"
  allowfullscreen
  loading="lazy"
>
</iframe>
```

#### Interactive Demo

```html
<iframe
  src="https://example.com/interactive-demo"
  title="Interactive Project Demo"
  class="w-full h-screen max-h-96 md:max-h-screen rounded-lg border-0 shadow-xl"
  loading="lazy"
>
</iframe>
```

## Tailwind CSS Classes Reference

### Layout & Sizing

```css
/* Width */
w-full w-1/2 w-1/3 w-1/4 w-2/3 w-3/4
w-32 w-48 w-64 w-96

/* Height */
h-auto h-32 h-48 h-64 h-96 h-screen
max-h-32 max-h-48 max-h-64 max-h-96 max-h-screen

/* Aspect Ratio */
aspect-square aspect-video aspect-[4/3] aspect-[16/9]
```

### Spacing

```css
/* Padding */
p-0 p-1 p-2 p-4 p-6 p-8
px-2 px-4 px-6 py-2 py-4 py-6

/* Margin */
m-0 m-1 m-2 m-4 m-6 m-8
mx-auto mx-2 mx-4 my-2 my-4 my-6
ml-2 ml-4 mr-2 mr-4 mt-2 mt-4 mb-2 mb-4
```

### Visual Styling

```css
/* Borders */
border border-2 border-4
border-gray-200 border-gray-300 border-blue-500
rounded rounded-md rounded-lg rounded-xl rounded-full
border-0 border-t border-b border-l border-r

/* Shadows */
shadow shadow-sm shadow-md shadow-lg shadow-xl shadow-2xl
shadow-inner shadow-none

/* Background Colors */
bg-white bg-gray-50 bg-gray-100 bg-gray-800 bg-gray-900
bg-blue-50 bg-blue-100 bg-blue-500 bg-blue-600
bg-green-50 bg-green-100 bg-green-500 bg-green-600
```

### Typography

```css
/* Text Colors */
text-gray-600 text-gray-800 text-gray-900
text-blue-600 text-blue-800 text-green-600 text-green-800
text-white text-black

/* Font Weight */
font-light font-normal font-medium font-semibold font-bold

/* Font Size */
text-xs text-sm text-base text-lg text-xl text-2xl

/* Text Decoration */
underline no-underline hover:underline
```

### Interactive States

```css
/* Hover Effects */
hover:bg-blue-600 hover:text-white hover:shadow-lg
hover:scale-105 hover:opacity-80

/* Transitions */
transition transition-colors transition-all
duration-150 duration-200 duration-300
```

### Responsive Design

```css
/* Breakpoint Prefixes */
sm:   /* 640px and up */
md:   /* 768px and up */
lg:   /* 1024px and up */
xl:   /* 1280px and up */
2xl:  /* 1536px and up */

/* Examples */
w-full sm:w-1/2 md:w-1/3 lg:w-1/4
h-48 md:h-64 lg:h-96
p-2 md:p-4 lg:p-6
```

## Advanced Examples

### Image Gallery with Lightbox Effect

```markdown
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

![image:0 "Screenshot 1" class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"]

![image:1 "Screenshot 2" class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"]

![image:2 "Screenshot 3" class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"]

</div>
```

### Video Showcase Section

```markdown
## Project Demo

![video:0 "Full project walkthrough" class="aspect-video w-full rounded-xl shadow-2xl mb-8"]

### Feature Highlights

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">

![video:1 "User interface demo" class="aspect-video w-full rounded-lg shadow-lg"]

![video:2 "Backend functionality" class="aspect-video w-full rounded-lg shadow-lg"]

</div>
```

### Call-to-Action Section

```markdown
## Try It Yourself

<div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border border-blue-200 my-8">

Experience the project firsthand with these interactive links:

<div class="flex flex-wrap gap-4 mt-6">

[link:0 "🚀 Live Demo" class="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"]

[link:1 "📚 Documentation" class="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium border-2 border-blue-500 shadow-md hover:shadow-lg"]

[link:2 "💻 Source Code" class="inline-flex items-center bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium shadow-md hover:shadow-lg"]

</div>

</div>
```

## Validation Rules

### Index Validation

- Image indices must exist in the portfolio's `images` array
- Video indices must exist in the portfolio's `videos` array
- Link indices must exist in the portfolio's `externalLinks` array
- Indices are zero-based (first item is index 0)

### CSS Class Validation

- Only valid Tailwind CSS classes are allowed
- Custom CSS classes are not supported
- Classes must be properly quoted: `class="valid-class"`
- Multiple classes are space-separated: `class="class1 class2 class3"`

### Security Considerations

- iframe sources are validated against allowed domains
- All HTML content is sanitized to prevent XSS attacks
- CSS classes are validated to prevent injection attacks
- File paths are validated to prevent directory traversal

## Error Handling

### Common Error Messages

| Error                             | Cause                                 | Solution                          |
| --------------------------------- | ------------------------------------- | --------------------------------- |
| "Invalid image index: 5"          | Index 5 doesn't exist in images array | Check available indices (0-based) |
| "Malformed embed syntax"          | Incorrect syntax format               | Review syntax examples            |
| "Invalid CSS class: custom-class" | Non-Tailwind class used               | Use only Tailwind CSS classes     |
| "Missing closing quote in embed"  | Unclosed quote in alt text or class   | Add missing quote                 |
| "iframe source not allowed"       | Unsafe iframe URL                     | Use only trusted domains          |

### Best Practices for Error Prevention

1. **Always validate indices**: Check your media arrays before using indices
2. **Use proper quotes**: Always quote alt text and CSS classes
3. **Test incrementally**: Add embeds one at a time and test
4. **Use the preview**: Always check the live preview before saving
5. **Keep syntax simple**: Start with basic embeds before adding styling

This reference guide covers all supported embed syntax and styling options for the Markdown Content System.
