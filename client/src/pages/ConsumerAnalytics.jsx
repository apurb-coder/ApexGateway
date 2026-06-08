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
  { time: '16:00', stroke: 'green', requests: 410, latency: 55, errors: 8 },
];

export default function ConsumerAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Metrics & Analytics</h1>
        <p className="text-gray-400 mt-1">Real-time usage analytics and proxy routing performance statistics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Requests</span>
            <Activity className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">3,140</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">+14.2% since yesterday</div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Latency</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">67.8 ms</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">-2.4% decrease (faster)</div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rate Limits Hit</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">62</div>
          <div className="text-xs text-rose-400 mt-2 font-medium">+8% rise in limit breaches</div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Success Rate</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">98.3%</div>
          <div className="text-xs text-gray-400 mt-2 font-medium">Within SLA agreement</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-bold text-white">Latency Profile (ms)</h3>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRequestData}>
                <defs>
                  <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'oklch(0.16 0.016 252)', border: '1px solid oklch(0.22 0.018 254)' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="oklch(0.55 0.18 270)" fillOpacity={1} fill="url(#colorLatency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-bold text-white">Requests vs 429 Rate Limits</h3>
          </div>
          <div className="h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRequestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'oklch(0.16 0.016 252)', border: '1px solid oklch(0.22 0.018 254)' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="requests" name="Total Requests" fill="oklch(0.55 0.18 270)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" name="Rate Limits Hit" fill="oklch(0.62 0.18 25)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
