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

    // Filtruj główne dyski (wykluczając docker overlay i mountpointy systemowe)
    const disks = Array.isArray(data.fs) ? data.fs
      .filter((fs: any) => {
        // Uwzględnij tylko główne dyski fizyczne po device_name
        const device = fs.device_name || ''
        const mount = fs.mnt_point || ''
        return (device === '/dev/nvme0n1p1' && (mount === '/' || mount === '/mnt')) ||
               (mount.startsWith('/mnt/') && device.startsWith('/dev/sd'))
      })
      .map((fs: any) => {
        // Nazewnictwo dysków
        let name = 'DISK'
        const device = fs.device_name || ''
        
        if (device === '/dev/nvme0n1p1') {
          name = 'SYSTEM'
        } else if (fs.mnt_point === '/mnt/dane') {
          name = 'DATA'
        } else if (fs.mnt_point === '/mnt/photos') {
          name = 'PHOTOS'
        } else if (fs.mnt_point === '/mnt/backup') {
          name = 'BACKUP'
        } else {
          name = fs.mnt_point.split('/').pop()?.toUpperCase() || 'DISK'
        }
        
        return {
          name: name,
          mount: fs.mnt_point || '/',
          total: Math.round((fs.size || 0) / 1024 / 1024 / 1024), // GB
          used: Math.round(((fs.size || 0) - (fs.free || 0)) / 1024 / 1024 / 1024), // GB
          percent: Math.round(fs.percent || 0),
          device: fs.device_name || 'N/A'
        }
      }) : [];

    return NextResponse.json({
      cpu: Math.round(data.cpu?.total || 0),
      mem: Math.round(data.mem?.percent || 0),
      disk: Math.round(data.fs?.[0]?.percent || 0),
      uptime: data.uptime || "N/A",
      hostname: data.system?.hostname || 'Debian-HomeLab',
      containers: containers,
      disks: disks,
      security: {
        failedLogins: failedLoginAttempts,
        threatLevel: failedLoginAttempts > 10 ? 'HIGH' : failedLoginAttempts > 0 ? 'MEDIUM' : 'LOW'
      }
    });
  } catch (e) {
    return NextResponse.json({ error: 'Błąd danych' }, { status: 500 });
  }
}
