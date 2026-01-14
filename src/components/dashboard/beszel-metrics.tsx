"use client"

import { Activity, Cpu, MemoryStick, HardDrive } from "lucide-react"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import useSWR from 'swr'
import { useState, useEffect } from 'react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function BeszelMetrics() {
  const { data } = useSWR('/api/stats', fetcher, { refreshInterval: 2000 })
  const [cpuHistory, setCpuHistory] = useState<{value: number}[]>([])
  const [memHistory, setMemHistory] = useState<{value: number}[]>([])
  const [diskHistory, setDiskHistory] = useState<{value: number}[]>([])

  useEffect(() => {
    if (data && !data.error) {
      setCpuHistory(prev => [...prev, { value: data.cpu }].slice(-20))
      setMemHistory(prev => [...prev, { value: data.mem }].slice(-20))
      setDiskHistory(prev => [...prev, { value: data.disk || 0 }].slice(-20))
    }
  }, [data])

  const metrics = [
    {
      name: "CPU",
      icon: Cpu,
      value: data?.cpu ? `${data.cpu}%` : "---",
      color: "#06b6d4",
      data: cpuHistory.length > 0 ? cpuHistory : Array(20).fill({ value: 0 }),
    },
    {
      name: "RAM",
      icon: MemoryStick,
      value: data?.mem ? `${data.mem}%` : "---",
      color: "#a855f7",
      data: memHistory.length > 0 ? memHistory : Array(20).fill({ value: 0 }),
    },
    {
      name: "Disk",
      icon: HardDrive,
      value: data?.disk ? `${data.disk}%` : "---",
      color: "#22c55e",
      data: diskHistory.length > 0 ? diskHistory : Array(20).fill({ value: 0 }),
    },
  ]

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Activity className="h-5 w-5 text-cyan-400" />
        </div>
        <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">Beszel Metrics</h3>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div
              key={metric.name}
              className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30"
            >
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${metric.color}20` }}>
                <Icon className="h-4 w-4" style={{ color: metric.color }} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-400">{metric.name}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: metric.color }}>
                    {metric.value}
                  </span>
                </div>
                <div className="h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metric.data}>
                      <YAxis domain={[0, 100]} hide />
                      <Line type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
