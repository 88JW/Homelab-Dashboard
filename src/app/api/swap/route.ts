import { NextResponse } from 'next/server';

let lastSin = 0;
let lastSout = 0;
let lastUpdate = Date.now();

export async function GET() {
  try {
    const response = await fetch('http://glances:61208/api/4/memswap', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Glances API error: ${response.status}`);
    }

    const data = await response.json();
    const now = Date.now();
    const timeDiff = (now - lastUpdate) / 1000; // seconds

    // Calculate rates (bytes per second)
    let sinRate = 0;
    let soutRate = 0;

    if (lastSin > 0 && timeDiff > 0) {
      sinRate = Math.max(0, (data.sin - lastSin) / timeDiff);
      soutRate = Math.max(0, (data.sout - lastSout) / timeDiff);
    }

    lastSin = data.sin;
    lastSout = data.sout;
    lastUpdate = now;

    return NextResponse.json({
      total: data.total || 0,
      used: data.used || 0,
      free: data.free || 0,
      percent: data.percent || 0,
      sin_rate: sinRate,
      sout_rate: soutRate,
      sin_total: data.sin || 0,
      sout_total: data.sout || 0,
    });
  } catch (error) {
    console.error('Error fetching swap data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swap data' },
      { status: 500 }
    );
  }
}
