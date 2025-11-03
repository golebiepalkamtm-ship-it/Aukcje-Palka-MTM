import { redis } from './redis';

export async function withRedisCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl = 60
): Promise<T> {
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as T;
  const data = await fetchFn();
  await redis.set(cacheKey, JSON.stringify(data), { EX: ttl });
  return data;
}
