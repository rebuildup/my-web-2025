import { NextRequest, NextResponse } from 'next/server';
import { ContentItem } from '@/types/content';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const contentItem: ContentItem = await request.json();
    
    // Validate required fields
    if (!contentItem.id || !contentItem.type || !contentItem.title) {
      return NextResponse.json(
        { error: 'Missing required fields: id, type, title' },
        { status: 400 }
      );
    }

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load existing content
    const dataPath = path.join(dataDir, 'content.json');
    let existingItems: ContentItem[] = [];
    
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      existingItems = JSON.parse(data);
    }

    // Update or add the item
    const itemIndex = existingItems.findIndex(item => item.id === contentItem.id);
    if (itemIndex >= 0) {
      existingItems[itemIndex] = contentItem;
    } else {
      existingItems.push(contentItem);
    }

    // Save updated content
    fs.writeFileSync(dataPath, JSON.stringify(existingItems, null, 2));

    // Create individual content file for the item
    const itemDir = path.join(dataDir, 'items');
    if (!fs.existsSync(itemDir)) {
      fs.mkdirSync(itemDir, { recursive: true });
    }

    const itemPath = path.join(itemDir, `${contentItem.id}.json`);
    fs.writeFileSync(itemPath, JSON.stringify(contentItem, null, 2));

    // If content item has markdown content, save it as a separate file
    if (contentItem.content && contentItem.content.trim().length > 0) {
      const markdownDir = path.join(dataDir, 'markdown');
      if (!fs.existsSync(markdownDir)) {
        fs.mkdirSync(markdownDir, { recursive: true });
      }

      const markdownPath = path.join(markdownDir, `${contentItem.id}.md`);
      fs.writeFileSync(markdownPath, contentItem.content);
      
      // Update the contentPath in the item
      contentItem.contentPath = `/data/markdown/${contentItem.id}.md`;
      
      // Save the updated item again with the contentPath
      fs.writeFileSync(itemPath, JSON.stringify(contentItem, null, 2));
      
      // Update in the main content array
      const updatedItemIndex = existingItems.findIndex(item => item.id === contentItem.id);
      if (updatedItemIndex >= 0) {
        existingItems[updatedItemIndex] = contentItem;
        fs.writeFileSync(dataPath, JSON.stringify(existingItems, null, 2));
      }
    }

    return NextResponse.json({ 
      success: true, 
      item: contentItem,
      message: 'Content item saved successfully' 
    });
  } catch (error) {
    console.error('Error saving content item:', error);
    return NextResponse.json(
      { error: 'Failed to save content item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing item ID' },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), 'public', 'data');
    const dataPath = path.join(dataDir, 'content.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: 'No content data found' },
        { status: 404 }
      );
    }

    // Load existing content
    const data = fs.readFileSync(dataPath, 'utf-8');
    const existingItems: ContentItem[] = JSON.parse(data);

    // Find and remove the item
    const itemIndex = existingItems.findIndex(item => item.id === itemId);
    if (itemIndex < 0) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const removedItem = existingItems.splice(itemIndex, 1)[0];

    // Save updated content
    fs.writeFileSync(dataPath, JSON.stringify(existingItems, null, 2));

    // Remove individual files
    const itemPath = path.join(dataDir, 'items', `${itemId}.json`);
    if (fs.existsSync(itemPath)) {
      fs.unlinkSync(itemPath);
    }

    const markdownPath = path.join(dataDir, 'markdown', `${itemId}.md`);
    if (fs.existsSync(markdownPath)) {
      fs.unlinkSync(markdownPath);
    }

    return NextResponse.json({ 
      success: true, 
      removedItem,
      message: 'Content item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting content item:', error);
    return NextResponse.json(
      { error: 'Failed to delete content item' },
      { status: 500 }
    );
  }
}