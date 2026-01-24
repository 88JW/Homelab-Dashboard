"use client"

import { Wifi, ArrowDown, ArrowUp } from "lucide-react"
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts"
import useSWR from 'swr'
import { useState, useEffect } from 'react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function NetworkMonitor() {
  const { data } = useSWR('/api/network', fetcher, { refreshInterval: 2000 })
  const [rxHistory, setRxHistory] = useState<{value: number}[]>([])
  const [txHistory, setTxHistory] = useState<{value: number}[]>([])

  useEffect(() => {
    if (data && !data.error) {
      setRxHistory(prev => [...prev, { value: data.rx_rate || 0 }].slice(-30))
      setTxHistory(prev => [...prev, { value: data.tx_rate || 0 }].slice(-30))
    }
  }, [data])

  const maxValue = Math.max(
    ...rxHistory.map(d => d.value),
    ...txHistory.map(d => d.value),
    1
  )

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
          <Wifi className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold">Network Monitor</h2>
          <p className="text-xs text-slate-400">{data?.interface || 'enp2s0'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Download */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">Download</span>
            </div>
            <span className="text-sm font-mono text-green-400">
              {data?.rx_rate ? formatBytes(data.rx_rate) : '0 B/s'}
            </span>
          </div>
          <div className="h-12 bg-slate-900/50 rounded-lg overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rxHistory.length > 0 ? rxHistory : Array(30).fill({ value: 0 })}>
                <YAxis domain={[0, maxValue]} hide />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total: {data?.rx_total ? formatBytes(data.rx_total).replace('/s', '') : '0 B'}
          </div>
        </div>

        {/* Upload */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">Upload</span>
            </div>
            <span className="text-sm font-mono text-blue-400">
              {data?.tx_rate ? formatBytes(data.tx_rate) : '0 B/s'}
            </span>
          </div>
          <div className="h-12 bg-slate-900/50 rounded-lg overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={txHistory.length > 0 ? txHistory : Array(30).fill({ value: 0 })}>
                <YAxis domain={[0, maxValue]} hide />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total: {data?.tx_total ? formatBytes(data.tx_total).replace('/s', '') : '0 B'}
          </div>
        </div>
      </div>
    </div>
  )
}
