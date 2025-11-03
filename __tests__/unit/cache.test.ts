import { redis } from '@/lib/redis';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mockowanie redis (tylko te metody, które faktycznie masz/wykorzystujesz)
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    exists: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
    on: vi.fn(),
    connect: vi.fn(),
    isOpen: true,
  },
}));

describe('Redis utils / manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set a value', async () => {
    vi.mocked(redis.set).mockResolvedValue('OK');
    const result = await redis.set('test-key', 'val');
    expect(result).toBe('OK');
    expect(redis.set).toHaveBeenCalledWith('test-key', 'val');
  });

  it('should get a value', async () => {
    vi.mocked(redis.get).mockResolvedValue('test-val');
    const result = await redis.get('test-key');
    expect(result).toBe('test-val');
    expect(redis.get).toHaveBeenCalledWith('test-key');
  });

  it('should delete a key', async () => {
    vi.mocked(redis.del).mockResolvedValue(1);
    const result = await redis.del('test-key');
    expect(result).toBe(1);
    expect(redis.del).toHaveBeenCalledWith('test-key');
  });
});
