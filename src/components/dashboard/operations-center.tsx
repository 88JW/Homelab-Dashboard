"use client"

import { Activity, Bot, CircleAlert, RotateCcw, ShieldCheck, Wrench } from "lucide-react"
import { useState } from "react"

type Problem = { id: string; namespace: string; pod: string; node: string; severity: "critical" | "warning"; title: string; detail: string; repair: "recreate-pod" }
type Diagnosis = { checkedAt: string; nodes: { name: string; ready: boolean }[]; healthyPods: number; problems: Problem[]; summary: string }

export function OperationsCenter() {
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [loading, setLoading] = useState(false)
  const [repairing, setRepairing] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function diagnose() {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch("/api/operations/diagnose", { cache: "no-store" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Diagnoza nie powiodła się.")
      setDiagnosis(payload)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Diagnoza nie powiodła się.")
    } finally {
      setLoading(false)
    }
  }

  async function repair(problem: Problem) {
    if (!window.confirm(`Odtworzyć problematyczny pod ${problem.id}? Nie zmienia to danych ani konfiguracji, ale chwilowo przerwie jego działanie.`)) return
    setRepairing(problem.id)
    setMessage(null)
    try {
      const response = await fetch("/api/operations/repair", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ namespace: problem.namespace, pod: problem.pod }) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Naprawa nie powiodła się.")
      setMessage(payload.message)
      await diagnose()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Naprawa nie powiodła się.")
    } finally {
      setRepairing(null)
    }
  }

  return <section className="rounded-3xl border border-slate-700/70 bg-[#0c1328] p-5 shadow-[0_18px_50px_rgba(2,6,23,.35)]">
    <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="rounded-xl bg-violet-400/15 p-2.5 text-violet-200"><Bot className="h-5 w-5" /></span><div><h2 className="font-mono text-sm font-bold tracking-[.16em] text-slate-100">OPERATOR SERWERA</h2><p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">Lokalna diagnoza klastra i ograniczone, potwierdzane procedury naprawcze. AI można podłączyć później jako warstwę wyjaśniającą — nie dostaje pełnego dostępu do serwera.</p></div></div><button onClick={diagnose} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-3.5 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60"><Activity className="h-4 w-4" />{loading ? "Diagnozuję…" : "Diagnozuj"}</button></div>
    {message && <p className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">{message}</p>}
    {!diagnosis && !message && <div className="mt-5 rounded-2xl border border-dashed border-slate-700 p-4 text-xs text-slate-400">Uruchom diagnozę, aby sprawdzić węzły, gotowość podów i automatycznie wskazać wyłącznie bezpieczne akcje.</div>}
    {diagnosis && <div className="mt-5 space-y-3"><div className="grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-slate-950/50 p-3"><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">Aktywne pody</p><p className="mt-1 font-mono text-lg text-slate-100">{diagnosis.healthyPods}</p></div><div className="rounded-xl bg-slate-950/50 p-3"><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">Węzły</p><p className="mt-1 font-mono text-lg text-slate-100">{diagnosis.nodes.filter((node) => node.ready).length}/{diagnosis.nodes.length}</p></div><div className="rounded-xl bg-slate-950/50 p-3"><p className="text-[10px] uppercase tracking-[.14em] text-slate-500">Problemy</p><p className={`mt-1 font-mono text-lg ${diagnosis.problems.length ? "text-amber-200" : "text-emerald-200"}`}>{diagnosis.problems.length}</p></div></div><div className={`flex gap-2 rounded-xl border px-3 py-2.5 text-xs ${diagnosis.problems.length ? "border-amber-300/20 bg-amber-400/10 text-amber-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}>{diagnosis.problems.length ? <CircleAlert className="h-4 w-4 shrink-0" /> : <ShieldCheck className="h-4 w-4 shrink-0" />}<span>{diagnosis.summary}</span></div>{diagnosis.problems.map((problem) => <article key={problem.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/35 p-3"><div><p className="font-mono text-xs text-slate-100">{problem.title}</p><p className="mt-1 text-[11px] text-slate-400">{problem.detail} · {problem.node}</p></div><button onClick={() => repair(problem)} disabled={repairing === problem.id} className="inline-flex items-center gap-2 rounded-lg border border-violet-300/30 bg-violet-400/10 px-3 py-2 text-xs font-medium text-violet-100 transition hover:bg-violet-400/20 disabled:opacity-60"><RotateCcw className="h-3.5 w-3.5" />{repairing === problem.id ? "Naprawiam…" : "Napraw"}</button></article>)}<p className="flex items-center gap-2 text-[10px] text-slate-500"><Wrench className="h-3.5 w-3.5" />Wersja 1 nie zmienia sekretów, baz danych, dysków, zapory ani konfiguracji sieci.</p></div>}
  </section>
}
