import { execFile } from "child_process"
import { NextRequest, NextResponse } from "next/server"
import { promisify } from "util"
import { getSsoIdentity } from "@/lib/sso-user"

const execFileAsync = promisify(execFile)
const nsenter = ["--target", "1", "--mount", "--uts", "--ipc", "--net", "--pid", "--"]

async function clusterJson(command: string[]) {
  const { stdout } = await execFileAsync("nsenter", [...nsenter, "k3s", "kubectl", ...command], { timeout: 10_000, maxBuffer: 1_000_000 })
  return JSON.parse(stdout)
}

export async function POST(request: NextRequest) {
  if (!(await getSsoIdentity())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.namespace !== "string" || typeof body.pod !== "string" || !/^[a-z0-9-]+$/.test(body.namespace) || !/^[a-z0-9][a-z0-9.-]*$/.test(body.pod)) {
    return NextResponse.json({ error: "Nieprawidłowy cel naprawy." }, { status: 400 })
  }

  try {
    const pod = await clusterJson(["get", "pod", body.pod, "-n", body.namespace, "-o", "json"])
    const statuses = pod.status.containerStatuses || []
    const unhealthy = pod.status.phase !== "Running" || !statuses.length || statuses.some((status: any) => !status.ready)
    if (!unhealthy) return NextResponse.json({ error: "Ten pod jest już zdrowy; restart nie jest potrzebny." }, { status: 409 })
    if (pod.metadata.namespace === "kube-system" || !pod.metadata.ownerReferences?.length) {
      return NextResponse.json({ error: "Ten komponent wymaga ręcznej procedury." }, { status: 403 })
    }

    await execFileAsync("nsenter", [...nsenter, "k3s", "kubectl", "delete", "pod", body.pod, "-n", body.namespace, "--wait=false"], { timeout: 10_000 })
    return NextResponse.json({ ok: true, message: `Zlecono bezpieczne odtworzenie ${body.namespace}/${body.pod}. Kontroler Kubernetes uruchomi nową replikę.` })
  } catch {
    return NextResponse.json({ error: "Nie udało się uruchomić procedury naprawczej." }, { status: 503 })
  }
}
