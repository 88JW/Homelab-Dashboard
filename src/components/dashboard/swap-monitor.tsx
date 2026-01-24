"use client"

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Activity, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'

interface SwapData {
  total: number
  used: number
  free: number
  percent: number
  sin_rate: number
  sout_rate: number
  sin_total: number
  sout_total: number
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

const formatRate = (bytes: number): string => {
  if (bytes === 0) return '0 B/s'
  const k = 1024
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export default function SwapMonitor() {
  const { data, error } = useSWR<SwapData>('/api/swap', fetcher, {
    refreshInterval: 2000,
  })

  const [sinHistory, setSinHistory] = useState<{ value: number }[]>([])
  const [soutHistory, setSoutHistory] = useState<{ value: number }[]>([])

  useEffect(() => {
    if (data && !error) {
      setSinHistory(prev => [...prev, { value: data.sin_rate || 0 }].slice(-30))
      setSoutHistory(prev => [...prev, { value: data.sout_rate || 0 }].slice(-30))
    }
  }, [data, error])

  const maxValue = Math.max(
    ...sinHistory.map(d => d.value),
    ...soutHistory.map(d => d.value),
    1
  )

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold">Swap Memory</h2>
          <p className="text-xs text-slate-400">
            {data ? `${data.percent.toFixed(1)}% used` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {error ? (
          <div className="text-sm text-red-400">Error loading data</div>
        ) : !data ? (
          <div className="text-sm text-slate-400">Loading...</div>
        ) : (
          <>
            {/* Swap In */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Swap In</span>
                </div>
                <span className="text-sm font-mono text-green-400">
                  {formatRate(data.sin_rate)}
                </span>
              </div>
              <div className="h-12 bg-slate-900/50 rounded-lg overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sinHistory.length > 0 ? sinHistory : Array(30).fill({ value: 0 })}>
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
                Total: {formatBytes(data.sin_total)}
              </div>
            </div>

            {/* Swap Out */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpFromLine className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Swap Out</span>
                </div>
                <span className="text-sm font-mono text-blue-400">
                  {formatRate(data.sout_rate)}
                </span>
              </div>
              <div className="h-12 bg-slate-900/50 rounded-lg overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={soutHistory.length > 0 ? soutHistory : Array(30).fill({ value: 0 })}>
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
                Total: {formatBytes(data.sout_total)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
