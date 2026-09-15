import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const nsenter = ['--target', '1', '--mount', '--uts', '--ipc', '--net', '--pid', '--']

async function hostJson(command: string[]) {
  const { stdout } = await execFileAsync('nsenter', [...nsenter, 'k3s', 'kubectl', ...command], { timeout: 10_000 })
  return JSON.parse(stdout)
}

export async function GET() {
  try {
    const [nodes, pods] = await Promise.all([
      hostJson(['get', 'nodes', '-o', 'json']),
      hostJson(['get', 'pods', '-A', '-o', 'json']),
    ])
    const nodeItems = nodes.items.map((node: any) => ({
      name: node.metadata.name,
      ready: node.status.conditions.some((condition: any) => condition.type === 'Ready' && condition.status === 'True'),
    }))
    const workloads = pods.items
      .filter((pod: any) => !pod.metadata.namespace.startsWith('kube-') && ['Pending', 'Running'].includes(pod.status.phase))
      .map((pod: any) => ({
        name: pod.metadata.name,
        namespace: pod.metadata.namespace,
        node: pod.spec.nodeName || 'pending',
        phase: pod.status.phase,
        ready: (pod.status.containerStatuses || []).every((container: any) => container.ready),
      }))
    const running = workloads.filter((pod: any) => pod.phase === 'Running' && pod.ready).length
    const gateway = pods.items.find((pod: any) => pod.metadata.namespace === 'kube-system' && pod.metadata.name.startsWith('traefik-'))
    const sso = pods.items.find((pod: any) => pod.metadata.namespace === 'sso-dashboard' && pod.metadata.name.startsWith('traefik-forward-auth-'))
    return NextResponse.json({
      nodes: nodeItems,
      readyNodes: nodeItems.filter((node: any) => node.ready).length,
      workloads: workloads.length,
      running,
      topology: {
        gateway: { online: gateway?.status.phase === 'Running', node: gateway?.spec.nodeName || null },
        sso: { online: sso?.status.phase === 'Running', node: sso?.spec.nodeName || null },
        workloads,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Cluster status unavailable' }, { status: 503 })
  }
}
