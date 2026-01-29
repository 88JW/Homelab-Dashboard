"use client"

import { ShieldOff, Unlock, Globe, Clock, Shield, AlertTriangle, Activity, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function SecurityPrison() {
  const { data: securityData } = useSWR('/api/security/status', fetcher, { refreshInterval: 30000 })
  const { data: crowdsecData } = useSWR('/api/crowdsec', fetcher, { refreshInterval: 10000 })
  const { data: fail2banData } = useSWR('/api/fail2ban', fetcher, { refreshInterval: 10000 })
  const { data: activityData } = useSWR('/api/security/activity', fetcher, { refreshInterval: 30000 })
  
  const security = securityData?.security || []
  const activeCount = securityData?.activeCount || 0
  const totalCount = securityData?.totalCount || 4
  const overallStatus = securityData?.status || 'unknown'
  
  const bannedIPs = fail2banData?.decisions || []
  const recentAlerts = fail2banData?.recentAlerts || []
  const totalBanned = fail2banData?.totalBanned || 0
  const totalAlerts = fail2banData?.totalAlerts || 0
  
  const ufwBlocks = activityData?.ufw?.totalBlocks || 0
  const ufwUniqueIPs = activityData?.ufw?.uniqueIPs || 0
  const totalEvents = activityData?.summary?.totalEvents || 0

  const handleUnban = async (ip: string) => {
    console.log('Unban IP:', ip)
  }

  const statusColors = {
    protected: 'bg-emerald-500/20 text-emerald-400',
    partial: 'bg-yellow-500/20 text-yellow-400',
    vulnerable: 'bg-red-500/20 text-red-400',
    unknown: 'bg-slate-500/20 text-slate-400'
  }

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5 min-h-[300px]">
      {!securityData && (
        <div className="flex items-center justify-center h-full py-8">
          <span className="text-slate-500 text-sm">Loading security data...</span>
        </div>
      )}
      {securityData && (
        <>
      {/* Header with overall status */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${overallStatus === 'protected' ? 'bg-emerald-500/20' : overallStatus === 'partial' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
          {overallStatus === 'protected' ? (
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          ) : (
            <ShieldOff className="h-5 w-5 text-orange-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-mono font-semibold text-slate-300 tracking-wider uppercase">Security System</h3>
          <span className="text-xs text-slate-500">{activeCount}/{totalCount} systems active</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-mono ${statusColors[overallStatus as keyof typeof statusColors]}`}>
          {overallStatus}
        </span>
      </div>

      {/* Security Systems Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {security.map((system: any) => (
          <div key={system.name} className={`p-3 rounded-xl border ${
            system.active 
              ? 'bg-emerald-900/10 border-emerald-700/30' 
              : 'bg-slate-900/50 border-slate-700/30'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {system.active ? (
                <Shield className="h-4 w-4 text-emerald-400" />
              ) : (
                <ShieldOff className="h-4 w-4 text-slate-500" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-mono font-semibold ${
                  system.active ? 'text-emerald-300' : 'text-slate-400'
                }`}>
                  {system.name}
                </div>
                <div className="text-xs text-slate-500 truncate">{system.details}</div>
              </div>
              <div className={`h-2 w-2 rounded-full ${
                system.active ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-slate-600'
              }`} />
            </div>
          </div>
        ))}
      </div>

      {/* Threat Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <ShieldOff className="h-4 w-4 text-orange-400" />
            <div className="text-xs text-slate-500">Banned IPs</div>
          </div>
          <div className="text-lg font-bold font-mono text-orange-400">{totalBanned}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <div className="text-xs text-slate-500">Alerts</div>
          </div>
          <div className="text-lg font-bold font-mono text-yellow-400">{totalAlerts}</div>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-blue-400" />
            <div className="text-xs text-slate-500">UFW Blocks</div>
          </div>
          <div className="text-lg font-bold font-mono text-blue-400">{ufwBlocks}</div>
        </div>
      </div>

      {/* Banned IPs & Alerts List */}
      <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
        {bannedIPs.length === 0 && recentAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-slate-500">
            <Shield className="h-6 w-6 mb-2 opacity-50" />
            <span className="text-sm">All clear - No threats detected</span>
          </div>
        )}
        
        {/* Banned IPs */}
        {bannedIPs.map((item: any, index: number) => (
          <div
            key={`banned-${item.ip}-${index}`}
            className="flex items-center justify-between p-2 rounded-xl bg-red-900/20 border border-red-700/30 hover:border-red-500/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-red-300 truncate">{item.ip}</code>
                <span className="text-xs text-red-400/80 truncate">{item.reason}</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUnban(item.ip)}
              className="ml-2 h-7 px-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Unlock className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {/* Recent Alerts */}
        {bannedIPs.length === 0 && recentAlerts.slice(0, 3).map((alert: any, index: number) => (
          <div
            key={`alert-${index}`}
            className="flex items-center gap-2 p-2 rounded-xl bg-yellow-900/10 border border-yellow-700/20 hover:border-yellow-500/30 transition-colors"
          >
            <AlertTriangle className="h-3 w-3 text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <code className="text-xs font-mono text-yellow-300 truncate block">{alert.source}</code>
              <div className="text-xs text-slate-500 truncate">{alert.scenario}</div>
            </div>
            {alert.events_count > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-xs text-yellow-400">
                ×{alert.events_count}
              </span>
            )}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  )
}
