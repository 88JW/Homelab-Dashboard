'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Title, Text, Button } from "@tremor/react";
import { ShieldAlert, Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Błędne hasło');
      }
    } catch (err) {
      setError('Błąd połączenia');
    } finally {
      setLoading(false);
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wprowadź hasło"
                className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Lock size={18} />
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </form>

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
