import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    const uniqueFilename = `${baseName}-${timestamp}${fileExtension}`;

    // Determine file category and directory
    let category = 'misc';
    let uploadDir = 'uploads';

    if (file.type.startsWith('image/')) {
      category = 'images';
      uploadDir = 'images/uploads';
    } else if (file.type.startsWith('video/')) {
      category = 'videos';
      uploadDir = 'videos';
    } else if (file.type === 'application/pdf') {
      category = 'documents';
      uploadDir = 'downloads';
    } else if (file.type.includes('zip')) {
      category = 'archives';
      uploadDir = 'downloads';
    }

    // Create upload directory path
    const uploadPath = path.join(process.cwd(), 'public', uploadDir);
    
    // Ensure directory exists
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const filePath = path.join(uploadPath, uniqueFilename);
    await writeFile(filePath, buffer);

    // Return file information
    const fileInfo = {
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      category,
      url: `/${uploadDir}/${uniqueFilename}`,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      file: fileInfo,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    // This endpoint could be used to list uploaded files
    // For now, return a simple success response
    return NextResponse.json({
      message: 'Upload API is ready',
      supportedFormats: [
        'Images: JPEG, PNG, GIF, WebP, SVG',
        'Videos: MP4, WebM, OGG',
        'Documents: PDF',
        'Archives: ZIP'
      ],
      maxFileSize: '10MB',
      category: category || 'all'
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'Upload API error' },
      { status: 500 }
    );
  }
}