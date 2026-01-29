import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
let failedLoginAttempts = 0;

export async function GET(request: Request) {
  const GLANCES_API = 'http://192.168.50.234:61208/api/4/all';
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

    // Filtruj główne dyski z Glances
    // Dell Glances może mieć /hostfs lub tylko bind mounts - obsługujemy oba przypadki
    let disks: any[] = [];
    if (Array.isArray(data.fs)) {
      const seenDevices = new Set<string>();
      
      // Sprawdź czy są mounty /hostfs (nowa konfiguracja)
      const hasHostfs = data.fs.some((fs: any) => 
        fs.mnt_point && fs.mnt_point.startsWith('/hostfs')
      );
      
      disks = data.fs
        .filter((fs: any) => {
          const device = fs.device_name || '';
          const mount = fs.mnt_point || '';
          
          // Pomijamy duplikaty
          if (seenDevices.has(device)) {
            return false;
          }
          
          // Pomijamy Docker bind mounts i overlay
          if (mount.includes('/etc/resolv.conf') || 
              mount.includes('/etc/hostname') || 
              mount.includes('/etc/hosts') ||
              mount.includes('docker') ||
              mount.includes('overlay')) {
            return false;
          }
          
          // Pomijamy EFI
          if (mount.includes('/boot/efi') || mount.includes('/efi')) {
            return false;
          }
          
          // Akceptujemy tylko prawdziwe urządzenia blokowe
          if (device.includes('/dev/nvme') || device.includes('/dev/sd')) {
            // Z /hostfs: akceptujemy /hostfs i /hostfs/mnt/*
            // Bez /hostfs: akceptujemy wszystkie (ale już odfiltrowane /etc)
            if (hasHostfs) {
              if (mount === '/hostfs' || mount.startsWith('/hostfs/mnt/')) {
                seenDevices.add(device);
                return true;
              }
            } else {
              seenDevices.add(device);
              return true;
            }
          }
          
          return false;
        })
        .map((fs: any) => {
          const device = fs.device_name || '';
          let mount = fs.mnt_point || '/';
          
          // Czyść /hostfs prefix
          if (mount.startsWith('/hostfs')) {
            mount = mount.replace('/hostfs', '') || '/';
          }
          
          // Nazwy dysków
          let name = 'DISK';
          if (mount === '/' || device.includes('nvme0n1p1') || device.includes('sda1')) {
            name = 'SYSTEM';
          } else if (device.includes('sdb') || mount.includes('dane')) {
            name = 'DATA 1TB';
          } else if (device.includes('sdc') || mount.includes('photos')) {
            name = 'PHOTOS 2TB';
          } else if (device.includes('sdd') || mount.includes('backup')) {
            name = 'BACKUP 2TB';
          } else if (mount.startsWith('/mnt/')) {
            const dirName = mount.split('/').filter(p => p).pop()?.toUpperCase() || 'DISK';
            name = dirName;
          }
          
          return {
            name,
            mount,
            total: Math.round((fs.size || 0) / 1024 / 1024 / 1024),
            used: Math.round(((fs.size || 0) - (fs.free || 0)) / 1024 / 1024 / 1024),
            percent: Math.round(fs.percent || 0),
            device: fs.device_name || 'N/A'
          };
        })
        .filter(disk => disk !== null);
    }

    // RAM data
    const memTotal = Math.round((data.mem?.total || 0) / 1024 / 1024 / 1024); // GB
    const memUsed = Math.round((data.mem?.used || 0) / 1024 / 1024 / 1024); // GB
    const memPercent = Math.round(data.mem?.percent || 0);

    // SWAP data
    const swapTotal = Math.round((data.memswap?.total || 0) / 1024 / 1024 / 1024); // GB
    const swapUsed = Math.round((data.memswap?.used || 0) / 1024 / 1024 / 1024); // GB
    const swapPercent = Math.round(data.memswap?.percent || 0);

    // Network data
    const networkInterfaces = Array.isArray(data.network) ? data.network
      .filter((net: any) => {
        const iface = net.interface_name || '';
        return iface !== 'lo' && !iface.startsWith('docker') && !iface.startsWith('veth');
      })
      .map((net: any) => ({
        interface: net.interface_name || 'N/A',
        rx_bytes: Math.round((net.rx || 0) / 1024 / 1024), // MB
        tx_bytes: Math.round((net.tx || 0) / 1024 / 1024), // MB
        rx_rate: Math.round((net.rx_rate || net.speed || 0) / 1024), // KB/s
        tx_rate: Math.round((net.tx_rate || net.speed || 0) / 1024), // KB/s
      })) : [];

    // Temperature data
    const temps = Array.isArray(data.sensors) ? data.sensors
      .filter((sensor: any) => sensor.type === 'temperature_core')
      .map((sensor: any) => ({
        label: sensor.label || 'CPU',
        value: Math.round(sensor.value || 0),
      })) : [];

    // Format uptime
    const formatUptime = (uptimeStr: string): string => {
      // If already formatted, return as is
      if (uptimeStr.includes('days') || uptimeStr.includes('h')) {
        return uptimeStr;
      }
      // If it's seconds, format it
      const seconds = parseInt(uptimeStr);
      if (!isNaN(seconds)) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
      }
      return uptimeStr;
    };

    return NextResponse.json({
      online: true,
      cpu: Math.round(data.cpu?.total || 0),
      mem: Math.round(data.mem?.percent || 0),
      disk: Math.round(data.fs?.[0]?.percent || 0),
      uptime: formatUptime(data.uptime || "N/A"),
      hostname: data.system?.hostname || 'Debian-HomeLab',
      containers: containers,
      disks: disks,
      memory: {
        total: memTotal,
        used: memUsed,
        percent: memPercent
      },
      swap: {
        total: swapTotal,
        used: swapUsed,
        percent: swapPercent
      },
      network: networkInterfaces,
      temperature: temps,
      security: {
        failedLogins: failedLoginAttempts,
        threatLevel: failedLoginAttempts > 10 ? 'HIGH' : failedLoginAttempts > 0 ? 'MEDIUM' : 'LOW'
      }
    });
  } catch (e) {
    return NextResponse.json({ 
      online: false,
      error: 'Błąd danych',
      message: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
