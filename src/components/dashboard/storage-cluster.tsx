"use client"

import { HardDrive } from "lucide-react"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Kolory dla różnych dysków
const diskColors = [
  "from-blue-500 to-blue-400",
  "from-purple-500 to-purple-400",
  "from-emerald-500 to-emerald-400",
  "from-amber-500 to-amber-400",
  "from-pink-500 to-pink-400",
]

export function StorageCluster() {
  const { data: dellData } = useSWR('/api/stats', fetcher, { refreshInterval: 5000 })
  const { data: lenovoData } = useSWR('/api/lenovo-stats', fetcher, { refreshInterval: 5000 })
  
  const dellDisks = dellData?.disks || []
  const lenovoDisks = lenovoData?.disks || []

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-blue-500/20">
          <HardDrive className="h-5 w-5 text-blue-400" />
        </div>
        <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">Storage Health</h3>
      </div>

      <div className="space-y-6">
        {/* Lenovo Storage */}
        {lenovoDisks.length > 0 && (
          <div>
            <div className="text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">Lenovo Server</div>
            <div className="space-y-4">
              {lenovoDisks.map((disk: any, idx: number) => {
                const percentage = disk.percent || Math.round((disk.used / disk.total) * 100)
                const color = diskColors[idx % diskColors.length]
                
                return (
                  <div key={`lenovo-${disk.mount}`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{disk.name}</span>
                        <span className="text-xs font-mono text-slate-500">{disk.mount}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {disk.used}GB / {disk.total >= 1000 ? `${(disk.total / 1000).toFixed(1)}TB` : `${disk.total}GB`}
                      </span>
                    </div>

                    <div className="relative h-3 rounded-full bg-slate-700/50 overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} blur-sm opacity-50`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-end">
                      <span
                        className={`text-xs font-mono ${
                          percentage > 80 ? "text-red-400" : percentage > 60 ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {percentage}% used
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Dell Storage */}
        {dellDisks.length > 0 && (
          <div>
            <div className="text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">Dell Server</div>
            <div className="space-y-4">
              {dellDisks.map((disk: any, idx: number) => {
                const percentage = disk.percent || Math.round((disk.used / disk.total) * 100)
                const color = diskColors[idx % diskColors.length]
                
                return (
                  <div key={`dell-${disk.mount}`} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{disk.name}</span>
                        <span className="text-xs font-mono text-slate-500">{disk.mount}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">
                        {disk.used}GB / {disk.total >= 1000 ? `${(disk.total / 1000).toFixed(1)}TB` : `${disk.total}GB`}
                      </span>
                    </div>

                    <div className="relative h-3 rounded-full bg-slate-700/50 overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${color} blur-sm opacity-50`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-end">
                      <span
                        className={`text-xs font-mono ${
                          percentage > 80 ? "text-red-400" : percentage > 60 ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {percentage}% used
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {dellDisks.length === 0 && lenovoDisks.length === 0 && (
          <div className="flex items-center justify-center py-4 text-slate-500">
            <span className="text-sm">Loading disks...</span>
          </div>
        )}
      </div>
    </div>
  )
}
