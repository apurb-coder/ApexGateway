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
        <p className="text-gray-400 text-sm">Loading health metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer group mb-4">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My APIs</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Service Health Dashboard</h1>
        <p className="text-gray-400 mt-1">Real-time status, latency metrics, and availability logs for <span className="text-primary-400 font-semibold">{api?.name}</span>.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Operational Status</span>
            <Heart className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span>OPERATIONAL</span>
          </div>
          <div className="text-xs text-gray-500 mt-2 font-mono">Status check: 10s ago</div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Uptime (24h)</span>
            <Activity className="w-5 h-5 text-primary-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">99.98%</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">SLA requirement satisfied</div>
        </div>

        <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Ping</span>
            <Cpu className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-4">56 ms</div>
          <div className="text-xs text-gray-400 mt-2 font-medium">Measured at regional edge</div>
        </div>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6">Latency Profile (24h)</h3>
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockLatencyData}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.55 0.18 270)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="timestamp" stroke="#666" />
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
    </div>
  );
}
