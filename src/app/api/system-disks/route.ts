import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Pobierz dane z df -B1 (w bajtach dla precyzji)
    const { stdout } = await execAsync('df -B1 | grep -E "^/dev/(sd|nvme)"');
    
    const disks = stdout.trim().split('\n').map(line => {
      const parts = line.split(/\s+/);
      const device = parts[0];
      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const available = parseInt(parts[3]);
      const percent = parseInt(parts[4].replace('%', ''));
      const mount = parts[5];
      
      // Nazewnictwo dysków
      let name = 'DISK';
      if (mount === '/') {
        name = 'SYSTEM';
      } else if (mount.startsWith('/mnt/')) {
        const dirName = mount.split('/').pop() || 'DISK';
        name = dirName.toUpperCase();
      }
      
      return {
        name,
        mount,
        total: Math.round(total / 1024 / 1024 / 1024), // GB
        used: Math.round(used / 1024 / 1024 / 1024), // GB
        percent,
        device
      };
    });
    
    return NextResponse.json({ disks, online: true });
  } catch (error) {
    console.error('Error reading disk info:', error);
    return NextResponse.json({ 
      disks: [], 
      online: false, 
      error: 'Failed to read disk information' 
    });
  }
}
