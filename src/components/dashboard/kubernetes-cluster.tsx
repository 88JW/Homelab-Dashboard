"use client"

import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Activity, Beer, Boxes, Cloud, Database, Globe2, HardDrive, House, LayoutDashboard, LockKeyhole, Mail, Router, Server, ShieldCheck } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((response) => response.json())
type Workload = { name: string; namespace: string; node: string; phase: string; ready: boolean }
type ClusterData = { nodes: { name: string; ready: boolean }[]; readyNodes: number; workloads: number; running: number; topology: { gateway: { online: boolean }; sso: { online: boolean }; workloads: Workload[] } }
type AppIcon = "dashboard" | "home" | "beer" | "mail" | "shield" | "monitoring" | "immich" | "supabase" | "nextcloud"
type AppGroup = { id: string; title: string; caption: string; icon: AppIcon; protected: boolean; workloads: Workload[] }
type AppRule = Omit<AppGroup, "workloads"> & { node: string; match: (workload: Workload) => boolean }
type FlowData = { title: string; subtitle?: string; role?: string; online?: boolean; apps?: AppGroup[] }

function AppSymbol({ icon, className = "h-4 w-4" }: { icon: AppIcon; className?: string }) {
  const icons = { dashboard: LayoutDashboard, home: House, beer: Beer, mail: Mail, shield: ShieldCheck, monitoring: Activity, immich: Cloud, supabase: Database, nextcloud: HardDrive }
  const Icon = icons[icon]
  return <Icon className={className} />
}

function StatusDot({ online }: { online?: boolean }) {
  return <span className={`h-2 w-2 shrink-0 rounded-full ring-4 ${online ? "bg-emerald-400 ring-emerald-400/10" : "bg-amber-400 ring-amber-400/10"}`} />
}

function EndpointNode({ data }: NodeProps<Node<FlowData>>) {
  const Icon = data.title === "Internet" ? Globe2 : data.title === "Traefik" ? Router : LockKeyhole
  const color = data.title === "SSO policy" ? "bg-violet-400/10 text-violet-200" : "bg-cyan-400/10 text-cyan-200"
  return <div className="min-w-52 rounded-2xl border border-slate-700/80 bg-slate-950/90 p-3 shadow-xl shadow-slate-950/40 backdrop-blur">
    <Handle type="target" position={Position.Top} className="!border-0 !bg-cyan-300" />
    <div className="flex gap-3"><span className={`rounded-xl p-2.5 ${color}`}><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-3"><b className="font-mono text-xs text-slate-100">{data.title}</b><StatusDot online={data.online} /></span><span className="mt-1 block text-[10px] leading-4 text-slate-400">{data.subtitle}</span></span></div>
    <Handle type="source" position={Position.Bottom} className={`!border-0 ${data.title === "SSO policy" ? "!bg-violet-300" : "!bg-cyan-300"}`} />
  </div>
}

function ServerNode({ data }: NodeProps<Node<FlowData>>) {
  const isLenovo = data.title === "Lenovo"
  const tone = isLenovo ? "border-cyan-300/35 bg-cyan-400/10 text-cyan-100" : "border-violet-300/35 bg-violet-400/10 text-violet-100"
  return <div className="w-[340px] rounded-2xl border border-slate-600/90 bg-slate-950/95 p-4 shadow-2xl shadow-slate-950/45 backdrop-blur">
    <Handle type="target" position={Position.Top} className={`!border-0 ${isLenovo ? "!bg-cyan-300" : "!bg-violet-300"}`} />
    <div className="flex items-start gap-3"><span className={`rounded-xl p-2.5 ${isLenovo ? "bg-cyan-400/10 text-cyan-200" : "bg-violet-400/10 text-violet-200"}`}><Server className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><b className="font-mono text-sm text-slate-100">{data.title}</b><StatusDot online={data.online} /></span><span className="mt-1 block text-[10px] uppercase tracking-wider text-slate-500">{data.role}</span></span></div>
    <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-800 pt-3">{(data.apps || []).map((app) => <div key={app.id} className={`min-w-0 rounded-xl border px-2.5 py-2 ${app.protected ? tone : "border-slate-700 bg-slate-900/80 text-slate-200"}`}><div className="flex items-center gap-1.5"><AppSymbol icon={app.icon} className="h-3.5 w-3.5 shrink-0" /><span className="truncate text-[11px] font-medium">{app.title}</span>{app.protected && <LockKeyhole className="ml-auto h-3 w-3 shrink-0 text-violet-200" />}</div><p className="mt-1 truncate text-[9px] text-slate-400">{app.workloads.length} component{app.workloads.length === 1 ? "" : "s"}</p></div>)}</div>
  </div>
}

const nodeTypes = { endpoint: EndpointNode, server: ServerNode }
const appRules: AppRule[] = [
  { id: "dashboard", title: "Dashboard", caption: "Panel homelabu", icon: "dashboard", protected: true, node: "lenovo", match: (w) => w.name.startsWith("homelab-dashboard") },
  { id: "homeapp", title: "HomeApp", caption: "Obowiązki domowe", icon: "home", protected: true, node: "lenovo", match: (w) => w.name.startsWith("homeapp-") },
  { id: "beertaste", title: "BeerTaste", caption: "Aplikacja i rozpoznawanie", icon: "beer", protected: true, node: "lenovo", match: (w) => w.name.startsWith("beertaste-") },
  { id: "mail", title: "Mail", caption: "Poste.io i usługi poczty", icon: "mail", protected: false, node: "lenovo", match: (w) => w.name.startsWith("posteio-") || w.name.startsWith("mail-") },
  { id: "security", title: "CrowdSec", caption: "Ochrona i LAPI", icon: "shield", protected: false, node: "lenovo", match: (w) => w.namespace === "crowdsec" },
  { id: "monitoring-lenovo", title: "Monitoring", caption: "Glances", icon: "monitoring", protected: false, node: "lenovo", match: (w) => w.name.startsWith("glances-") },
  { id: "immich", title: "Immich", caption: "Zdjęcia i ML", icon: "immich", protected: false, node: "linuxserver", match: (w) => w.namespace === "immich" },
  { id: "supabase", title: "Supabase", caption: "Baza, API i auth", icon: "supabase", protected: false, node: "linuxserver", match: (w) => w.namespace === "supabase" },
  { id: "nextcloud", title: "Nextcloud", caption: "Pliki i synchronizacja", icon: "nextcloud", protected: true, node: "linuxserver", match: (w) => w.namespace === "nextcloud" },
  { id: "monitoring-dell", title: "Monitoring", caption: "Glances i CrowdSec", icon: "monitoring", protected: false, node: "linuxserver", match: (w) => w.name.startsWith("glances-") || w.namespace === "crowdsec" },
]

function nodeLabel(node: string) { return node === "lenovo" ? "Lenovo" : "LinuxServer" }

export function KubernetesCluster() {
  const { data, error, isLoading } = useSWR<ClusterData>("/api/cluster", fetcher, { refreshInterval: 15_000 })
  const [selectedNode, setSelectedNode] = useState("lenovo")
  const workloadsFor = useCallback((node: string) => (data?.topology.workloads || []).filter((workload) => workload.node === node), [data])
  const appsFor = useCallback((node: string) => appRules.filter((rule) => rule.node === node).map((rule) => ({ ...rule, workloads: workloadsFor(node).filter(rule.match) })).filter((app) => app.workloads.length), [workloadsFor])
  const lenovo = data?.nodes.find((node) => node.name === "lenovo")
  const dell = data?.nodes.find((node) => node.name === "linuxserver")
  const healthy = Boolean(data && data.readyNodes === data.nodes.length)
  const selectedApps = appsFor(selectedNode)
  const selectedWorkloads = workloadsFor(selectedNode)
  const nodes = useMemo<Node<FlowData>[]>(() => [
    { id: "internet", type: "endpoint", position: { x: 470, y: 5 }, data: { title: "Internet", subtitle: "Public traffic · HTTPS", online: true }, draggable: false },
    { id: "traefik", type: "endpoint", position: { x: 470, y: 100 }, data: { title: "Traefik", subtitle: "Gateway · routing to both nodes", online: data?.topology.gateway.online }, draggable: false },
    { id: "sso", type: "endpoint", position: { x: 470, y: 195 }, data: { title: "SSO policy", subtitle: "Protects selected applications", online: data?.topology.sso.online }, draggable: false },
    { id: "lenovo", type: "server", position: { x: 55, y: 330 }, data: { title: "Lenovo", role: "Control plane · edge & apps", online: lenovo?.ready, apps: appsFor("lenovo") }, draggable: false },
    { id: "linuxserver", type: "server", position: { x: 680, y: 330 }, data: { title: "LinuxServer", role: "Worker · data & media", online: dell?.ready, apps: appsFor("linuxserver") }, draggable: false },
  ], [appsFor, data, dell?.ready, lenovo?.ready])
  const edges = useMemo<Edge[]>(() => [
    { id: "internet-traefik", source: "internet", target: "traefik", label: "HTTPS · 443", animated: true, style: { stroke: "#22d3ee", strokeWidth: 2 }, labelStyle: { fill: "#a5f3fc", fontSize: 10 }, labelBgStyle: { fill: "#111827", fillOpacity: .92 } },
    { id: "traefik-sso", source: "traefik", target: "sso", label: "protected routes", animated: Boolean(data?.topology.sso.online), style: { stroke: "#a78bfa", strokeWidth: 2 }, labelStyle: { fill: "#ddd6fe", fontSize: 10 }, labelBgStyle: { fill: "#111827", fillOpacity: .92 } },
    { id: "traefik-lenovo", source: "traefik", target: "lenovo", label: "routing", animated: Boolean(lenovo?.ready), style: { stroke: "#22d3ee", strokeWidth: 2 }, labelStyle: { fill: "#a5f3fc", fontSize: 10 }, labelBgStyle: { fill: "#111827", fillOpacity: .92 } },
    { id: "traefik-linuxserver", source: "traefik", target: "linuxserver", label: "routing", animated: Boolean(dell?.ready), style: { stroke: "#22d3ee", strokeWidth: 2 }, labelStyle: { fill: "#a5f3fc", fontSize: 10 }, labelBgStyle: { fill: "#111827", fillOpacity: .92 } },
    { id: "sso-lenovo", source: "sso", target: "lenovo", label: "Dashboard · HomeApp · BeerTaste", animated: Boolean(lenovo?.ready), style: { stroke: "#a78bfa", strokeWidth: 2, strokeDasharray: "7 5" }, labelStyle: { fill: "#ddd6fe", fontSize: 10 }, labelBgStyle: { fill: "#111827", fillOpacity: .92 } },
    { id: "sso-linuxserver", source: "sso", target: "linuxserver", label: "Nextcloud", animated: Boolean(dell?.ready), style: { stroke: "#a78bfa", strokeWidth: 2, strokeDasharray: "7 5" }, labelStyle: { fill: "#ddd6fe", fontSize: 10 }, labelBgStyle: { fill: "#111827", fillOpacity: .92 } },
  ], [data?.topology.sso.online, dell?.ready, lenovo?.ready])

  return <section className="rounded-3xl border border-slate-700/70 bg-[#0c1328] p-5 shadow-[0_18px_50px_rgba(2,6,23,.35)]">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="rounded-xl bg-cyan-400/15 p-2.5 text-cyan-200"><Boxes className="h-5 w-5" /></span><div><h2 className="font-mono text-sm font-bold tracking-[.16em] text-slate-100">CLUSTER MAP</h2><p className="mt-1 text-xs text-slate-400">Aplikacje, ich komponenty oraz przepływ ruchu i SSO.</p></div></div><span className={`rounded-full border px-3 py-1.5 text-xs font-mono ${healthy ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-amber-300/30 bg-amber-400/10 text-amber-200"}`}>{isLoading ? "checking" : error ? "unavailable" : `${data?.running}/${data?.workloads} healthy`}</span></div>
    <div className="relative h-[610px] overflow-hidden rounded-2xl border border-slate-700/70 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.12),transparent_40%),#090f1d]"><div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded-xl border border-slate-700/70 bg-slate-950/80 px-3 py-2 text-[10px] text-slate-300 backdrop-blur"><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-cyan-300" />ruch / routing</span><span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-violet-300" />wymaga SSO</span><span className="flex items-center gap-1"><LockKeyhole className="h-3 w-3 text-violet-200" />aplikacja chroniona</span></div><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodeClick={(_, node) => (node.id === "lenovo" || node.id === "linuxserver") && setSelectedNode(node.id)} fitView fitViewOptions={{ padding: .16 }} minZoom={.45} maxZoom={1.15} nodesDraggable={false} nodesConnectable={false} elementsSelectable><Background gap={24} size={1} color="#24324b" /><Controls showInteractive={false} className="!border-slate-700 !bg-slate-950 [&>button]:!border-slate-700 [&>button]:!bg-slate-950 [&>button]:!fill-slate-300" /></ReactFlow></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-[.8fr_1.2fr]"><div className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4"><p className="text-xs font-mono uppercase tracking-[.14em] text-slate-400">Selected server</p><div className="mt-3 flex items-center gap-3"><span className={`rounded-xl p-2.5 ${selectedNode === "lenovo" ? "bg-cyan-400/10 text-cyan-200" : "bg-violet-400/10 text-violet-200"}`}>{selectedNode === "lenovo" ? <ShieldCheck className="h-5 w-5" /> : <Database className="h-5 w-5" />}</span><div><p className="font-mono text-sm text-slate-100">{nodeLabel(selectedNode)}</p><p className="text-xs text-slate-400">{selectedNode === "lenovo" ? "Control plane · edge & applications" : "Worker · data & media services"}</p></div></div><div className="mt-4 flex gap-2"><button onClick={() => setSelectedNode("lenovo")} className={`rounded-lg px-2.5 py-1.5 text-xs transition ${selectedNode === "lenovo" ? "bg-cyan-400/15 text-cyan-100" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}>Lenovo</button><button onClick={() => setSelectedNode("linuxserver")} className={`rounded-lg px-2.5 py-1.5 text-xs transition ${selectedNode === "linuxserver" ? "bg-violet-400/15 text-violet-100" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}>LinuxServer</button></div></div><div className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-mono uppercase tracking-[.14em] text-slate-400">Applications on {nodeLabel(selectedNode)}</p><span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-mono text-slate-300">{selectedWorkloads.length} pods</span></div><div className="grid gap-2 sm:grid-cols-2">{selectedApps.map((app) => <div key={app.id} className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-3"><div className="flex items-center gap-2"><span className={`rounded-lg p-1.5 ${app.protected ? "bg-violet-400/10 text-violet-200" : "bg-slate-800 text-cyan-200"}`}><AppSymbol icon={app.icon} className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-100">{app.title}</p><p className="truncate text-[10px] text-slate-500">{app.caption}</p></div>{app.protected && <LockKeyhole className="ml-auto h-3.5 w-3.5 shrink-0 text-violet-200" />}</div><p className="mt-2 text-[10px] text-slate-400">{app.workloads.length} active component{app.workloads.length === 1 ? "" : "s"}</p></div>)}</div></div></div>
  </section>
}
