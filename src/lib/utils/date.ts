// Date utilities using date-fns
import { format, formatDistanceToNow, parseISO, isValid, addDays, startOfDay, endOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'yyyy/MM/dd'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '無効な日付';
    }
    return format(dateObj, formatStr, { locale: ja });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '無効な日付';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy/MM/dd HH:mm');
};

export const formatTimeAgo = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return '無効な日付';
    }
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ja });
  } catch (error) {
    console.error('Time ago formatting error:', error);
    return '無効な日付';
  }
};

export const formatJapaneseDate = (date: string | Date): string => {
  return formatDate(date, 'yyyy年M月d日');
};

export const formatJapaneseDateTime = (date: string | Date): string => {
  return formatDate(date, 'yyyy年M月d日 HH時mm分');
};

export const formatBlogDate = (date: string | Date): string => {
  return formatDate(date, 'M月d日');
};

export const formatFullBlogDate = (date: string | Date): string => {
  return formatDate(date, 'yyyy年M月d日（E）');
};

export const isDateInRange = (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return dateObj >= startObj && dateObj <= endObj;
  } catch {
    return false;
  }
};

export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

export const addDaysToDate = (date: string | Date, days: number): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
};

export const getStartOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
};

export const getEndOfDay = (date: string | Date): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
};

export const getDaysDifference = (startDate: string | Date, endDate: string | Date): number => {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch {
    return 0;
  }
};

export const isDateAfter = (date1: string | Date, date2: string | Date): boolean => {
  try {
    const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    
    return dateObj1 > dateObj2;
  } catch {
    return false;
  }
};

export const isDateBefore = (date1: string | Date, date2: string | Date): boolean => {
  try {
    const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    
    return dateObj1 < dateObj2;
  } catch {
    return false;
  }
};

export const sortByDate = <T extends { createdAt?: string; updatedAt?: string; publishedAt?: string }>(
  items: T[],
  field: 'createdAt' | 'updatedAt' | 'publishedAt' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = a[field];
    const dateB = b[field];
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return order === 'desc' ? 1 : -1;
    if (!dateB) return order === 'desc' ? -1 : 1;
    
    const parsedA = parseISO(dateA);
    const parsedB = parseISO(dateB);
    
    if (order === 'desc') {
      return parsedB.getTime() - parsedA.getTime();
    } else {
      return parsedA.getTime() - parsedB.getTime();
    }
  });
};