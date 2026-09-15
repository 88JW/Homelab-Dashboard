import { execFile } from "child_process"
import { NextResponse } from "next/server"
import { promisify } from "util"
import { getSsoIdentity } from "@/lib/sso-user"

const execFileAsync = promisify(execFile)
const nsenter = ["--target", "1", "--mount", "--uts", "--ipc", "--net", "--pid", "--"]

type Pod = {
  metadata: { name: string; namespace: string }
  spec: { nodeName?: string }
  status: { phase?: string; containerStatuses?: { ready?: boolean; restartCount?: number; state?: { waiting?: { reason?: string }; terminated?: { reason?: string } } }[] }
}

async function clusterJson(command: string[]) {
  const { stdout } = await execFileAsync("nsenter", [...nsenter, "k3s", "kubectl", ...command], { timeout: 10_000, maxBuffer: 2_000_000 })
  return JSON.parse(stdout)
}

function podProblem(pod: Pod) {
  const statuses = pod.status.containerStatuses || []
  const notReady = pod.status.phase !== "Running" || !statuses.length || statuses.some((status) => !status.ready)
  if (!notReady) return null
  const state = statuses.find((status) => status.state?.waiting || status.state?.terminated)?.state
  const reason = state?.waiting?.reason || state?.terminated?.reason || pod.status.phase || "Unknown"
  const restarts = statuses.reduce((total, status) => total + (status.restartCount || 0), 0)
  return {
    id: `${pod.metadata.namespace}/${pod.metadata.name}`,
    namespace: pod.metadata.namespace,
    pod: pod.metadata.name,
    node: pod.spec.nodeName || "not scheduled",
    severity: ["CrashLoopBackOff", "ImagePullBackOff", "ErrImagePull", "Error"].includes(reason) ? "critical" : "warning",
    title: `${pod.metadata.namespace}/${pod.metadata.name}`,
    detail: `${reason}${restarts ? ` · restarty: ${restarts}` : ""}`,
    repair: "recreate-pod",
  }
}

export async function GET() {
  if (!(await getSsoIdentity())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [nodes, pods] = await Promise.all([
      clusterJson(["get", "nodes", "-o", "json"]),
      clusterJson(["get", "pods", "-A", "-o", "json"]),
    ])
    const nodeSummary = nodes.items.map((node: any) => ({
      name: node.metadata.name,
      ready: node.status.conditions.some((condition: any) => condition.type === "Ready" && condition.status === "True"),
    }))
    const problems = (pods.items as Pod[])
      .filter((pod) => pod.metadata.namespace !== "kube-system" && !pod.metadata.name.startsWith("node-debugger-") && ["Running", "Pending", "Unknown", "Failed"].includes(pod.status.phase || ""))
      .map(podProblem)
      .filter(Boolean)

    return NextResponse.json({
      checkedAt: new Date().toISOString(),
      nodes: nodeSummary,
      healthyPods: (pods.items as Pod[]).filter((pod) => pod.status.phase === "Running" && (pod.status.containerStatuses || []).every((status) => status.ready)).length,
      problems,
      summary: problems.length ? `Wykryto ${problems.length} problem${problems.length === 1 ? "" : "y"}.` : "Klaster i aktywne aplikacje są gotowe.",
    })
  } catch {
    return NextResponse.json({ error: "Nie udało się odczytać stanu klastra." }, { status: 503 })
  }
}
