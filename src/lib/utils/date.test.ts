import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatJapaneseDate,
  formatJapaneseDateTime,
  formatBlogDate,
  formatFullBlogDate,
  isDateInRange,
  getCurrentISOString,
  addDaysToDate,
  getDaysDifference,
  isDateAfter,
  isDateBefore,
  sortByDate,
  getStartOfDay,
  getEndOfDay,
} from './date';

describe('Date Utils', () => {
  const testDateStr = '2024-01-15T10:30:00Z';
  const testDateObj = new Date(testDateStr);

  describe('formatDate', () => {
    it('should format a date string', () => {
      expect(formatDate(testDateStr)).toBe('2024/01/15');
    });

    it('should format a Date object', () => {
      expect(formatDate(testDateObj)).toBe('2024/01/15');
    });

    it('should return "無効な日付" for an invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('無効な日付');
    });
  });

  it('should format date and time', () => {
    expect(formatDateTime(testDateStr)).toBe('2024/01/15 19:30');
  });

  describe('formatTimeAgo', () => {
    it('should format a date string as time ago', () => {
      expect(formatTimeAgo(testDateStr)).toContain('前');
    });

    it('should format a Date object as time ago', () => {
      expect(formatTimeAgo(testDateObj)).toContain('前');
    });

    it('should format without suffix', () => {
      expect(formatTimeAgo(testDateStr, { addSuffix: false })).not.toContain('前');
    });

    it('should return "無効な日付" for invalid date', () => {
      expect(formatTimeAgo('invalid')).toBe('無効な日付');
    });
  });

  it('should format date in Japanese', () => {
    expect(formatJapaneseDate(testDateStr)).toBe('2024年1月15日');
  });

  it('should format date and time in Japanese', () => {
    expect(formatJapaneseDateTime(testDateStr)).toBe('2024年1月15日 19時30分');
  });

  it('should format blog date', () => {
    expect(formatBlogDate(testDateStr)).toBe('1月15日');
  });

  it('should format full blog date', () => {
    expect(formatFullBlogDate(testDateStr)).toMatch(/\d{4}年\d{1,2}月\d{1,2}日（.+）/);
  });

  describe('isDateInRange', () => {
    it('should return true if date is in range', () => {
      expect(isDateInRange('2024-01-15', '2024-01-01', '2024-01-31')).toBe(true);
    });

    it('should return false if date is out of range', () => {
      expect(isDateInRange('2024-02-01', '2024-01-01', '2024-01-31')).toBe(false);
    });

    it('should return false for invalid date', () => {
      expect(isDateInRange('invalid', '2024-01-01', '2024-01-31')).toBe(false);
    });

    it('should return false for invalid start date', () => {
      expect(isDateInRange('2024-01-15', 'invalid', '2024-01-31')).toBe(false);
    });

    it('should return false for nullish inputs', () => {
      expect(isDateInRange(null as unknown as string, '2024-01-01', '2024-01-31')).toBe(false);
      expect(isDateInRange('2024-01-15', null as unknown as string, '2024-01-31')).toBe(false);
      expect(isDateInRange('2024-01-15', '2024-01-01', null as unknown as string)).toBe(false);
    });
  });

  it('should get current ISO string', () => {
    const isoString = getCurrentISOString();
    expect(isoString).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
  });

  it('should add days to a date', () => {
    const newDate = addDaysToDate(testDateStr, 5);
    expect(newDate.getUTCDate()).toBe(20);
  });

  describe('getDaysDifference', () => {
    it('should get the difference in days', () => {
      expect(getDaysDifference('2024-01-15', '2024-01-20')).toBe(5);
    });
    it('should return 0 for invalid dates', () => {
      expect(getDaysDifference('invalid', '2024-01-20')).toBe(0);
    });
  });

  describe('isDateAfter', () => {
    it('should check if a date is after another', () => {
      expect(isDateAfter('2024-01-20', '2024-01-15')).toBe(true);
      expect(isDateAfter('2024-01-15', '2024-01-20')).toBe(false);
    });
    it('should return false for invalid dates', () => {
      expect(isDateAfter('invalid', '2024-01-15')).toBe(false);
    });
  });

  describe('isDateBefore', () => {
    it('should check if a date is before another', () => {
      expect(isDateBefore('2024-01-15', '2024-01-20')).toBe(true);
      expect(isDateBefore('2024-01-20', '2024-01-15')).toBe(false);
    });
    it('should return false for invalid dates', () => {
      expect(isDateBefore('invalid', '2024-01-15')).toBe(false);
    });
  });

  describe('sortByDate', () => {
    const items = [
      { createdAt: '2024-01-20', updatedAt: '2024-01-21' },
      { createdAt: '2024-01-15', updatedAt: '2024-01-18' },
    ];
    const itemsWithMissing: { createdAt?: string }[] = [
      { createdAt: '2024-01-20' },
      {},
      { createdAt: '2024-01-15' },
    ];

    it('should sort items by date in desc order by default', () => {
      const sorted = sortByDate(items, 'createdAt');
      expect(sorted[0].createdAt).toBe('2024-01-20');
    });

    it('should sort items by date in asc order', () => {
      const sorted = sortByDate(items, 'createdAt', 'asc');
      expect(sorted[0].createdAt).toBe('2024-01-15');
    });

    it('should sort by a different field', () => {
      const sorted = sortByDate(items, 'updatedAt', 'asc');
      expect(sorted[0].updatedAt).toBe('2024-01-18');
    });

    it('should handle sorting with missing dates (asc)', () => {
      const sortedAsc = sortByDate(itemsWithMissing, 'createdAt', 'asc');
      expect(sortedAsc[0]).toEqual({}); // nulls first
      expect(sortedAsc[1].createdAt).toBe('2024-01-15');
    });

    it('should handle sorting with missing dates (desc)', () => {
      const sortedDesc = sortByDate(itemsWithMissing, 'createdAt', 'desc');
      expect(sortedDesc[0].createdAt).toBe('2024-01-20');
      expect(sortedDesc[2]).toEqual({}); // nulls last
    });

    it('should handle sorting with only one valid date', () => {
      const oneDate = [{}, { createdAt: '2024-01-15' }];
      const sortedAsc = sortByDate(oneDate, 'createdAt', 'asc');
      expect(sortedAsc[0]).toEqual({});
      const sortedDesc = sortByDate(oneDate, 'createdAt', 'desc');
      expect(sortedDesc[1]).toEqual({});
    });

    it('should handle sorting with no valid dates', () => {
      const noDates = [{}, {}];
      const sorted = sortByDate(noDates, 'createdAt');
      expect(sorted).toEqual([{}, {}]);
    });
  });

  it('should get the start of the day', () => {
    const startOfDay = getStartOfDay(testDateStr);
    expect(startOfDay.getHours()).toBe(0);
    expect(startOfDay.getMinutes()).toBe(0);
  });

  it('should get the end of the day', () => {
    const endOfDay = getEndOfDay(testDateStr);
    expect(endOfDay.getHours()).toBe(23);
    expect(endOfDay.getMinutes()).toBe(59);
  });
});
