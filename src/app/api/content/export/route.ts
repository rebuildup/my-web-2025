import { NextRequest, NextResponse } from 'next/server';
import { ContentItem } from '@/types/content';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    // Load content data
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const dataPath = path.join(dataDir, 'content.json');
    
    let contentItems: ContentItem[] = [];
    
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      contentItems = JSON.parse(data);
    }

    switch (format) {
      case 'json':
        return new NextResponse(JSON.stringify(contentItems, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="content-export.json"'
          }
        });

      case 'csv':
        const csvContent = convertToCSV(contentItems);
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="content-export.csv"'
          }
        });

      case 'markdown':
        const markdownContent = convertToMarkdown(contentItems);
        return new NextResponse(markdownContent, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': 'attachment; filename="content-export.md"'
          }
        });

      default:
        return NextResponse.json(
          { error: 'Unsupported format. Use: json, csv, or markdown' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error exporting content:', error);
    return NextResponse.json(
      { error: 'Failed to export content' },
      { status: 500 }
    );
  }
}

function convertToCSV(items: ContentItem[]): string {
  if (items.length === 0) return '';

  const headers = [
    'id',
    'type',
    'title',
    'description',
    'category',
    'tags',
    'status',
    'priority',
    'createdAt',
    'updatedAt',
    'publishedAt',
    'thumbnail',
    'images',
    'views',
    'downloads',
    'likes'
  ];

  const csvRows = [headers.join(',')];

  items.forEach(item => {
    const row = [
      `"${item.id}"`,
      `"${item.type}"`,
      `"${item.title?.replace(/"/g, '""') || ''}"`,
      `"${item.description?.replace(/"/g, '""') || ''}"`,
      `"${item.category}"`,
      `"${item.tags.join('; ')}"`,
      `"${item.status}"`,
      item.priority.toString(),
      `"${item.createdAt}"`,
      `"${item.updatedAt || ''}"`,
      `"${item.publishedAt || ''}"`,
      `"${item.thumbnail || ''}"`,
      `"${item.images?.join('; ') || ''}"`,
      (item.stats?.views || 0).toString(),
      (item.stats?.downloads || 0).toString(),
      (item.stats?.likes || 0).toString()
    ];
    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

function convertToMarkdown(items: ContentItem[]): string {
  let markdown = '# Content Export\n\n';
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;
  markdown += `Total Items: ${items.length}\n\n`;

  items.forEach(item => {
    markdown += `## ${item.title}\n\n`;
    markdown += `- **ID:** ${item.id}\n`;
    markdown += `- **Type:** ${item.type}\n`;
    markdown += `- **Category:** ${item.category}\n`;
    markdown += `- **Status:** ${item.status}\n`;
    markdown += `- **Priority:** ${item.priority}\n`;
    markdown += `- **Created:** ${item.createdAt}\n`;
    
    if (item.updatedAt) {
      markdown += `- **Updated:** ${item.updatedAt}\n`;
    }
    
    if (item.publishedAt) {
      markdown += `- **Published:** ${item.publishedAt}\n`;
    }

    if (item.tags.length > 0) {
      markdown += `- **Tags:** ${item.tags.join(', ')}\n`;
    }

    markdown += `\n**Description:**\n${item.description}\n\n`;

    if (item.content) {
      markdown += `**Content:**\n\n`;
      markdown += item.content;
      markdown += '\n\n';
    }

    if (item.images && item.images.length > 0) {
      markdown += `**Images:**\n`;
      item.images.forEach(image => {
        markdown += `- ![Image](${image})\n`;
      });
      markdown += '\n';
    }

    if (item.stats) {
      markdown += `**Statistics:**\n`;
      markdown += `- Views: ${item.stats.views || 0}\n`;
      if (item.stats.downloads) {
        markdown += `- Downloads: ${item.stats.downloads}\n`;
      }
      if (item.stats.likes) {
        markdown += `- Likes: ${item.stats.likes}\n`;
      }
      if (item.stats.shares) {
        markdown += `- Shares: ${item.stats.shares}\n`;
      }
      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
}