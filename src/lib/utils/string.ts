// String processing utilities
export const truncateText = (text: string, maxLength: number, suffix: string = '...'): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - suffix.length) + suffix;
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const removeHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

export const extractTextFromMarkdown = (markdown: string): string => {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\n{2,}/g, '\n') // Replace multiple newlines
    .trim();
};

export const generateExcerpt = (content: string, maxWords: number = 50): string => {
  const cleanText = extractTextFromMarkdown(content);
  const words = cleanText.split(/\s+/);
  
  if (words.length <= maxWords) {
    return cleanText;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
};

export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const countCharacters = (text: string, includeSpaces: boolean = true): number => {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateRandomString = (length: number = 8, includeNumbers: boolean = true, includeSymbols: boolean = false): string => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  
  if (includeNumbers) {
    chars += '0123456789';
  }
  
  if (includeSymbols) {
    chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

export const generateId = (prefix: string = '', length: number = 8): string => {
  const randomStr = generateRandomString(length, true, false);
  return prefix ? `${prefix}_${randomStr}` : randomStr;
};

export const parseHashtags = (text: string): string[] => {
  const hashtags = text.match(/#[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g);
  return hashtags ? hashtags.map(tag => tag.slice(1)) : [];
};

export const parseMentions = (text: string): string[] => {
  const mentions = text.match(/@[a-zA-Z0-9_]+/g);
  return mentions ? mentions.map(mention => mention.slice(1)) : [];
};

export const highlightSearchTerms = (text: string, searchTerms: string[]): string => {
  let highlightedText = text;
  
  searchTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
};

export const fuzzySearch = (needle: string, haystack: string): boolean => {
  const needleLower = needle.toLowerCase();
  const haystackLower = haystack.toLowerCase();
  
  let needleIndex = 0;
  
  for (let i = 0; i < haystackLower.length && needleIndex < needleLower.length; i++) {
    if (haystackLower[i] === needleLower[needleIndex]) {
      needleIndex++;
    }
  }
  
  return needleIndex === needleLower.length;
};

export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

export const similarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

export const formatPrice = (price: number, currency: string = '¥'): string => {
  return `${currency}${price.toLocaleString('ja-JP')}`;
};

export const parsePrice = (priceStr: string): number => {
  return parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 0;
};