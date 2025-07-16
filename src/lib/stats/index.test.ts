import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateStats, getStats, getItemStats, getTopItems } from './index';

describe('Stats Utilities', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.mocked(global.fetch).mockRestore();
  });

  it('should update stats successfully', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);
    const result = await updateStats('view', 'item1');
    expect(result).toBe(true);
  });

  it('should return false when API call is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
    } as Response);
    const result = await updateStats('view', 'item1');
    expect(result).toBe(false);
  });

  it('should return false on fetch error', async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error('Network Error'));
    const result = await updateStats('download', 'item2');
    expect(result).toBe(false);
  });
});
