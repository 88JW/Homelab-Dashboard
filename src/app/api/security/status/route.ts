import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const nsenter = ['--target', '1', '--mount', '--uts', '--ipc', '--net', '--pid', '--']

async function host(command: string[]) {
  try {
    const { stdout } = await execFileAsync('nsenter', [...nsenter, ...command], { timeout: 8_000 })
    return stdout.trim()
  } catch { return '' }
}

export async function GET() {
  const [ufw, fail2ban, apparmor, crowdsec] = await Promise.all([
    host(['ufw', 'status']),
    host(['systemctl', 'is-active', 'fail2ban']),
    host(['sh', '-c', 'aa-status --enabled >/dev/null 2>&1 && printf active']),
    host(['k3s', 'kubectl', '-n', 'crowdsec', 'exec', 'deploy/crowdsec-lapi', '--', 'cscli', 'bouncers', 'list', '-o', 'json']),
  ])
  const crowdsecReady = (() => { try { return JSON.parse(crowdsec).some((bouncer: any) => bouncer.name === 'traefik' && !bouncer.revoked && bouncer.last_pull) } catch { return false } })()
  const security = [
    { name: 'UFW', active: ufw.includes('Status: active'), details: ufw.includes('Status: active') ? 'Firewall active' : 'Unavailable' },
    { name: 'Fail2Ban', active: fail2ban === 'active', details: fail2ban === 'active' ? 'Service active' : 'Unavailable' },
    { name: 'AppArmor', active: apparmor === 'active', details: apparmor === 'active' ? 'Profiles enforced' : 'Unavailable' },
    { name: 'CrowdSec', active: crowdsecReady, details: crowdsecReady ? 'LAPI and Traefik bouncer active' : 'Unavailable' },
  ]
  const activeCount = security.filter((system) => system.active).length
  return NextResponse.json({ security, activeCount, totalCount: security.length, status: activeCount === security.length ? 'protected' : activeCount ? 'partial' : 'vulnerable' })
}
