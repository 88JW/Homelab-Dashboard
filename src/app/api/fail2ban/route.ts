import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Wykonaj komendę fail2ban na hoście przez docker exec do host namespace
    // Alternatywnie możemy wykonać bezpośrednio na hoście
    const { stdout: jailList } = await execAsync('fail2ban-client status 2>/dev/null || echo ""');
    
    const jails: string[] = [];
    const jailMatch = jailList.match(/Jail list:\s+(.+)/);
    if (jailMatch) {
      jails.push(...jailMatch[1].split(/,\s*/));
    }

    let totalBanned = 0;
    let totalFailed = 0;
    const jailStats: any[] = [];

    // Pobierz szczegóły dla każdego jail'a
    for (const jail of jails) {
      try {
        const { stdout: jailStatus } = await execAsync(`fail2ban-client status ${jail} 2>/dev/null || echo ""`);
        
        const currentlyFailedMatch = jailStatus.match(/Currently failed:\s+(\d+)/);
        const totalFailedMatch = jailStatus.match(/Total failed:\s+(\d+)/);
        const currentlyBannedMatch = jailStatus.match(/Currently banned:\s+(\d+)/);
        const totalBannedMatch = jailStatus.match(/Total banned:\s+(\d+)/);
        const bannedIPsMatch = jailStatus.match(/Banned IP list:\s*(.*)$/m);

        const currentlyFailed = currentlyFailedMatch ? parseInt(currentlyFailedMatch[1]) : 0;
        const totalFailedCount = totalFailedMatch ? parseInt(totalFailedMatch[1]) : 0;
        const currentlyBanned = currentlyBannedMatch ? parseInt(currentlyBannedMatch[1]) : 0;
        const totalBannedCount = totalBannedMatch ? parseInt(totalBannedMatch[1]) : 0;
        const bannedIPs = bannedIPsMatch && bannedIPsMatch[1].trim() 
          ? bannedIPsMatch[1].trim().split(/\s+/) 
          : [];

        totalBanned += currentlyBanned;
        totalFailed += currentlyFailed;

        jailStats.push({
          name: jail,
          currentlyFailed,
          totalFailed: totalFailedCount,
          currentlyBanned,
          totalBanned: totalBannedCount,
          bannedIPs
        });
      } catch (e) {
        console.error(`Error getting status for jail ${jail}:`, e);
      }
    }

    return NextResponse.json({
      status: jails.length > 0 ? 'active' : 'inactive',
      totalJails: jails.length,
      totalBanned,
      totalFailed,
      jails: jailStats
    });
  } catch (error: any) {
    console.error('Fail2ban API error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error.message,
      totalJails: 0,
      totalBanned: 0,
      totalFailed: 0,
      jails: []
    }, { status: 200 });
  }
}
