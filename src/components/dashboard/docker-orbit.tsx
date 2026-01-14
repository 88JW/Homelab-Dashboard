"use client"

import { Container, Play, Square, RefreshCw } from "lucide-react"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function DockerOrbit() {
  const { data } = useSWR('/api/stats', fetcher, { refreshInterval: 5000 })
  const containers = data?.containers || []
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-orange-500/20">
          <Container className="h-5 w-5 text-orange-400" />
        </div>
        <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">Docker Orbit</h3>
      </div>

      <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar">
        {containers.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-4">Loading...</div>
        )}
        {containers.slice(0, 8).map((container: any) => {
          const isRunning = container.status?.toLowerCase().includes('running') || container.status?.toLowerCase().includes('up')
          return (
          <div
            key={container.name}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`p-1.5 rounded-lg ${isRunning ? "bg-emerald-500/20" : "bg-red-500/20"}`}
              >
                {isRunning ? (
                  <Play className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                ) : (
                  <Square className="h-3 w-3 text-red-400 fill-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-mono text-slate-200 truncate block">{container.name}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs font-mono ${
                      isRunning ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isRunning ? 'running' : 'stopped'}
                  </span>
                  {container.memory > 0 && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{container.memory}MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}
