import { NextResponse } from 'next/server';
import { serviceRegistry } from '@/lib/service-registry';

const TIMEOUT_MS = 2500;

async function checkService(service: { name: string; url: string }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(service.url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      cache: 'no-store',
    });

    const online = response.status > 0 && response.status < 500;
    return { name: service.name, online, status: response.status };
  } catch (error) {
    return {
      name: service.name,
      online: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const services = await Promise.all(serviceRegistry.map(checkService));
  return NextResponse.json({ updatedAt: Date.now(), services });
}
