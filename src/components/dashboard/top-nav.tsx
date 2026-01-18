"use client"

import { useState } from "react"
import { Shield, AlertTriangle, LogOut, User } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarInitial } from "@/components/ui/avatar"
import Image from "next/image"

export function TopNav() {
  const [underAttack, setUnderAttack] = useState(false)
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-500/20 bg-[#0f172a]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="relative w-32 h-32">
            <Image 
              src="/logoMIaSoftware.png" 
              alt="Logo" 
              width={128} 
              height={128}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-cyan-50 tracking-tight">miasoftware.pl</span>
          </div>
        </div>

        {/* User & Panic Button */}
        <div className="flex items-center gap-4">
          
          {/* User Info */}
          {session?.user && (
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-50">
                  {session.user.name || session.user.email || 'User'}
                </span>
              </div>
              <Button
                variant="ghost" 
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <div
            className={`flex items-center gap-4 px-4 py-2 rounded-lg border transition-all duration-300 ${
              underAttack
                ? "bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                : "bg-slate-800/50 border-slate-700/50"
            }`}
          >
            <div className="flex items-center gap-2">
              {underAttack ? (
                <AlertTriangle className="h-5 w-5 text-red-400 animate-pulse" />
              ) : (
                <Shield className="h-5 w-5 text-slate-400" />
              )}
              <span className={`text-sm font-semibold tracking-wide ${underAttack ? "text-red-400" : "text-slate-400"}`}>
                UNDER ATTACK MODE
              </span>
            </div>
            <Switch checked={underAttack} onCheckedChange={setUnderAttack} className="data-[state=checked]:bg-red-500" />
          </div>
        </div>
      </div>
    </header>
  )
}
