import { useState, useEffect } from 'react';
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
import { BarChart3, Activity, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import apiClient from '../services/api';

export default function ProviderAnalytics() {
  const [data, setData] = useState({
    totalRequests: 0,
    avgLatency: 0,
    rateLimitsHit: 0,
    successRate: 100,
    chartData: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await apiClient.get('/apis/analytics/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics summary:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-carbon-border pb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">Metrics & Analytics</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">Real-time usage analytics and proxy routing performance statistics.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-carbon-900/40 border border-carbon-border rounded-lg p-6 h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-carbon-900/40 border border-carbon-border rounded-lg p-6 h-80 animate-pulse" />
          <div className="bg-carbon-900/40 border border-carbon-border rounded-lg p-6 h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-carbon-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">Metrics & Analytics</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">Real-time usage analytics and proxy routing performance statistics.</p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-electric-cobalt/10 hover:bg-electric-cobalt/20 border border-electric-cobalt/30 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {data.totalRequests === 0 && (
        <div className="bg-solar-amber/10 border border-solar-amber/20 rounded-lg p-6 text-solar-amber flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white font-mono uppercase text-xs">No API requests recorded yet</h4>
            <p className="text-xs text-gray-450 mt-1 font-mono leading-relaxed">
              To populate these charts, invoke your APIs through the Gateway proxy. Send requests to your API route:
            </p>
            <code className="block mt-3 p-3 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-emerald-450 whitespace-pre-wrap">
              curl -H "X-API-Key: &lt;your_api_key&gt;" http://localhost:4000/api/&lt;api_name&gt;/&lt;endpoint&gt;
            </code>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/30 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Total Requests</span>
            <div className="w-8 h-8 rounded-lg bg-electric-cobalt/10 border border-electric-cobalt/20 flex items-center justify-center text-electric-cobalt">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {data.totalRequests.toLocaleString()}
          </div>
          <div className="text-[9px] text-gray-500 mt-2 font-mono relative z-10">
            All-time metrics
          </div>
        </div>

        <div className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/30 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Average Latency</span>
            <div className="w-8 h-8 rounded-lg bg-solar-amber/10 border border-solar-amber/20 flex items-center justify-center text-solar-amber">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {data.avgLatency} ms
          </div>
          <div className="text-[9px] text-gray-500 mt-2 font-mono relative z-10">
            Avg proxy roundtrip
          </div>
        </div>

        <div className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/30 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Rate Limits Hit</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-455">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {data.rateLimitsHit.toLocaleString()}
          </div>
          <div className="text-[9px] text-rose-450 mt-2 font-mono flex items-center gap-1 relative z-10">
            <span>HTTP 429 Status</span>
          </div>
        </div>

        <div className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/30 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {data.successRate}%
          </div>
          <div className="text-[9px] text-gray-500 mt-2 font-mono relative z-10">
            HTTP 2xx & 3xx status
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-electric-cobalt" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Latency Profile (24h)</h3>
          </div>
          <div className="h-80 w-full text-[10px] font-mono">
            {data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="oklch(0.55 0.22 260)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                  <XAxis dataKey="time" stroke="#52525b" tickLine={false} />
                  <YAxis stroke="#52525b" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'oklch(0.11 0.006 250)', border: '1px solid oklch(0.18 0.008 250)', borderRadius: '8px', padding: '10px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ fontFamily: 'JetBrains Mono' }}
                  />
                  <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="oklch(0.55 0.22 260)" fillOpacity={1} fill="url(#colorLatency)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-mono text-xs">
                No latency data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-electric-cobalt" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Requests vs Errors (24h)</h3>
          </div>
          <div className="h-80 w-full text-[10px] font-mono">
            {data.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1917" />
                  <XAxis dataKey="time" stroke="#52525b" tickLine={false} />
                  <YAxis stroke="#52525b" tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'oklch(0.11 0.006 250)', border: '1px solid oklch(0.18 0.008 250)', borderRadius: '8px', padding: '10px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                    itemStyle={{ fontFamily: 'JetBrains Mono' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="requests" name="Total Requests" fill="oklch(0.55 0.22 260)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="errors" name="Rate Limits / Errors" fill="oklch(0.79 0.15 65)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 font-mono text-xs">
                No request data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
