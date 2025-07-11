import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  getStartOfDay,
  getEndOfDay,
  getDaysDifference,
  isDateAfter,
  isDateBefore,
  sortByDate,
} from './date';

// Mock console.error to prevent test output pollution
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Date Utils', () => {
  const testDate = '2024-01-15T10:30:45.123Z';
  const testDateObj = new Date(testDate);
  const testDate2 = '2024-01-20T15:45:30.456Z';
  const testDate2Obj = new Date(testDate2);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleError.mockClear();
  });

  describe('formatDate', () => {
    it('should format date string with default format', () => {
      const result = formatDate(testDate);
      expect(result).toBe('2024/01/15');
    });

    it('should format Date object with default format', () => {
      const result = formatDate(testDateObj);
      expect(result).toBe('2024/01/15');
    });

    it('should format date with custom format', () => {
      const result = formatDate(testDate, 'yyyy-MM-dd');
      expect(result).toBe('2024-01-15');
    });

    it('should handle invalid date string', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('無効な日付');
    });

    it('should handle invalid Date object', () => {
      const invalidDate = new Date('invalid');
      const result = formatDate(invalidDate);
      expect(result).toBe('無効な日付');
    });

    it('should handle formatting errors', () => {
      // Create a scenario that might cause formatting error
      const result = formatDate(testDate, 'invalid-format-string');
      // Even with invalid format, date-fns usually handles it gracefully
      expect(typeof result).toBe('string');
    });
  });

  describe('formatDateTime', () => {
    it('should format date string with datetime format', () => {
      const result = formatDateTime(testDate);
      expect(result).toBe('2024/01/15 19:30');
    });

    it('should format Date object with datetime format', () => {
      const result = formatDateTime(testDateObj);
      expect(result).toBe('2024/01/15 19:30');
    });

    it('should handle invalid date', () => {
      const result = formatDateTime('invalid-date');
      expect(result).toBe('無効な日付');
    });
  });

  describe('formatTimeAgo', () => {
    it('should format time ago for valid date', () => {
      // Using a date in the past
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 2); // 2 hours ago
      const result = formatTimeAgo(pastDate);
      expect(result).toContain('前');
    });

    it('should format time ago for date string', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 30).toISOString(); // 30 minutes ago
      const result = formatTimeAgo(pastDate);
      expect(result).toContain('前');
    });

    it('should handle invalid date', () => {
      const result = formatTimeAgo('invalid-date');
      expect(result).toBe('無効な日付');
    });

    it('should handle formatting errors', () => {
      const result = formatTimeAgo(new Date('invalid'));
      expect(result).toBe('無効な日付');
    });
  });

  describe('formatJapaneseDate', () => {
    it('should format date in Japanese format', () => {
      const result = formatJapaneseDate(testDate);
      expect(result).toBe('2024年1月15日');
    });

    it('should handle Date object', () => {
      const result = formatJapaneseDate(testDateObj);
      expect(result).toBe('2024年1月15日');
    });

    it('should handle invalid date', () => {
      const result = formatJapaneseDate('invalid-date');
      expect(result).toBe('無効な日付');
    });
  });

  describe('formatJapaneseDateTime', () => {
    it('should format datetime in Japanese format', () => {
      const result = formatJapaneseDateTime(testDate);
      expect(result).toBe('2024年1月15日 19時30分');
    });

    it('should handle Date object', () => {
      const result = formatJapaneseDateTime(testDateObj);
      expect(result).toBe('2024年1月15日 19時30分');
    });

    it('should handle invalid date', () => {
      const result = formatJapaneseDateTime('invalid-date');
      expect(result).toBe('無効な日付');
    });
  });

  describe('formatBlogDate', () => {
    it('should format date for blog format', () => {
      const result = formatBlogDate(testDate);
      expect(result).toBe('1月15日');
    });

    it('should handle Date object', () => {
      const result = formatBlogDate(testDateObj);
      expect(result).toBe('1月15日');
    });

    it('should handle invalid date', () => {
      const result = formatBlogDate('invalid-date');
      expect(result).toBe('無効な日付');
    });
  });

  describe('formatFullBlogDate', () => {
    it('should format date with day of week', () => {
      const result = formatFullBlogDate(testDate);
      expect(result).toMatch(/2024年1月15日（.）/);
    });

    it('should handle Date object', () => {
      const result = formatFullBlogDate(testDateObj);
      expect(result).toMatch(/2024年1月15日（.）/);
    });

    it('should handle invalid date', () => {
      const result = formatFullBlogDate('invalid-date');
      expect(result).toBe('無効な日付');
    });
  });

  describe('isDateInRange', () => {
    it('should return true for date in range', () => {
      const startDate = '2024-01-10';
      const endDate = '2024-01-20';
      const result = isDateInRange(testDate, startDate, endDate);
      expect(result).toBe(true);
    });

    it('should return false for date outside range', () => {
      const startDate = '2024-01-20';
      const endDate = '2024-01-25';
      const result = isDateInRange(testDate, startDate, endDate);
      expect(result).toBe(false);
    });

    it('should return true for date at range boundaries', () => {
      const startDate = testDate;
      const endDate = testDate;
      const result = isDateInRange(testDate, startDate, endDate);
      expect(result).toBe(true);
    });

    it('should handle Date objects', () => {
      const startDate = new Date('2024-01-10');
      const endDate = new Date('2024-01-20');
      const result = isDateInRange(testDateObj, startDate, endDate);
      expect(result).toBe(true);
    });

    it('should return false for invalid dates', () => {
      const result = isDateInRange('invalid', testDate, testDate2);
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', () => {
      const result = isDateInRange(testDate, 'invalid-start', 'invalid-end');
      expect(result).toBe(false);
    });
  });

  describe('getCurrentISOString', () => {
    it('should return current ISO string', () => {
      const before = new Date().toISOString();
      const result = getCurrentISOString();
      const after = new Date().toISOString();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result >= before).toBe(true);
      expect(result <= after).toBe(true);
    });
  });

  describe('addDaysToDate', () => {
    it('should add days to date string', () => {
      const result = addDaysToDate(testDate, 5);
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(20);
    });

    it('should add days to Date object', () => {
      const result = addDaysToDate(testDateObj, 10);
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(25);
    });

    it('should subtract days with negative number', () => {
      const result = addDaysToDate(testDate, -5);
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(10);
    });

    it('should handle zero days', () => {
      const result = addDaysToDate(testDate, 0);
      expect(result).toBeInstanceOf(Date);
      expect(result.getDate()).toBe(15);
    });
  });

  describe('getStartOfDay', () => {
    it('should get start of day for date string', () => {
      const result = getStartOfDay(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should get start of day for Date object', () => {
      const result = getStartOfDay(testDateObj);
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should get end of day for date string', () => {
      const result = getEndOfDay(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });

    it('should get end of day for Date object', () => {
      const result = getEndOfDay(testDateObj);
      expect(result).toBeInstanceOf(Date);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe('getDaysDifference', () => {
    it('should calculate days difference between dates', () => {
      const result = getDaysDifference(testDate, testDate2);
      expect(result).toBe(6);
    });

    it('should handle Date objects', () => {
      const result = getDaysDifference(testDateObj, testDate2Obj);
      expect(result).toBe(6);
    });

    it('should return absolute difference', () => {
      const result = getDaysDifference(testDate2, testDate);
      expect(result).toBe(6);
    });

    it('should return 0 for same dates', () => {
      const result = getDaysDifference(testDate, testDate);
      expect(result).toBe(0);
    });

    it('should return 0 for invalid dates', () => {
      const result = getDaysDifference('invalid', testDate);
      expect(result).toBe(0);
    });

    it('should handle errors gracefully', () => {
      const result = getDaysDifference('invalid1', 'invalid2');
      expect(result).toBe(0);
    });
  });

  describe('isDateAfter', () => {
    it('should return true when first date is after second', () => {
      const result = isDateAfter(testDate2, testDate);
      expect(result).toBe(true);
    });

    it('should return false when first date is before second', () => {
      const result = isDateAfter(testDate, testDate2);
      expect(result).toBe(false);
    });

    it('should return false for same dates', () => {
      const result = isDateAfter(testDate, testDate);
      expect(result).toBe(false);
    });

    it('should handle Date objects', () => {
      const result = isDateAfter(testDate2Obj, testDateObj);
      expect(result).toBe(true);
    });

    it('should return false for invalid dates', () => {
      const result = isDateAfter('invalid', testDate);
      expect(result).toBe(false);
    });
  });

  describe('isDateBefore', () => {
    it('should return true when first date is before second', () => {
      const result = isDateBefore(testDate, testDate2);
      expect(result).toBe(true);
    });

    it('should return false when first date is after second', () => {
      const result = isDateBefore(testDate2, testDate);
      expect(result).toBe(false);
    });

    it('should return false for same dates', () => {
      const result = isDateBefore(testDate, testDate);
      expect(result).toBe(false);
    });

    it('should handle Date objects', () => {
      const result = isDateBefore(testDateObj, testDate2Obj);
      expect(result).toBe(true);
    });

    it('should return false for invalid dates', () => {
      const result = isDateBefore('invalid', testDate);
      expect(result).toBe(false);
    });
  });

  describe('sortByDate', () => {
    const items = [
      { id: 1, createdAt: testDate2, updatedAt: testDate, publishedAt: testDate },
      { id: 2, createdAt: testDate, updatedAt: testDate2, publishedAt: testDate2 },
      {
        id: 3,
        createdAt: '2024-01-25T12:00:00Z',
        updatedAt: '2024-01-25T12:00:00Z',
        publishedAt: '2024-01-25T12:00:00Z',
      },
    ];

    it('should sort by createdAt in descending order by default', () => {
      const result = sortByDate(items);
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(1);
      expect(result[2].id).toBe(2);
    });

    it('should sort by createdAt in ascending order', () => {
      const result = sortByDate(items, 'createdAt', 'asc');
      expect(result[0].id).toBe(2);
      expect(result[1].id).toBe(1);
      expect(result[2].id).toBe(3);
    });

    it('should sort by updatedAt field', () => {
      const result = sortByDate(items, 'updatedAt', 'desc');
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(1);
    });

    it('should sort by publishedAt field', () => {
      const result = sortByDate(items, 'publishedAt', 'asc');
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(3);
    });

    it('should handle items without dates', () => {
      const itemsWithMissing = [
        { id: 1, createdAt: testDate },
        { id: 2, createdAt: undefined }, // No createdAt
        { id: 3, createdAt: testDate2 },
      ];

      const result = sortByDate(itemsWithMissing, 'createdAt', 'desc');
      expect(result[0].id).toBe(3); // Latest date
      expect(result[1].id).toBe(1); // Earlier date
      expect(result[2].id).toBe(2); // No date (should be last)
    });

    it('should handle all items without dates', () => {
      const itemsWithoutDates = [
        { id: 1, createdAt: undefined },
        { id: 2, createdAt: undefined },
        { id: 3, createdAt: undefined },
      ];

      const result = sortByDate(itemsWithoutDates);
      expect(result).toHaveLength(3);
      // Order should remain unchanged when all items have no dates
      expect(result.map(item => item.id)).toEqual([1, 2, 3]);
    });

    it('should not mutate original array', () => {
      const originalOrder = items.map(item => item.id);
      sortByDate(items);
      expect(items.map(item => item.id)).toEqual(originalOrder);
    });

    it('should handle empty array', () => {
      const result = sortByDate([]);
      expect(result).toEqual([]);
    });
  });
});
