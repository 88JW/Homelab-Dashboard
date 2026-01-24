"use client"

import { Activity } from "lucide-react"

export function CosmosMonitoring() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-xl p-5 col-span-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold">System Monitoring</h2>
          <p className="text-xs text-slate-400">Powered by Cosmos</p>
        </div>
      </div>

      <div className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-700/50">
        <iframe
          src="https://192.168.50.234/cosmos-ui/monitoring"
          className="w-full h-full"
          style={{ border: 'none' }}
          title="Cosmos Monitoring"
        />
      </div>
    </div>
  )
}
