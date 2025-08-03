/**
 * Demonstration script for the markdown file management system
 * Run this to see the system in action
 */

import {
  getDirectoryStats,
  initializeDirectoryStructure,
  markdownFileManager,
  validateDirectoryStructure,
} from "./index";

async function demonstrateMarkdownSystem() {
  console.log("🚀 Markdown File Management System Demo\n");

  try {
    // 1. Initialize directory structure
    console.log("1. Initializing directory structure...");
    await initializeDirectoryStructure();
    console.log("✅ Directory structure initialized\n");

    // 2. Validate structure
    console.log("2. Validating directory structure...");
    const validation = await validateDirectoryStructure();
    if (validation.isValid) {
      console.log("✅ Directory structure is valid");
    } else {
      console.log("❌ Directory structure validation failed:");
      console.log("Missing directories:", validation.missingDirectories);
    }
    console.log();

    // 3. Create sample markdown files
    console.log("3. Creating sample markdown files...");

    const portfolioContent = `# Sample Portfolio Item

This is a sample portfolio item with markdown content.

## Features

- Rich text formatting
- Code blocks
- Lists and more

## Embedded Content

Here we can reference embedded content:
- Images: ![image:0]
- Videos: ![video:0]
- Links: [link:0]

## Code Example

\`\`\`typescript
const example = "This is a code example";
console.log(example);
\`\`\`
`;

    const blogContent = `# Sample Blog Post

This is a sample blog post written in markdown.

## Introduction

Welcome to our blog! This post demonstrates the markdown content system.

## Content

You can write rich content with:

1. **Bold text**
2. *Italic text*
3. \`Inline code\`
4. [Links](https://example.com)

### Subsection

More content here with embedded references:
- ![image:1 "Sample image"]
- ![video:1 "Demo video"]
`;

    // Create files
    const portfolioPath = await markdownFileManager.createMarkdownFile(
      "demo-portfolio-" + Date.now(),
      "portfolio",
      portfolioContent,
    );

    const blogPath = await markdownFileManager.createMarkdownFile(
      "demo-blog-" + Date.now(),
      "blog",
      blogContent,
    );

    console.log("✅ Created portfolio file:", portfolioPath);
    console.log("✅ Created blog file:", blogPath);
    console.log();

    // 4. List files
    console.log("4. Listing markdown files...");
    const portfolioFiles =
      await markdownFileManager.listMarkdownFiles("portfolio");
    const blogFiles = await markdownFileManager.listMarkdownFiles("blog");

    console.log(`📁 Portfolio files (${portfolioFiles.length}):`);
    portfolioFiles.forEach((file) => {
      console.log(
        `  - ${file.id} (${file.size} bytes, updated: ${file.updatedAt})`,
      );
    });

    console.log(`📁 Blog files (${blogFiles.length}):`);
    blogFiles.forEach((file) => {
      console.log(
        `  - ${file.id} (${file.size} bytes, updated: ${file.updatedAt})`,
      );
    });
    console.log();

    // 5. Get directory statistics
    console.log("5. Directory statistics...");
    const stats = await getDirectoryStats();
    Object.entries(stats).forEach(([contentType, stat]) => {
      if (stat.fileCount > 0) {
        console.log(
          `📊 ${contentType}: ${stat.fileCount} files, ${stat.totalSize} bytes`,
        );
      }
    });
    console.log();

    // 6. Demonstrate file operations
    console.log("6. Demonstrating file operations...");

    // Read content
    const readContent =
      await markdownFileManager.getMarkdownContent(portfolioPath);
    console.log(
      "✅ Successfully read portfolio content (length:",
      readContent.length,
      "chars)",
    );

    // Update content
    const updatedContent =
      readContent +
      "\n\n## Updated Section\n\nThis content was added via update operation.";
    await markdownFileManager.updateMarkdownFile(portfolioPath, updatedContent);
    console.log("✅ Successfully updated portfolio content");

    // Verify update
    const verifyContent =
      await markdownFileManager.getMarkdownContent(portfolioPath);
    console.log(
      "✅ Verified update (new length:",
      verifyContent.length,
      "chars)",
    );
    console.log();

    console.log("🎉 Demo completed successfully!");
    console.log("\nThe markdown file management system is ready to use.");
    console.log(
      "You can now integrate it with your data manager and detail pages.",
    );
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateMarkdownSystem();
}

export { demonstrateMarkdownSystem };
