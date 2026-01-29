import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get UFW blocked connections from dmesg
    const { stdout: ufwBlocks } = await execAsync('nsenter --target 1 --mount --uts --ipc --net --pid -- dmesg | grep "UFW BLOCK" | tail -50');
    
    // Get Fail2Ban recent activity
    const { stdout: fail2banLogs } = await execAsync('nsenter --target 1 --mount --uts --ipc --net --pid -- sudo journalctl -u fail2ban --since "24 hours ago" -n 100 --no-pager 2>/dev/null || echo ""');
    
    // Parse UFW blocks
    const ufwBlockCount = ufwBlocks.split('\n').filter(line => line.includes('UFW BLOCK')).length;
    const ufwBlockedIPs = new Set<string>();
    const ufwBlockedPorts = new Map<number, number>();
    
    ufwBlocks.split('\n').forEach(line => {
      const srcMatch = line.match(/SRC=([0-9.]+)/);
      const dptMatch = line.match(/DPT=(\d+)/);
      
      if (srcMatch) ufwBlockedIPs.add(srcMatch[1]);
      if (dptMatch) {
        const port = parseInt(dptMatch[1]);
        ufwBlockedPorts.set(port, (ufwBlockedPorts.get(port) || 0) + 1);
      }
    });

    // Parse Fail2Ban activity
    const fail2banBans = (fail2banLogs.match(/Ban /g) || []).length;
    const fail2banUnbans = (fail2banLogs.match(/Unban /g) || []).length;
    const fail2banFound = (fail2banLogs.match(/Found /g) || []).length;

    // Top blocked ports
    const topPorts = Array.from(ufwBlockedPorts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([port, count]) => ({ port, count }));

    return NextResponse.json({
      ufw: {
        totalBlocks: ufwBlockCount,
        uniqueIPs: ufwBlockedIPs.size,
        topBlockedPorts: topPorts,
        recentActivity: ufwBlockCount > 0
      },
      fail2ban: {
        totalBans: fail2banBans,
        totalUnbans: fail2banUnbans,
        totalFound: fail2banFound,
        recentActivity: fail2banFound > 0
      },
      summary: {
        totalEvents: ufwBlockCount + fail2banFound,
        activeProtection: ufwBlockCount > 0 || fail2banFound > 0
      }
    });
  } catch (error: any) {
    console.error('Security activity API error:', error);
    return NextResponse.json({ 
      error: error.message,
      ufw: { totalBlocks: 0, uniqueIPs: 0, topBlockedPorts: [], recentActivity: false },
      fail2ban: { totalBans: 0, totalUnbans: 0, totalFound: 0, recentActivity: false },
      summary: { totalEvents: 0, activeProtection: false }
    }, { status: 200 });
  }
}
