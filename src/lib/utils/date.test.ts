// Tests for date utilities
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
  getStartOfDay,
  getEndOfDay,
  getDaysDifference,
  isDateAfter,
  isDateBefore,
  sortByDate,
} from './date';

describe('formatDate', () => {
  it('should format dates correctly', () => {
    const testDate = '2024-12-01T10:30:00.000Z';

    expect(formatDate(testDate)).toBe('2024/12/01');
    expect(formatDate(testDate, 'yyyy-MM-dd')).toBe('2024-12-01');
    expect(formatDate(new Date(testDate))).toBe('2024/12/01');
  });

  it('should handle invalid dates', () => {
    expect(formatDate('invalid-date')).toBe('無効な日付');
    expect(formatDate('')).toBe('無効な日付');
  });
});

describe('formatDateTime', () => {
  it('should format date and time correctly', () => {
    const testDate = '2024-12-01T10:30:00.000Z';
    const result = formatDateTime(testDate);

    expect(result).toMatch(/2024\/12\/01 \d{2}:\d{2}/);
  });
});

describe('formatTimeAgo', () => {
  it('should format relative time correctly', () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const result = formatTimeAgo(oneHourAgo);
    expect(result).toContain('前');
  });

  it('should handle invalid dates', () => {
    expect(formatTimeAgo('invalid-date')).toBe('無効な日付');
  });
});

describe('formatJapaneseDate', () => {
  it('should format dates in Japanese style', () => {
    const testDate = '2024-12-01T10:30:00.000Z';
    const result = formatJapaneseDate(testDate);

    expect(result).toBe('2024年12月1日');
  });
});

describe('formatJapaneseDateTime', () => {
  it('should format date and time in Japanese style', () => {
    const testDate = '2024-12-01T10:30:00.000Z';
    const result = formatJapaneseDateTime(testDate);

    expect(result).toMatch(/2024年12月1日 \d{2}時\d{2}分/);
  });
});

describe('formatBlogDate', () => {
  it('should format blog dates correctly', () => {
    const testDate = '2024-12-01T10:30:00.000Z';
    const result = formatBlogDate(testDate);

    expect(result).toBe('12月1日');
  });
});

describe('formatFullBlogDate', () => {
  it('should format full blog dates correctly', () => {
    const testDate = '2024-12-01T10:30:00.000Z';
    const result = formatFullBlogDate(testDate);

    expect(result).toMatch(/2024年12月1日（.+）/);
  });
});

describe('isDateInRange', () => {
  it('should check if date is in range', () => {
    const startDate = '2024-12-01T00:00:00.000Z';
    const endDate = '2024-12-31T23:59:59.999Z';
    const testDate = '2024-12-15T12:00:00.000Z';

    expect(isDateInRange(testDate, startDate, endDate)).toBe(true);
  });

  it('should return false for dates outside range', () => {
    const startDate = '2024-12-01T00:00:00.000Z';
    const endDate = '2024-12-31T23:59:59.999Z';
    const testDate = '2025-01-01T00:00:00.000Z';

    expect(isDateInRange(testDate, startDate, endDate)).toBe(false);
  });

  it('should handle invalid dates', () => {
    expect(isDateInRange('invalid', '2024-01-01', '2024-12-31')).toBe(false);
  });
});

describe('getCurrentISOString', () => {
  it('should return current date in ISO format', () => {
    const result = getCurrentISOString();

    expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  });
});

describe('addDaysToDate', () => {
  it('should add days to date correctly', () => {
    const testDate = '2024-12-01T00:00:00.000Z';
    const result = addDaysToDate(testDate, 5);

    expect(result.getDate()).toBe(6);
  });

  it('should handle negative days', () => {
    const testDate = '2024-12-10T00:00:00.000Z';
    const result = addDaysToDate(testDate, -5);

    expect(result.getDate()).toBe(5);
  });
});

describe('getStartOfDay', () => {
  it('should return start of day', () => {
    const testDate = '2024-12-01T15:30:45.123Z';
    const result = getStartOfDay(testDate);

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('getEndOfDay', () => {
  it('should return end of day', () => {
    const testDate = '2024-12-01T10:30:00.000Z';
    const result = getEndOfDay(testDate);

    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });
});

describe('getDaysDifference', () => {
  it('should calculate days difference correctly', () => {
    const startDate = '2024-12-01T00:00:00.000Z';
    const endDate = '2024-12-05T00:00:00.000Z';

    expect(getDaysDifference(startDate, endDate)).toBe(4);
  });

  it('should handle reverse order', () => {
    const startDate = '2024-12-05T00:00:00.000Z';
    const endDate = '2024-12-01T00:00:00.000Z';

    expect(getDaysDifference(startDate, endDate)).toBe(4);
  });

  it('should handle invalid dates', () => {
    expect(getDaysDifference('invalid', '2024-12-01')).toBe(0);
  });
});

describe('isDateAfter', () => {
  it('should check if date is after another', () => {
    const laterDate = '2024-12-02T00:00:00.000Z';
    const earlierDate = '2024-12-01T00:00:00.000Z';

    expect(isDateAfter(laterDate, earlierDate)).toBe(true);
    expect(isDateAfter(earlierDate, laterDate)).toBe(false);
  });

  it('should handle invalid dates', () => {
    expect(isDateAfter('invalid', '2024-12-01')).toBe(false);
  });
});

describe('isDateBefore', () => {
  it('should check if date is before another', () => {
    const laterDate = '2024-12-02T00:00:00.000Z';
    const earlierDate = '2024-12-01T00:00:00.000Z';

    expect(isDateBefore(earlierDate, laterDate)).toBe(true);
    expect(isDateBefore(laterDate, earlierDate)).toBe(false);
  });

  it('should handle invalid dates', () => {
    expect(isDateBefore('invalid', '2024-12-01')).toBe(false);
  });
});

describe('sortByDate', () => {
  const testItems = [
    { id: '1', createdAt: '2024-12-01T00:00:00.000Z' },
    { id: '2', createdAt: '2024-12-03T00:00:00.000Z' },
    { id: '3', createdAt: '2024-12-02T00:00:00.000Z' },
  ];

  it('should sort by date descending (default)', () => {
    const result = sortByDate(testItems);

    expect(result[0].id).toBe('2'); // Latest first
    expect(result[1].id).toBe('3');
    expect(result[2].id).toBe('1');
  });

  it('should sort by date ascending', () => {
    const result = sortByDate(testItems, 'createdAt', 'asc');

    expect(result[0].id).toBe('1'); // Earliest first
    expect(result[1].id).toBe('3');
    expect(result[2].id).toBe('2');
  });

  it('should handle items without dates', () => {
    const itemsWithMissingDates = [
      { id: '1', createdAt: '2024-12-01T00:00:00.000Z' },
      { id: '2' }, // No createdAt
      { id: '3', createdAt: '2024-12-02T00:00:00.000Z' },
    ];

    const result = sortByDate(itemsWithMissingDates);

    expect(result).toHaveLength(3);
    // Items without dates should be sorted to the end in desc order
    expect(result[result.length - 1].id).toBe('2');
  });

  it('should sort by different date fields', () => {
    const itemsWithUpdatedAt = [
      { id: '1', createdAt: '2024-12-01T00:00:00.000Z', updatedAt: '2024-12-03T00:00:00.000Z' },
      { id: '2', createdAt: '2024-12-02T00:00:00.000Z', updatedAt: '2024-12-01T00:00:00.000Z' },
    ];

    const result = sortByDate(itemsWithUpdatedAt, 'updatedAt');

    expect(result[0].id).toBe('1'); // Latest updatedAt first
  });
});
