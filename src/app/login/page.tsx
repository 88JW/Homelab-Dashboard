'use client';
import Link from 'next/link';
import { Card, Title, Text, Button } from "@tremor/react";
import { ShieldAlert, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
            <ShieldAlert className="text-blue-500" size={48} />
          </div>
        </div>
        
        <Card className="bg-zinc-900/50 border-zinc-800 ring-0 shadow-2xl p-8">
          <Title className="text-white text-center font-black tracking-tighter text-2xl mb-2 italic">
            HOMELAB DASHBOARD
          </Title>
          <Text className="text-zinc-600 text-center text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            Lenovo Cluster • Secure Access
          </Text>

          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-lg text-sm text-center">
              Dostep jest obslugiwany przez centralne SSO przed aplikacja.
            </div>

            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Link href="/">
                <Lock size={18} />
                Przejdz do panelu
              </Link>
            </Button>
          </div>

          <div className="mt-8 p-4 bg-zinc-800/30 border border-zinc-800 rounded-lg">
            <Text className="text-zinc-500 text-xs text-center">
              Protected Access
              <br />
              Lenovo Cluster Dashboard
            </Text>
          </div>
        </Card>
      </div>
    </main>
  );
}
