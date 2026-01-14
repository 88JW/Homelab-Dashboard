import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Pobierz metryki CrowdSec
    const { stdout: metricsOutput } = await execAsync('docker exec crowdsec cscli metrics --output json 2>/dev/null || echo "{}"');
    
    // Pobierz aktywne decyzje (zablokowane IP)
    const { stdout: decisionsOutput } = await execAsync('docker exec crowdsec cscli decisions list --output json 2>/dev/null || echo "[]"');
    
    // Pobierz ostatnie alerty
    const { stdout: alertsOutput } = await execAsync('docker exec crowdsec cscli alerts list --limit 10 --output json 2>/dev/null || echo "[]"');

    let metrics: any = {};
    let decisions: any[] = [];
    let alerts: any[] = [];

    try {
      metrics = JSON.parse(metricsOutput);
    } catch (e) {
      // Parse ręcznie jeśli JSON nie działa
      const lines = metricsOutput.split('\n');
      const localApiSection = lines.find(line => line.includes('Local API Decisions'));
      if (localApiSection) {
        metrics = { localApiDecisions: [] };
      }
    }

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

    // Alternatywnie parsuj tekst jeśli JSON nie działa
    const { stdout: textMetrics } = await execAsync('docker exec crowdsec cscli metrics 2>/dev/null || echo ""');
    
    // Parsuj statystyki z tekstu
    const threatStats = {
      httpBruteforce: 0,
      httpCrawl: 0,
      httpExploit: 0,
      httpScan: 0,
      sshBruteforce: 0,
      vmExploit: 0,
      genericScan: 0,
      total: 0
    };

    const lines = textMetrics.split('\n');
    for (const line of lines) {
      if (line.includes('http:bruteforce')) {
        const match = line.match(/\|\s*(\d+)\s*\|/);
        if (match) threatStats.httpBruteforce = parseInt(match[1]);
      }
      if (line.includes('http:crawl')) {
        const match = line.match(/\|\s*(\d+)\s*\|/);
        if (match) threatStats.httpCrawl = parseInt(match[1]);
      }
      if (line.includes('http:exploit')) {
        const match = line.match(/\|\s*(\d+)\s*\|/);
        if (match) threatStats.httpExploit = parseInt(match[1]);
      }
      if (line.includes('http:scan')) {
        const match = line.match(/\|\s*(\d+)\s*\|/);
        if (match) threatStats.httpScan = parseInt(match[1]);
      }
      if (line.includes('ssh:bruteforce')) {
        const match = line.match(/\|\s*(\d+)\s*\|/);
        if (match) threatStats.sshBruteforce = parseInt(match[1]);
      }
      if (line.includes('vm-management:exploit')) {
        const match = line.match(/\|\s*(\d+)\s*\|/);
        if (match) threatStats.vmExploit = parseInt(match[1]);
      }
      if (line.includes('generic:scan')) {
        const match = line.match(/\|\s*(\d+)\s*\|/);
        if (match) threatStats.genericScan = parseInt(match[1]);
      }
    }

    threatStats.total = 
      threatStats.httpBruteforce + 
      threatStats.httpCrawl + 
      threatStats.httpExploit + 
      threatStats.httpScan + 
      threatStats.sshBruteforce + 
      threatStats.vmExploit + 
      threatStats.genericScan;

    return NextResponse.json({
      status: 'active',
      threats: threatStats,
      activeDecisions: decisions.length,
      recentAlerts: alerts.length,
      decisions: decisions.slice(0, 5),
      alerts: alerts.slice(0, 5)
    });
  } catch (error: any) {
    console.error('CrowdSec API error:', error);
    return NextResponse.json({ 
      status: 'error',
      error: error.message,
      threats: {
        total: 0,
        httpBruteforce: 0,
        httpCrawl: 0,
        httpExploit: 0,
        httpScan: 0,
        sshBruteforce: 0,
        vmExploit: 0,
        genericScan: 0
      },
      activeDecisions: 0,
      recentAlerts: 0,
      decisions: [],
      alerts: []
    }, { status: 200 });
  }
}
