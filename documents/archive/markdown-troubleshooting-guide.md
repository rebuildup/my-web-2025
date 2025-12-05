# Markdown Content System - Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues with the Markdown Content System. Issues are organized by category with step-by-step solutions.

## Table of Contents

1. [Quick Diagnostics](#quick-diagnostics)
2. [Editor Issues](#editor-issues)
3. [Embed Problems](#embed-problems)
4. [File System Issues](#file-system-issues)
5. [Display Problems](#display-problems)
6. [Performance Issues](#performance-issues)
7. [Migration Problems](#migration-problems)
8. [Browser-Specific Issues](#browser-specific-issues)
9. [Advanced Troubleshooting](#advanced-troubleshooting)

## Quick Diagnostics

### First Steps for Any Issue

1. **Check Browser Console**
   - Press F12 to open developer tools
   - Look for red error messages in the Console tab
   - Note any network errors in the Network tab

2. **Verify Basic Functionality**
   - Can you access the data manager?
   - Does the markdown editor load?
   - Are other portfolio features working?

3. **Test in Incognito Mode**
   - Open an incognito/private browser window
   - Try reproducing the issue
   - This helps identify cache-related problems

4. **Check File Permissions**
   - Verify you can create/edit files in the project directory
   - Check that `public/data/content/markdown/` exists and is writable

### System Status Checklist

- [ ] Data manager loads without errors
- [ ] Markdown editor appears in portfolio item forms
- [ ] Live preview shows content
- [ ] Detail pages display markdown content
- [ ] Embed references resolve correctly
- [ ] File operations (save/load) work

## Editor Issues

### Editor Won't Load

**Symptoms**: Markdown editor doesn't appear or shows blank space

**Possible Causes**:

- JavaScript errors preventing component loading
- Missing dependencies
- Browser compatibility issues

**Solutions**:

1. **Check Browser Console**

   ```
   Look for errors like:
   - "Cannot read property of undefined"
   - "Module not found"
   - "Syntax error"
   ```

2. **Clear Browser Cache**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Clear all browser data for the site
   - Try a different browser

3. **Verify Dependencies**

   ```bash
   # Check if all packages are installed
   npm list

   # Reinstall if needed
   npm install
   ```

4. **Check Component Import**
   ```javascript
   // Verify MarkdownEditor is properly imported
   import MarkdownEditor from "@/components/MarkdownEditor";
   ```

### Live Preview Not Working

**Symptoms**: Preview panel is blank or not updating

**Possible Causes**:

- Markdown parsing errors
- Embed resolution failures
- CSS styling conflicts

**Solutions**:

1. **Test with Simple Content**

   ```markdown
   # Test Header

   This is a simple test.
   ```

2. **Check for Syntax Errors**
   - Look for unclosed quotes in embed syntax
   - Verify proper markdown formatting
   - Check for invalid characters

3. **Disable Embeds Temporarily**
   - Remove all embed references
   - Test if preview works with plain markdown
   - Add embeds back one at a time

4. **Inspect Preview Container**
   ```javascript
   // Check if preview container exists
   const preview = document.querySelector(".markdown-preview");
   console.log(preview);
   ```

### Auto-Save Not Working

**Symptoms**: Changes are lost when navigating away

**Possible Causes**:

- Network connectivity issues
- Server-side save failures
- JavaScript errors interrupting save process

**Solutions**:

1. **Manual Save**
   - Always click "Save" before navigating away
   - Look for save confirmation messages

2. **Check Network Tab**
   - Monitor save requests in browser dev tools
   - Look for failed HTTP requests
   - Check response status codes

3. **Test Connection**
   ```javascript
   // Test if save endpoint is reachable
   fetch("/api/save-markdown", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ test: true }),
   }).then((response) => console.log(response.status));
   ```

## Embed Problems

### Images Not Displaying

**Symptoms**: `![image:0]` shows as text instead of image

**Diagnostic Steps**:

1. **Verify Image Index**

   ```javascript
   // Check portfolio item data
   console.log(portfolioItem.images);
   // Ensure index 0 exists and has a valid URL
   ```

2. **Test Image URL**

   ```javascript
   // Test if image URL is accessible
   const img = new Image();
   img.onload = () => console.log("Image loads successfully");
   img.onerror = () => console.log("Image failed to load");
   img.src = portfolioItem.images[0];
   ```

3. **Check Embed Syntax**

   ```markdown
   # Correct syntax

   ![image:0]
   ![image:0 "Alt text"]
   ![image:0 "Alt text" class="w-full"]

   # Incorrect syntax (will not work)

   ![image: 0] # Extra space
   ![image:0} # Wrong bracket
   ![image:a] # Non-numeric index
   ```

**Solutions**:

1. **Fix Index References**
   - Ensure the index exists in the images array
   - Remember indices are zero-based (first image is 0)
   - Check for typos in the index number

2. **Verify Image URLs**
   - Ensure image files exist and are accessible
   - Check file permissions
   - Test URLs directly in browser

3. **Update Embed Syntax**

   ```markdown
   # If you have 3 images, valid indices are 0, 1, 2

   ![image:0 "First image"]
   ![image:1 "Second image"]
   ![image:2 "Third image"]
   ```

### Videos Not Embedding

**Symptoms**: Video embeds show as text or broken players

**Diagnostic Steps**:

1. **Check Video Data Structure**

   ```javascript
   console.log(portfolioItem.videos);
   // Should show array of video objects with url, title, etc.
   ```

2. **Verify Video URLs**
   - Test video URLs directly in browser
   - Check if videos are properly formatted
   - Ensure video files are accessible

3. **Test Embed Syntax**

   ```markdown
   # Basic video embed

   ![video:0]

   # With title

   ![video:0 "Demo video"]

   # With styling

   ![video:0 "Demo" class="aspect-video w-full"]
   ```

**Solutions**:

1. **Fix Video Data**

   ```json
   {
     "videos": [
       {
         "url": "https://youtube.com/embed/VIDEO_ID",
         "title": "Project Demo",
         "type": "youtube"
       }
     ]
   }
   ```

2. **Update Video URLs**
   - Use embed URLs for YouTube: `https://youtube.com/embed/VIDEO_ID`
   - Use proper URLs for Vimeo: `https://player.vimeo.com/video/VIDEO_ID`
   - Ensure local video files are in the public directory

### Links Not Working

**Symptoms**: Link embeds don't create clickable links

**Diagnostic Steps**:

1. **Check Link Data**

   ```javascript
   console.log(portfolioItem.externalLinks);
   // Verify link objects have url and title properties
   ```

2. **Test Link Syntax**
   ```markdown
   [link:0] # Basic link
   [link:0 "Custom text"] # With custom text
   [link:0 "Text" class="btn"] # With styling
   ```

**Solutions**:

1. **Verify Link Structure**

   ```json
   {
     "externalLinks": [
       {
         "url": "https://example.com",
         "title": "Live Demo",
         "type": "demo"
       }
     ]
   }
   ```

2. **Check URL Validity**
   - Ensure URLs include protocol (http:// or https://)
   - Test URLs directly in browser
   - Verify external sites are accessible

### CSS Classes Not Applied

**Symptoms**: Tailwind CSS classes in embeds don't work

**Diagnostic Steps**:

1. **Verify Class Syntax**

   ```markdown
   # Correct

   ![image:0 "Alt text" class="w-full rounded-lg"]

   # Incorrect

   ![image:0 "Alt text" class=w-full] # Missing quotes
   ![image:0 "Alt text" className="..."] # Wrong attribute
   ```

2. **Check Class Validity**
   - Use only valid Tailwind CSS classes
   - Check for typos in class names
   - Verify classes are supported in your Tailwind config

**Solutions**:

1. **Use Valid Tailwind Classes**

   ```markdown
   # Common valid classes

   class="w-full h-auto rounded-lg shadow-md"
   class="aspect-video w-full rounded-lg"
   class="bg-blue-500 text-white px-4 py-2 rounded"
   ```

2. **Test Classes Individually**

   ```markdown
   # Test one class at a time

   ![image:0 "Test" class="w-full"]
   ![image:0 "Test" class="rounded-lg"]
   ![image:0 "Test" class="shadow-md"]
   ```

## File System Issues

### Cannot Save Markdown Files

**Symptoms**: Save operation fails with permission errors

**Possible Causes**:

- Insufficient file permissions
- Directory doesn't exist
- Disk space full
- File is locked by another process

**Solutions**:

1. **Check Directory Permissions**

   ```bash
   # Linux/Mac
   ls -la public/data/content/markdown/
   chmod 755 public/data/content/markdown/

   # Windows
   # Right-click folder → Properties → Security → Edit permissions
   ```

2. **Create Missing Directories**

   ```bash
   mkdir -p public/data/content/markdown/portfolio
   mkdir -p public/data/content/markdown/download
   mkdir -p public/data/content/markdown/other
   ```

3. **Check Disk Space**

   ```bash
   # Linux/Mac
   df -h

   # Windows
   # Check drive properties in File Explorer
   ```

### Markdown Files Not Found

**Symptoms**: "File not found" errors when loading content

**Diagnostic Steps**:

1. **Verify File Exists**

   ```bash
   ls public/data/content/markdown/portfolio/
   ```

2. **Check File Path in Data**

   ```javascript
   // Verify markdownPath matches actual file location
   console.log(portfolioItem.markdownPath);
   ```

3. **Test File Access**
   ```javascript
   // Test if file is readable
   fetch("/data/content/markdown/portfolio/item-123.md")
     .then((response) => console.log(response.status))
     .catch((error) => console.error(error));
   ```

**Solutions**:

1. **Recreate Missing Files**
   - Use the data manager to re-save the content
   - This will regenerate the markdown file

2. **Fix File Paths**

   ```javascript
   // Update portfolio item with correct path
   portfolioItem.markdownPath = "portfolio/correct-filename.md";
   ```

3. **Restore from Backup**
   - Check if backup files exist
   - Restore from version control if available

## Display Problems

### Content Not Showing on Detail Pages

**Symptoms**: Detail pages are blank or show fallback content

**Diagnostic Steps**:

1. **Check Network Requests**
   - Open browser dev tools → Network tab
   - Look for failed requests to markdown files
   - Check response status codes

2. **Verify Component Rendering**

   ```javascript
   // Check if MarkdownRenderer component is mounted
   const renderer = document.querySelector(".markdown-renderer");
   console.log(renderer);
   ```

3. **Test with Simple Content**
   - Create a test markdown file with basic content
   - See if it displays correctly

**Solutions**:

1. **Fix File Loading**

   ```javascript
   // Ensure correct file path resolution
   const filePath = `/data/content/markdown/${item.markdownPath}`;
   ```

2. **Check Component Props**
   ```jsx
   <MarkdownRenderer
     filePath={item.markdownPath}
     mediaData={{
       images: item.images,
       videos: item.videos,
       externalLinks: item.externalLinks,
     }}
   />
   ```

### Styling Issues

**Symptoms**: Content displays but styling is broken

**Possible Causes**:

- CSS conflicts
- Missing Tailwind CSS classes
- Incorrect component styling

**Solutions**:

1. **Check CSS Loading**

   ```html
   <!-- Ensure Tailwind CSS is loaded -->
   <link href="/path/to/tailwind.css" rel="stylesheet" />
   ```

2. **Inspect Element Styles**
   - Use browser dev tools to inspect elements
   - Check if classes are being applied
   - Look for CSS conflicts

3. **Test with Minimal Styling**

   ```markdown
   # Test with basic classes

   ![image:0 "Test" class="w-full"]
   ```

## Performance Issues

### Slow Loading

**Symptoms**: Markdown content takes long time to load

**Possible Causes**:

- Large markdown files
- Many embedded media items
- Network latency
- Inefficient parsing

**Solutions**:

1. **Optimize Content Size**
   - Break large content into smaller sections
   - Reduce number of embeds per page
   - Compress images before embedding

2. **Implement Caching**

   ```javascript
   // Cache parsed markdown content
   const cache = new Map();

   function getCachedContent(filePath) {
     if (cache.has(filePath)) {
       return cache.get(filePath);
     }
     // Load and cache content
   }
   ```

3. **Lazy Load Media**
   ```html
   <iframe loading="lazy" src="..."></iframe>
   <img loading="lazy" src="..." alt="..." />
   ```

### Memory Issues

**Symptoms**: Browser becomes slow or crashes

**Solutions**:

1. **Limit Concurrent Operations**
   - Don't load too many markdown files simultaneously
   - Implement pagination for large content lists

2. **Clean Up Resources**
   ```javascript
   // Clean up event listeners and references
   useEffect(() => {
     return () => {
       // Cleanup code
     };
   }, []);
   ```

## Migration Problems

### Migration Stuck or Failed

**Symptoms**: Migration process doesn't complete

**Diagnostic Steps**:

1. **Check Migration Status**

   ```javascript
   // Check individual item migration status
   console.log(portfolioItem.markdownMigrated);
   console.log(portfolioItem.markdownPath);
   ```

2. **Look for Error Messages**
   - Check browser console for errors
   - Look for server-side error logs

**Solutions**:

1. **Reset Migration Status**

   ```javascript
   // Reset failed migration
   portfolioItem.markdownMigrated = false;
   delete portfolioItem.markdownPath;
   ```

2. **Manual Migration**
   - Copy content manually to markdown editor
   - Save through the data manager interface

3. **Batch Migration Issues**
   - Try migrating items one at a time
   - Identify problematic items and handle separately

## Browser-Specific Issues

### Safari Issues

**Common Problems**:

- File API limitations
- CSS grid/flexbox differences
- JavaScript compatibility

**Solutions**:

- Test in Safari regularly
- Use CSS prefixes for Safari-specific properties
- Implement Safari-specific workarounds

### Internet Explorer/Edge Legacy

**Common Problems**:

- ES6+ syntax not supported
- CSS custom properties not working
- Fetch API not available

**Solutions**:

- Use Babel for JavaScript transpilation
- Provide CSS fallbacks
- Use polyfills for missing APIs

### Mobile Browsers

**Common Problems**:

- Touch interaction issues
- Viewport scaling problems
- Performance limitations

**Solutions**:

- Test on actual mobile devices
- Optimize for touch interfaces
- Reduce resource usage on mobile

## Advanced Troubleshooting

### Debug Mode

Enable debug mode for detailed logging:

```javascript
// Add to your environment variables
DEBUG_MARKDOWN = true;

// Or set in browser console
localStorage.setItem("debug-markdown", "true");
```

### Network Analysis

Monitor network requests:

```javascript
// Log all fetch requests
const originalFetch = window.fetch;
window.fetch = function (...args) {
  console.log("Fetch request:", args);
  return originalFetch.apply(this, args);
};
```

### Performance Profiling

Use browser dev tools:

1. **Performance Tab**
   - Record page load and interactions
   - Identify slow operations
   - Look for memory leaks

2. **Memory Tab**
   - Monitor memory usage
   - Take heap snapshots
   - Identify memory leaks

### Error Boundary Implementation

Add error boundaries to catch React errors:

```jsx
class MarkdownErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Markdown component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the markdown content.</div>;
    }

    return this.props.children;
  }
}
```

## Getting Additional Help

### Information to Collect

When seeking help, provide:

1. **Error Messages**
   - Exact error text from console
   - Stack traces if available
   - Network error details

2. **Environment Details**
   - Browser version and type
   - Operating system
   - Node.js version
   - Package versions

3. **Reproduction Steps**
   - Exact steps to reproduce the issue
   - Sample content that causes problems
   - Screenshots or screen recordings

4. **System Information**
   - Available disk space
   - Memory usage
   - Network connectivity

### Useful Commands

```bash
# Check system information
node --version
npm --version
npm list --depth=0

# Check file permissions
ls -la public/data/content/markdown/

# Check disk space
df -h

# Check memory usage
free -h  # Linux
vm_stat  # Mac
```

### Log Collection

Enable comprehensive logging:

```javascript
// Add to your application
console.log("Markdown system debug info:", {
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString(),
  portfolioItems: portfolioData.length,
  markdownFiles: markdownFileCount,
  errors: errorLog,
});
```

This troubleshooting guide covers the most common issues you might encounter with the Markdown Content System. Keep this guide handy for quick reference when problems arise.
