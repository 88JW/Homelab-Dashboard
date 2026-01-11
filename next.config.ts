import { NextResponse } from 'next/server';

export async function GET() {
  const GLANCES_API = 'http://glances:61208/api/4/all';

  try {
    const response = await fetch(GLANCES_API, { 
      next: { revalidate: 0 },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`Glances API error: ${response.status}`);

    const allStats = await response.json();

    // Podstawowe metryki
    const cpuTotal = allStats.cpu?.total || 0;
    const memPercent = allStats.mem?.percent || 0;
    
    // Szukanie dysku
    const diskStats = allStats.fs || [];
    const mainDisk = Array.isArray(diskStats) 
      ? (diskStats.find((d: any) => d.mountpoint === '/') || diskStats[0])
      : { percent: 0 };

    // DOCKER DISCOVERY - Szukamy kontenerów w różnych miejscach
    let rawDocker = allStats.docker || allStats.containers || allStats.docker_containers || [];
    
    // Jeśli docker to obiekt z listą w środku (częste w v4)
    if (rawDocker && !Array.isArray(rawDocker) && rawDocker.containers) {
      rawDocker = rawDocker.containers;
    }

    const containers = Array.isArray(rawDocker) ? rawDocker.map((c: any) => ({
      name: c.name || 'Usługa',
      status: c.Status || c.status || c.state || 'N/A',
      cpu: Math.round(c.cpu_usage || 0),
      memory: Math.round((c.memory_usage || 0) / 1024 / 1024)
    })) : [];

    // Logowanie dla Ciebie w terminalu VS Code (docker logs -f homelab-dashboard)
    if (containers.length === 0) {
      console.log("UWAGA: Nie znaleziono kontenerów w API. Klucze w JSON:", Object.keys(allStats));
    }

    return NextResponse.json({
      cpu: Math.round(cpuTotal),
      mem: Math.round(memPercent),
      disk: Math.round(mainDisk?.percent || 0),
      uptime: allStats.uptime || "0:00:00",
      containers: containers,
      hostname: allStats.system?.hostname || 'Debian-HomeLab'
    });
  } catch (error) {
    console.error('BFF Discovery Error:', error);
    return NextResponse.json({ error: 'Data error' }, { status: 500 });
  }
}