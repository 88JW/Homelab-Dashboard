import { NextResponse } from 'next/server';

let failedLoginAttempts = 0;

export async function GET(request: Request) {
  const GLANCES_API = 'http://glances:61208/api/4/all';
  const url = new URL(request.url);

  if (url.searchParams.get('recordFailedLogin') === 'true') {
    failedLoginAttempts++;
    return NextResponse.json({ ok: true });
  }

  try {
    const response = await fetch(GLANCES_API, { next: { revalidate: 0 }, cache: 'no-store' });
    const data = await response.json();

    let dockerData = data.docker || data.containers || [];
    if (dockerData && !Array.isArray(dockerData) && dockerData.containers) {
      dockerData = dockerData.containers;
    }
    const containers = Array.isArray(dockerData) ? dockerData.map((c: any) => ({
      name: c.name || 'Usługa',
      status: c.Status || c.status || c.state || 'N/A',
      cpu: Math.round(c.cpu_usage || 0),
      memory: Math.round((c.memory_usage || 0) / 1024 / 1024)
    })) : [];

    return NextResponse.json({
      cpu: Math.round(data.cpu?.total || 0),
      mem: Math.round(data.mem?.percent || 0),
      disk: Math.round(data.fs?.[0]?.percent || 0),
      uptime: data.uptime || "N/A",
      hostname: data.system?.hostname || 'Debian-HomeLab',
      containers: containers,
      security: {
        failedLogins: failedLoginAttempts,
        threatLevel: failedLoginAttempts > 10 ? 'HIGH' : failedLoginAttempts > 0 ? 'MEDIUM' : 'LOW'
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Błąd danych' }, { status: 500 });
  }
}
