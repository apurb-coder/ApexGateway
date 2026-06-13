import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { BarChart3, Activity, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

const mockRequestData = [
  { time: '10:00', requests: 120, latency: 45, errors: 0 },
  { time: '11:00', requests: 250, latency: 52, errors: 1 },
  { time: '12:00', requests: 480, latency: 70, errors: 4 },
  { time: '13:00', requests: 310, latency: 48, errors: 2 },
  { time: '14:00', requests: 620, latency: 85, errors: 12 },
  { time: '15:00', requests: 950, latency: 120, errors: 35 },
  { time: '16:00', requests: 410, latency: 55, errors: 8 },
];

export default function ProviderAnalytics() {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-border-dark pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Metrics & Analytics</h1>
        <p className="text-gray-400 mt-1 text-sm">Real-time usage analytics and proxy routing performance statistics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Total Requests</span>
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">3,140</div>
          <div className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1 relative z-10">
            <span>+14.2%</span> <span className="text-gray-500">since yesterday</span>
          </div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Average Latency</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">67.8 ms</div>
          <div className="text-[10px] text-emerald-400 mt-2 font-mono flex items-center gap-1 relative z-10">
            <span>-2.4%</span> <span className="text-gray-500">decrease (faster)</span>
          </div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Rate Limits Hit</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">62</div>
          <div className="text-[10px] text-rose-400 mt-2 font-mono flex items-center gap-1 relative z-10">
            <span>+8%</span> <span className="text-gray-500">rise in limit breaches</span>
          </div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300 animate-pulse-subtle">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">98.3%</div>
          <div className="text-[10px] text-gray-500 mt-2 font-mono relative z-10">Within SLA agreement</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-bold text-white font-display tracking-wide">Latency Profile (ms)</h3>
          </div>
          <div className="h-80 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRequestData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                <XAxis dataKey="time" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(0.12 0.015 250)', border: '1px solid oklch(0.24 0.02 250)', borderRadius: '12px', padding: '10px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="oklch(0.55 0.18 270)" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-bold text-white font-display tracking-wide">Requests vs 429 Rate Limits</h3>
          </div>
          <div className="h-80 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRequestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                <XAxis dataKey="time" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'oklch(0.12 0.015 250)', border: '1px solid oklch(0.24 0.02 250)', borderRadius: '12px', padding: '10px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="requests" name="Total Requests" fill="oklch(0.55 0.18 270)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="errors" name="Rate Limits Hit" fill="oklch(0.62 0.18 25)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
