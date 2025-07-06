import { ContentItem } from '@/types/content';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface SecurityContext {
  ipAddress: string;
  userAgent: string;
  referer?: string;
  origin?: string;
}

/**
 * Rate limiting middleware
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; resetTime: number; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [key, data] of rateLimitMap.entries()) {
    if (data.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
  
  const current = rateLimitMap.get(identifier);
  
  if (!current || current.resetTime < now) {
    // New window or expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return {
      allowed: true,
      resetTime: now + windowMs,
      remaining: maxRequests - 1
    };
  }
  
  if (current.count >= maxRequests) {
    return {
      allowed: false,
      resetTime: current.resetTime,
      remaining: 0
    };
  }
  
  current.count++;
  return {
    allowed: true,
    resetTime: current.resetTime,
    remaining: maxRequests - current.count
  };
}

/**
 * Content validation
 */
export function validateContentItem(item: Partial<ContentItem>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Required fields
  if (!item.type) {
    errors.push({
      field: 'type',
      message: 'Content type is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!item.title || item.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  if (!item.description || item.description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Description is required',
      code: 'REQUIRED_FIELD'
    });
  }
  
  // Length validations
  if (item.title && item.title.length > 200) {
    errors.push({
      field: 'title',
      message: 'Title must be 200 characters or less',
      code: 'MAX_LENGTH_EXCEEDED'
    });
  }
  
  if (item.description && item.description.length > 1000) {
    errors.push({
      field: 'description',
      message: 'Description must be 1000 characters or less',
      code: 'MAX_LENGTH_EXCEEDED'
    });
  }
  
  if (item.content && item.content.length > 50000) {
    errors.push({
      field: 'content',
      message: 'Content must be 50,000 characters or less',
      code: 'MAX_LENGTH_EXCEEDED'
    });
  }
  
  // Type validations
  const validTypes = ['portfolio', 'plugin', 'blog', 'profile', 'page', 'tool', 'asset', 'download'];
  if (item.type && !validTypes.includes(item.type)) {
    errors.push({
      field: 'type',
      message: `Invalid content type. Must be one of: ${validTypes.join(', ')}`,
      code: 'INVALID_VALUE'
    });
  }
  
  const validStatuses = ['published', 'draft', 'archived', 'scheduled'];
  if (item.status && !validStatuses.includes(item.status)) {
    errors.push({
      field: 'status',
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      code: 'INVALID_VALUE'
    });
  }
  
  // Priority validation
  if (item.priority !== undefined && (item.priority < 0 || item.priority > 100)) {
    errors.push({
      field: 'priority',
      message: 'Priority must be between 0 and 100',
      code: 'INVALID_RANGE'
    });
  }
  
  // Tags validation
  if (item.tags) {
    if (!Array.isArray(item.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        code: 'INVALID_TYPE'
      });
    } else {
      if (item.tags.length > 20) {
        errors.push({
          field: 'tags',
          message: 'Maximum 20 tags allowed',
          code: 'MAX_ITEMS_EXCEEDED'
        });
      }
      
      item.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push({
            field: `tags[${index}]`,
            message: 'Each tag must be a string',
            code: 'INVALID_TYPE'
          });
        } else if (tag.length > 50) {
          errors.push({
            field: `tags[${index}]`,
            message: 'Tag must be 50 characters or less',
            code: 'MAX_LENGTH_EXCEEDED'
          });
        }
      });
    }
  }
  
  // URL validations
  if (item.externalLinks) {
    item.externalLinks.forEach((link, index) => {
      if (!link.url || !isValidUrl(link.url)) {
        errors.push({
          field: `externalLinks[${index}].url`,
          message: 'Invalid URL format',
          code: 'INVALID_URL'
        });
      }
      
      if (!link.title || link.title.trim().length === 0) {
        errors.push({
          field: `externalLinks[${index}].title`,
          message: 'Link title is required',
          code: 'REQUIRED_FIELD'
        });
      }
    });
  }
  
  return errors;
}

/**
 * File upload validation
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateUploadedFile(
  file: File,
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'application/zip'
    ],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.pdf', '.zip']
  } = options;
  
  // Size validation
  if (file.size > maxSize) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`);
  }
  
  // Type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type "${file.type}" is not allowed`);
  }
  
  // Extension validation
  const extension = getFileExtension(file.name);
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension "${extension}" is not allowed`);
  }
  
  // Filename validation
  if (file.name.length > 255) {
    errors.push('Filename is too long (maximum 255 characters)');
  }
  
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    warnings.push('Filename contains special characters that may cause issues');
  }
  
  // Size warnings
  if (file.size > 5 * 1024 * 1024) { // 5MB
    warnings.push('Large file size may affect upload and page performance');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Input sanitization
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * HTML content validation and sanitization
 */
export function sanitizeHtmlContent(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Security context validation
 */
export function validateSecurityContext(context: SecurityContext): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate IP address
  if (!isValidIpAddress(context.ipAddress)) {
    errors.push({
      field: 'ipAddress',
      message: 'Invalid IP address format',
      code: 'INVALID_IP'
    });
  }
  
  // Validate User Agent
  if (context.userAgent.length > 1000) {
    errors.push({
      field: 'userAgent',
      message: 'User agent string is too long',
      code: 'MAX_LENGTH_EXCEEDED'
    });
  }
  
  // Validate Origin if present
  if (context.origin && !isValidUrl(context.origin)) {
    errors.push({
      field: 'origin',
      message: 'Invalid origin URL',
      code: 'INVALID_URL'
    });
  }
  
  return errors;
}

// Utility functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidIpAddress(ip: string): boolean {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}