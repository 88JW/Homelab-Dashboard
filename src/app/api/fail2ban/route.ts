import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Get CrowdSec decisions (banned IPs) from local CrowdSec instance
    const { stdout: decisionsOutput } = await execAsync('docker exec crowdsec cscli decisions list --output json 2>/dev/null || echo "[]"');
    
    // Get CrowdSec alerts
    const { stdout: alertsOutput } = await execAsync('docker exec crowdsec cscli alerts list --limit 50 --output json 2>/dev/null || echo "[]"');

    // Get Fail2Ban banned IPs
    const { stdout: fail2banOutput } = await execAsync('nsenter --target 1 --mount --uts --ipc --net --pid -- sudo fail2ban-client status sshd 2>/dev/null || echo ""');

    let decisions: any[] = [];
    let alerts: any[] = [];
    let fail2banIPs: any[] = [];

    try {
      decisions = JSON.parse(decisionsOutput);
      if (!Array.isArray(decisions)) decisions = [];
    } catch (e) {
      decisions = [];
    }

    try {
      alerts = JSON.parse(alertsOutput);
      if (!Array.isArray(alerts)) alerts = [];
    } catch (e) {
      alerts = [];
    }

    // Parse Fail2Ban output
    if (fail2banOutput) {
      const bannedMatch = fail2banOutput.match(/Banned IP list:\s+(.+)/);
      if (bannedMatch && bannedMatch[1].trim()) {
        const ips = bannedMatch[1].trim().split(/\s+/);
        fail2banIPs = ips.map((ip: string) => ({
          ip,
          reason: 'SSH Brute Force (Fail2Ban)',
          duration: '-',
          origin: 'fail2ban',
          type: 'ban',
          scope: 'ip'
        }));
      }
    }

    // Combine CrowdSec and Fail2Ban decisions
    const allDecisions = [...decisions, ...fail2banIPs];

    // Count threat types from alerts
    const threatTypes = {
      sshBruteforce: 0,
      httpScan: 0,
      httpCrawl: 0,
      httpExploit: 0,
      portScan: 0,
      other: 0
    };

    alerts.forEach((alert: any) => {
      const scenario = alert.scenario || '';
      if (scenario.includes('ssh')) threatTypes.sshBruteforce++;
      else if (scenario.includes('http-scan')) threatTypes.httpScan++;
      else if (scenario.includes('http-crawl')) threatTypes.httpCrawl++;
      else if (scenario.includes('http-cve') || scenario.includes('exploit')) threatTypes.httpExploit++;
      else if (scenario.includes('scan')) threatTypes.portScan++;
      else if (scenario) threatTypes.other++;
    });

    return NextResponse.json({
      status: 'active',
      totalBanned: allDecisions.length,
      totalAlerts: alerts.length,
      decisions: allDecisions.slice(0, 10).map((d: any) => ({
        ip: d.value || d.ip,
        reason: d.scenario || d.reason || 'Unknown',
        duration: d.duration || '-',
        origin: d.origin || 'local',
        type: d.type,
        scope: d.scope
      })),
      recentAlerts: alerts.slice(0, 10).map((a: any) => ({
        scenario: a.scenario,
        source: a.source?.ip || 'unknown',
        events_count: a.events_count || 1,
        created_at: a.created_at
      })),
      threatTypes
    });
  } catch (error: any) {
    console.error('CrowdSec API error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error.message,
      totalBanned: 0,
      totalAlerts: 0,
      decisions: [],
      recentAlerts: [],
      threatTypes: {
        sshBruteforce: 0,
        httpScan: 0,
        httpCrawl: 0,
        httpExploit: 0,
        portScan: 0,
        other: 0
      }
    }, { status: 200 });
  }
}
