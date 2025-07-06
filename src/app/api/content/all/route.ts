import { NextRequest, NextResponse } from 'next/server';
import { ContentItem } from '@/types/content';
import fs from 'fs';
import path from 'path';

// Sample data structure for development
const sampleContentItems: ContentItem[] = [
  {
    id: 'portfolio-1',
    type: 'portfolio',
    title: 'Interactive Web Application',
    description: 'A modern web application built with React and TypeScript',
    category: 'web-development',
    tags: ['React', 'TypeScript', 'Next.js'],
    status: 'published',
    priority: 90,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    publishedAt: '2024-01-16T14:30:00Z',
    thumbnail: '/images/portfolio/web-app-thumb.jpg',
    images: ['/images/portfolio/web-app-1.jpg', '/images/portfolio/web-app-2.jpg'],
    content: '# Interactive Web Application\n\nThis project showcases...',
    stats: {
      views: 1247,
      likes: 89,
      shares: 12,
      lastViewed: '2024-01-20T09:15:00Z'
    }
  },
  {
    id: 'tool-1',
    type: 'tool',
    title: 'Color Palette Generator',
    description: 'Generate beautiful color palettes with color theory algorithms',
    category: 'design-tools',
    tags: ['Color', 'Design', 'Tool'],
    status: 'published',
    priority: 85,
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
    publishedAt: '2024-01-15T16:45:00Z',
    thumbnail: '/images/tools/color-palette-thumb.jpg',
    content: '# Color Palette Generator\n\nCreate harmonious color schemes...',
    stats: {
      views: 892,
      downloads: 156,
      lastViewed: '2024-01-19T11:30:00Z'
    }
  },
  {
    id: 'blog-1',
    type: 'blog',
    title: 'Understanding React Server Components',
    description: 'A deep dive into React Server Components and their benefits',
    category: 'tutorials',
    tags: ['React', 'Server Components', 'Next.js'],
    status: 'draft',
    priority: 70,
    createdAt: '2024-01-18T14:00:00Z',
    content: '# Understanding React Server Components\n\nReact Server Components...',
    stats: {
      views: 45,
      lastViewed: '2024-01-18T16:20:00Z'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    // In development, return sample data
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(sampleContentItems);
    }

    // In production, read from data files
    const dataPath = path.join(process.cwd(), 'public', 'data', 'content.json');
    
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      const contentItems = JSON.parse(data);
      return NextResponse.json(contentItems);
    }

    // Return empty array if no data file exists
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error loading content items:', error);
    return NextResponse.json(
      { error: 'Failed to load content items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentItems: ContentItem[] = await request.json();
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to data file
    const dataPath = path.join(dataDir, 'content.json');
    fs.writeFileSync(dataPath, JSON.stringify(contentItems, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving content items:', error);
    return NextResponse.json(
      { error: 'Failed to save content items' },
      { status: 500 }
    );
  }
}