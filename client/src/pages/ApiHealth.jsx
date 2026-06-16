import { useState, useEffect } from 'react';
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

const statusConfig = {
  OPERATIONAL: {
    colorClass: 'text-emerald-400',
    dotClass: 'bg-emerald-400',
    borderHover: 'hover:border-emerald-500/30',
    radialGradient: 'from-emerald-500/5',
    text: 'OPERATIONAL'
  },
  DEGRADED: {
    colorClass: 'text-amber-500',
    dotClass: 'bg-amber-500',
    borderHover: 'hover:border-amber-500/30',
    radialGradient: 'from-amber-500/5',
    text: 'DEGRADED'
  },
  DOWN: {
    colorClass: 'text-rose-500',
    dotClass: 'bg-rose-500',
    borderHover: 'hover:border-rose-500/30',
    radialGradient: 'from-rose-500/5',
    text: 'DOWN'
  },
  INACTIVE: {
    colorClass: 'text-gray-450',
    dotClass: 'bg-gray-450',
    borderHover: 'hover:border-gray-500/30',
    radialGradient: 'from-gray-500/5',
    text: 'INACTIVE'
  }
};

export default function ApiHealth() {
  const { apiId } = useParams();
  const [api, setApi] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiDetailsAndHealth = async () => {
      try {
        const [apiRes, healthRes] = await Promise.all([
          apiClient.get(`/apis/${apiId}`),
          apiClient.get(`/apis/${apiId}/health`)
        ]);
        setApi(apiRes.data.api);
        setHealth(healthRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiDetailsAndHealth();
  }, [apiId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="w-10 h-10 border-4 border-electric-cobalt border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs font-mono">Loading health metrics…</p>
      </div>
    );
  }

  const status = health?.status || 'OPERATIONAL';
  const config = statusConfig[status] || statusConfig.OPERATIONAL;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer group mb-4">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My APIs</span>
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">// Service Health</h1>
        <p className="text-gray-400 mt-1 text-xs font-mono">Real-time status, latency metrics, and availability logs for <span className="text-solar-amber font-bold">{api?.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`bg-carbon-900 border border-carbon-border ${config.borderHover} rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300`}>
          <div className={`absolute inset-0 bg-radial-gradient ${config.radialGradient} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
          <div className="flex items-center justify-between text-gray-450 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">Operational Status</span>
            <div className={`w-8 h-8 rounded-lg bg-current/10 border border-current/20 flex items-center justify-center ${config.colorClass}`}>
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg font-black ${config.colorClass} mt-4 flex items-center gap-2 relative z-10 font-mono tracking-widest uppercase`}>
            {status === 'OPERATIONAL' && <span className={`w-2.5 h-2.5 ${config.dotClass} rounded-full animate-ping`}></span>}
            {status !== 'OPERATIONAL' && <span className={`w-2.5 h-2.5 ${config.dotClass} rounded-full`}></span>}
            <span>{config.text}</span>
          </div>
          <div className="text-[9px] text-gray-500 mt-2 font-mono relative z-10">Status check: 15m window</div>
        </div>

        <div className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/30 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Uptime (24h)</span>
            <div className="w-8 h-8 rounded-lg bg-electric-cobalt/10 border border-electric-cobalt/20 flex items-center justify-center text-electric-cobalt">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {health ? `${health.uptime.toFixed(2)}%` : '100.00%'}
          </div>
          <div className="text-[9px] text-emerald-450 mt-2 font-mono relative z-10">SLA requirement satisfied</div>
        </div>

        <div className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/30 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Average Ping</span>
            <div className="w-8 h-8 rounded-lg bg-solar-amber/10 border border-solar-amber/20 flex items-center justify-center text-solar-amber">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {health ? `${health.avgLatency} ms` : '0 ms'}
          </div>
          <div className="text-[9px] text-gray-550 mt-2 font-mono relative z-10">Measured at regional edge</div>
        </div>
      </div>

      <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md">
        <h3 className="text-sm font-mono font-bold text-white mb-6 uppercase tracking-wider">// Latency Profile (24h)</h3>
        <div className="h-80 w-full text-[10px] font-mono">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={health?.latencyHistory || []}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
              <XAxis dataKey="timestamp" stroke="#52525b" tickLine={false} />
              <YAxis stroke="#52525b" tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'oklch(0.11 0.006 250)', border: '1px solid oklch(0.18 0.008 250)', borderRadius: '8px', padding: '10px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                itemStyle={{ fontFamily: 'JetBrains Mono' }}
              />
              <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="oklch(0.55 0.22 260)" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
