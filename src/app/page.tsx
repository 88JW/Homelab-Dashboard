'use client';
import { useState, useEffect } from 'react';
import { Card, Text, Metric, ProgressBar, Grid, AreaChart, Title, Badge, Table, TableRow, TableCell, TableBody, Flex } from "@tremor/react";
import { LayoutDashboard, Clock, ShieldAlert, ShieldCheck, Activity, Container, Shield, LogOut } from "lucide-react";
import { useSession, signOut } from 'next-auth/react';
import useSWR from 'swr';
import AppGrid from '@/components/AppGrid';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function App() {
  const { data: session } = useSession();
  const { data } = useSWR('/api/stats', fetcher, { refreshInterval: 2000 });
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (data && !data.error) {
      setHistory(prev => [...prev, {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        "CPU": data.cpu,
        "RAM": data.mem
      }].slice(-20));
    }
  }, [data]);

  if (!data) return <div className="p-12 text-zinc-500 text-center animate-pulse font-mono text-xs uppercase tracking-[0.5em]">System Encrypted • Handshaking...</div>;

  return (
    <main className="p-4 md:p-8 bg-zinc-950 min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-zinc-900 pb-8">
          <div>
            <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter italic uppercase">
              <LayoutDashboard className="text-blue-600" size={36} /> 
              Cosmos <span className="text-zinc-500">Dash</span>
            </h1>
            <Text className="text-zinc-600 uppercase text-[10px] tracking-[0.5em] mt-2 font-black font-mono">
              SECURE NODE • {data.hostname}
            </Text>
          </div>
          <div className="flex items-center gap-4">
            {session?.user && (
              <div className="flex items-center gap-3 bg-emerald-500/10 px-5 py-3 rounded-2xl border border-emerald-500/20">
                <ShieldCheck size={16} className="text-emerald-500" />
                <div className="flex flex-col">
                  <Text className="font-mono text-xs text-emerald-400 font-bold">{session.user.name}</Text>
                  <Text className="font-mono text-[9px] text-zinc-600">{session.user.email}</Text>
                </div>
                <button 
                  onClick={() => signOut()} 
                  className="ml-2 p-1 hover:bg-zinc-800 rounded transition-colors"
                  title="Sign out"
                >
                  <LogOut size={14} className="text-zinc-500 hover:text-red-500" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 bg-zinc-900/50 px-5 py-3 rounded-2xl border border-zinc-800 shadow-2xl">
              <Clock size={16} className="text-blue-500" /> 
              <Text className="font-mono text-xs text-blue-400 font-bold tracking-widest uppercase">{data.uptime}</Text>
            </div>
          </div>
        </div>

        {/* Quick Access Apps */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-blue-500" size={20} />
            <h2 className="text-xl font-black uppercase tracking-tight text-zinc-300">SSO Applications</h2>
          </div>
          <AppGrid />
        </div>

        {/* Top Grid: Core Metrics */}
        <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mb-10">
          <Card className="bg-zinc-900/40 border-zinc-800 ring-0">
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Processor</Text>
            <Metric className="text-white font-mono">{data.cpu}%</Metric>
            <ProgressBar value={data.cpu} color="blue" className="mt-4" />
          </Card>
          
          <Card className="bg-zinc-900/40 border-zinc-800 ring-0">
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Memory</Text>
            <Metric className="text-white font-mono">{data.mem}%</Metric>
            <ProgressBar value={data.mem} color="emerald" className="mt-4" />
          </Card>

          <Card className="bg-zinc-900/40 border-zinc-800 ring-0 border-t-2 border-t-red-900/30">
            <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Threat Level</Text>
            <Flex className="mt-1">
              <Metric className="text-white font-mono italic">{data.security?.threatLevel}</Metric>
              <Badge color={data.security?.threatLevel === 'LOW' ? 'emerald' : 'red'} icon={ShieldCheck}>
                {data.security?.threatLevel === 'LOW' ? 'SAFE' : 'THREAT'}
              </Badge>
            </Flex>
            <Text className="text-[10px] text-zinc-600 mt-4 font-bold uppercase tracking-tighter">
               {data.security?.failedLogins} Unauthorized attempts
            </Text>
          </Card>
        </Grid>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <Card className="lg:col-span-2 bg-zinc-900/40 border-zinc-800 ring-0">
            <Title className="text-zinc-300 text-xs font-black uppercase mb-6 tracking-widest">Real-time Performance</Title>
            <AreaChart
              className="h-72 mt-4"
              data={history}
              index="time"
              categories={["CPU", "RAM"]}
              colors={["blue", "emerald"]}
              showLegend={false}
              showGridLines={false}
              curveType="monotone"
            />
          </Card>

          {/* Dedicated Container List */}
          <Card className="bg-zinc-900/40 border-zinc-800 ring-0 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
              <Container className="text-blue-500" size={18} />
              <Title className="text-zinc-300 text-xs font-black uppercase tracking-widest">Active Services</Title>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
              <Table>
                <TableBody>
                  {data.containers?.map((c: any) => (
                    <TableRow key={c.name} className="border-zinc-800/30 hover:bg-zinc-800/10 transition-all">
                      <TableCell className="py-3 px-0">
                        <Text className="text-zinc-100 font-bold text-xs truncate max-w-[140px] leading-tight">{c.name}</Text>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[9px] text-zinc-600 font-mono uppercase">{c.cpu}% CPU</span>
                          <span className="text-[9px] text-zinc-600 font-mono uppercase">{c.memory}MB</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right px-0">
                        <Badge 
                          color={c.status.toLowerCase().includes('run') || c.status.toLowerCase().includes('up') ? "emerald" : "zinc"} 
                          size="xs" 
                          className="px-2 py-0.5 text-[8px] font-black uppercase"
                        >
                          {c.status.toLowerCase().includes('run') || c.status.toLowerCase().includes('up') ? "LIVE" : "OFF"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-zinc-600 text-xs py-4">
                        No containers data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Security Log Section */}
          <Card className="lg:col-span-3 bg-zinc-900/40 border-zinc-800 ring-0 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-red-500" size={20} />
                <Title className="text-zinc-300 text-xs font-black uppercase tracking-widest">Security Event Log</Title>
              </div>
              <Activity className="text-zinc-800 animate-pulse" size={16} />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                <Text className="text-[10px] font-black text-red-500 uppercase mb-2 tracking-widest">Brute-force Monitor</Text>
                <Text className="text-zinc-400 text-xs italic">
                  {data.security?.failedLogins > 0 
                    ? `Wykryto ${data.security?.failedLogins} nieudanych prób autoryzacji z zewnątrz.` 
                    : "Nie wykryto anomalii w procesie logowania."}
                </Text>
              </div>
              <div className="p-4 bg-zinc-800/20 border border-zinc-800/30 rounded-xl">
                <Text className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">System Integrity</Text>
                <Text className="text-zinc-400 text-xs">Wszystkie usługi Cosmos Cloud pracują pod kontrolą proxy z aktywnym szyfrowaniem TLS 1.3.</Text>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </main>
  );
}