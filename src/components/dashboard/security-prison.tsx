"use client"

import { ShieldOff, Unlock, Globe, Clock, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function SecurityPrison() {
  const { data: crowdsecData } = useSWR('/api/crowdsec', fetcher, { refreshInterval: 10000 })
  const bannedIPs = crowdsecData?.decisions || []
  const alerts = crowdsecData?.alerts || []
  const threats = crowdsecData?.threats || { total: 0 }
  const status = crowdsecData?.status || 'unknown'

  const handleUnban = async (ip: string) => {
    console.log('Unban IP:', ip)
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5 min-h-[300px]">
      {!crowdsecData && (
        <div className="flex items-center justify-center h-full py-8">
          <span className="text-slate-500 text-sm">Loading CrowdSec data...</span>
        </div>
      )}
      {crowdsecData && (
        <>
      {/* Header with status */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${status === 'active' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
          {status === 'active' ? (
            <Shield className="h-5 w-5 text-emerald-400" />
          ) : (
            <ShieldOff className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">Security Prison</h3>
          <span className="text-xs text-slate-500">CrowdSec</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-mono ${
          status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {status}
        </span>
      </div>

      {/* Threat Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <div>
            <div className="text-xs text-slate-500">Total Threats</div>
            <div className="text-lg font-bold font-mono text-red-400">{threats.total?.toLocaleString() || 0}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldOff className="h-4 w-4 text-orange-400" />
          <div>
            <div className="text-xs text-slate-500">Banned IPs</div>
            <div className="text-lg font-bold font-mono text-orange-400">{bannedIPs.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Banned IPs List */}
      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
        {bannedIPs.length === 0 && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500">
            <Shield className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-sm">No active bans or recent alerts</span>
          </div>
        )}
        {bannedIPs.length === 0 && alerts.length > 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-slate-500 mb-3">
            <Shield className="h-6 w-6 mb-2 opacity-50" />
            <span className="text-xs">No active bans (decisions expired)</span>
            <span className="text-xs mt-1">Recent alerts: {alerts.length}</span>
          </div>
        )}
        {bannedIPs.map((item: any, index: number) => (
          <div
            key={item.value || index}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/30 hover:border-red-500/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-slate-200 truncate">{item.value || item.ip}</code>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-700/50 text-xs">
                  <Globe className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">{item.origin || item.country || 'N/A'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-red-400/80">{item.scenario || item.reason || 'Blocked'}</span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {item.duration || item.time || '-'}
                </span>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUnban(item.value || item.ip)}
              className="ml-2 h-8 px-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Unlock className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  )
}
