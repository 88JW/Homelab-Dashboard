import { NextResponse } from 'next/server';

export async function GET() {
  const GLANCES_API = 'http://192.168.50.66:61208/api/4/all';

  try {
    const response = await fetch(GLANCES_API, { 
      next: { revalidate: 0 }, 
      cache: 'no-store',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Glances API returned ${response.status}`);
    }

    const data = await response.json();

    // CPU data
    const cpu = Math.round(data.cpu?.total || 0);

    // RAM data
    const memTotal = Math.round((data.mem?.total || 0) / 1024 / 1024 / 1024); // GB
    const memUsed = Math.round((data.mem?.used || 0) / 1024 / 1024 / 1024); // GB
    const memPercent = Math.round(data.mem?.percent || 0);

    // SWAP data
    const swapTotal = Math.round((data.memswap?.total || 0) / 1024 / 1024 / 1024); // GB
    const swapUsed = Math.round((data.memswap?.used || 0) / 1024 / 1024 / 1024); // GB
    const swapPercent = Math.round(data.memswap?.percent || 0);

    // Disk data - filter for NVMe and important drives
    const disks = Array.isArray(data.fs) ? data.fs
      .filter((fs: any) => {
        const device = fs.device_name || '';
        const mount = fs.mnt_point || '';
        // Include NVMe and main physical drives
        return device.includes('nvme') || 
               (mount === '/' || mount.startsWith('/mnt/')) && 
               !mount.includes('docker');
      })
      .map((fs: any) => ({
        name: fs.mnt_point === '/' ? 'SYSTEM' : 
              (fs.mnt_point.split('/').pop()?.toUpperCase() || 'DISK'),
        mount: fs.mnt_point || '/',
        total: Math.round((fs.size || 0) / 1024 / 1024 / 1024), // GB
        used: Math.round(((fs.size || 0) - (fs.free || 0)) / 1024 / 1024 / 1024), // GB
        percent: Math.round(fs.percent || 0),
        device: fs.device_name || 'N/A'
      })) : [];

    // Network data
    const networkInterfaces = Array.isArray(data.network) ? data.network
      .filter((net: any) => {
        const iface = net.interface_name || '';
        // Skip loopback and docker interfaces
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

    // Uptime
    const formatUptime = (seconds: number): string => {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    };

    const uptime = data.uptime ? formatUptime(parseInt(data.uptime)) : 'N/A';
    const hostname = data.system?.hostname || 'Lenovo-Server';

    return NextResponse.json({
      online: true,
      hostname,
      cpu,
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
      disks,
      network: networkInterfaces,
      temperature: temps,
      uptime
    });

  } catch (error) {
    console.error('Lenovo server error:', error);
    return NextResponse.json({
      online: false,
      error: 'Server offline or unreachable',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}
