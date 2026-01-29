"use client"

import { Activity, Cpu, MemoryStick, HardDrive, Network, Thermometer, Clock } from "lucide-react"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import useSWR from 'swr'
import { useState, useEffect } from 'react'

interface LenovoStats {
  online: boolean
  hostname: string
  cpu: number
  memory: {
    total: number
    used: number
    percent: number
  }
  swap: {
    total: number
    used: number
    percent: number
  }
  disks: Array<{
    name: string
    mount: string
    total: number
    used: number
    percent: number
    device: string
  }>
  network: Array<{
    interface: string
    rx_bytes: number
    tx_bytes: number
    rx_rate: number
    tx_rate: number
  }>
  temperature: Array<{
    label: string
    value: number
  }>
  uptime: string
  error?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LenovoMetrics() {
  const { data, error } = useSWR<LenovoStats>('/api/lenovo-stats', fetcher, { 
    refreshInterval: 2000,
    revalidateOnFocus: false
  })
  
  const [cpuHistory, setCpuHistory] = useState<{value: number}[]>([])
  const [memHistory, setMemHistory] = useState<{value: number}[]>([])

  useEffect(() => {
    if (data?.online && !error) {
      setCpuHistory(prev => [...prev, { value: data.cpu }].slice(-20))
      setMemHistory(prev => [...prev, { value: data.memory.percent }].slice(-20))
    }
  }, [data, error])

  // Server offline state
  if (error || data?.online === false) {
    return (
      <div className="rounded-2xl border border-red-700/50 bg-red-900/20 backdrop-blur-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-red-500/20">
            <Activity className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">
              Lenovo Server
            </h3>
            <p className="text-xs text-red-400 mt-1">OFFLINE</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900/50 rounded-lg p-3">
          {data?.error || 'Server unreachable'}
        </div>
      </div>
    )
  }

  // Loading state
  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 animate-pulse">
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">
            Lenovo Server
          </h3>
        </div>
        <div className="text-xs text-slate-400">Loading...</div>
      </div>
    )
  }

  const primaryDisk = data.disks[0] || { name: 'N/A', percent: 0, used: 0, total: 0 }
  const primaryNetwork = data.network[0] || { interface: 'N/A', rx_rate: 0, tx_rate: 0 }
  const avgTemp = data.temperature.length > 0 
    ? Math.round(data.temperature.reduce((acc, t) => acc + t.value, 0) / data.temperature.length)
    : 0

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <Activity className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">
              Lenovo Server
            </h3>
            <p className="text-xs text-slate-500">{data.hostname}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Clock className="h-3 w-3" />
          <span>{data.uptime}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-4">
        {/* CPU */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <div className="p-2 rounded-lg bg-cyan-500/20">
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-slate-400">CPU</span>
              <span className="text-sm font-bold font-mono text-cyan-400">
                {data.cpu}%
              </span>
            </div>
            <div className="h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cpuHistory.length > 0 ? cpuHistory : Array(20).fill({ value: 0 })}>
                  <YAxis domain={[0, 100]} hide />
                  <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RAM */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <MemoryStick className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-slate-400">RAM</span>
              <span className="text-sm font-bold font-mono text-purple-400">
                {data.memory.used}GB / {data.memory.total}GB ({data.memory.percent}%)
              </span>
            </div>
            <div className="h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={memHistory.length > 0 ? memHistory : Array(20).fill({ value: 0 })}>
                  <YAxis domain={[0, 100]} hide />
                  <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* SWAP */}
        {data.swap.total > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">SWAP</span>
              <span className="text-sm font-mono text-pink-400">
                {data.swap.used}GB / {data.swap.total}GB ({data.swap.percent}%)
              </span>
            </div>
          </div>
        )}

        {/* Disk */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 rounded-lg bg-green-500/20">
              <HardDrive className="h-3 w-3 text-green-400" />
            </div>
            <span className="text-xs font-mono text-slate-400">{primaryDisk.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">{primaryDisk.mount}</span>
            <span className="text-sm font-mono text-green-400">
              {primaryDisk.used}GB / {primaryDisk.total}GB ({primaryDisk.percent}%)
            </span>
          </div>
        </div>

        {/* Network */}
        {primaryNetwork.interface !== 'N/A' && (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20">
                <Network className="h-3 w-3 text-blue-400" />
              </div>
              <span className="text-xs font-mono text-slate-400">{primaryNetwork.interface}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                ↓ {primaryNetwork.rx_rate} KB/s
              </span>
              <span className="text-slate-500">
                ↑ {primaryNetwork.tx_rate} KB/s
              </span>
            </div>
          </div>
        )}

        {/* Temperature */}
        {avgTemp > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-400" />
                <span className="text-xs font-mono text-slate-400">Temp</span>
              </div>
              <span className="text-sm font-mono text-red-400">
                {avgTemp}°C
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
