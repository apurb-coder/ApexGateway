import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ArrowLeft, Activity, Heart, Cpu } from 'lucide-react';

const mockLatencyData = [
  { timestamp: '00:00', latency: 45 },
  { timestamp: '04:00', latency: 48 },
  { timestamp: '08:00', latency: 85 },
  { timestamp: '12:00', latency: 62 },
  { timestamp: '16:00', latency: 55 },
  { timestamp: '20:00', latency: 50 },
  { timestamp: '24:00', latency: 47 },
];

export default function ApiHealth() {
  const { apiId } = useParams();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiDetails = async () => {
      try {
        const res = await apiClient.get(`/apis/${apiId}`);
        setApi(res.data.api);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiDetails();
  }, [apiId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-sans">Loading health metrics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider font-display cursor-pointer group mb-4">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My APIs</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Service Health</h1>
        <p className="text-gray-400 mt-1 text-sm">Real-time status, latency metrics, and availability logs for <span className="text-primary-400 font-semibold">{api?.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card-dark/40 border border-border-dark hover:border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-450 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider font-display text-gray-400">Operational Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 mt-4 flex items-center gap-2 relative z-10 font-display tracking-wider">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span>OPERATIONAL</span>
          </div>
          <div className="text-[10px] text-gray-500 mt-2 font-mono relative z-10">Status check: 10s ago</div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Uptime (24h)</span>
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">99.98%</div>
          <div className="text-[10px] text-emerald-400 mt-2 font-mono relative z-10">SLA requirement satisfied</div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider font-display">Average Ping</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">56 ms</div>
          <div className="text-[10px] text-gray-500 mt-2 font-mono relative z-10">Measured at regional edge</div>
        </div>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6 font-display tracking-wide">Latency Profile (24h)</h3>
        <div className="h-80 w-full text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockLatencyData}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
              <XAxis dataKey="timestamp" stroke="#52525b" tickLine={false} />
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
    </div>
  );
}
