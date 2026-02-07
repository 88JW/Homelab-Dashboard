import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://mail-redis:6379';
let redisClient: ReturnType<typeof createClient> | null = null;

const getRedis = async () => {
  if (!redisClient) {
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', () => {});
    await redisClient.connect();
  }
  return redisClient;
};

export async function GET() {
  try {
    const client = await getRedis();
    const pipeline = client.multi();
    pipeline.get('mail:unread:total');
    pipeline.hGetAll('mail:unread:per');
    const results = await pipeline.exec();

    const totalValue = Array.isArray(results) ? results[0] : null;
    const perValue = Array.isArray(results) ? results[1] : null;
    const total = Number(totalValue ?? 0);
    const per = perValue && typeof perValue === 'object' ? perValue : {};

    return NextResponse.json({ ok: true, total, per });
  } catch (error) {
    return NextResponse.json({ ok: false, total: 0, per: {} });
  }
}
