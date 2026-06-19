import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Plus, Globe, Activity, Users, DollarSign } from 'lucide-react';

export default function ProviderApis() {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchProviderApis = async () => {
      try {
        const res = await apiClient.get('/apis');
        const allApis = res.data.apis || [];
        const providerApis = allApis.filter(api => api.providerId === user?.id);
        setApis(providerApis);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviderApis();
  }, [user]);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-carbon-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">My Published APIs</h1>
          <p className="text-gray-450 mt-1 text-xs font-mono">Manage upstream endpoints, configure subscription plans, and monitor metrics.</p>
        </div>
        <Link
          to="/dashboard/provider/apis/new"
          className="bg-electric-cobalt hover:bg-blue-600 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.15)] shrink-0 uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Publish API</span>
        </Link>
      </div>
 
      {loading ? (
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 h-64 animate-pulse"></div>
      ) : apis.length === 0 ? (
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-16 text-center max-w-xl mx-auto">
          <Globe className="w-12 h-12 text-gray-650 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display uppercase">No APIs Published</h3>
          <p className="text-gray-450 text-xs mt-1 mb-6 font-mono">Get started by registering your first service endpoint.</p>
          <Link
            to="/dashboard/provider/apis/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric-cobalt/10 border border-electric-cobalt/30 hover:border-electric-cobalt/50 text-white font-mono font-bold rounded-lg text-xs tracking-wider uppercase transition-all"
          >
            <span>Register First API</span>
          </Link>
        </div>
      ) : (
        <div className="bg-carbon-900 border border-carbon-border rounded-lg overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-carbon-border bg-carbon-950/40 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">API Name</th>
                  <th className="p-4">Upstream Endpoint</th>
                  <th className="p-4">Plans</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon-border text-xs font-mono">
                {apis.map((api) => (
                  <tr key={api.id} className="hover:bg-carbon-950/40 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-white text-xs group-hover:text-electric-cobalt transition-colors uppercase tracking-wide">{api.name}</td>
                    <td className="p-4 text-gray-405 text-[11px] max-w-xs truncate">{api.upstreamUrl}</td>
                    <td className="p-4 text-electric-cobalt font-bold">{api.plans?.length || 0} configured</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 uppercase tracking-wider">
                        Active
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <Link
                        to={`/dashboard/provider/apis/${api.id}/plans/new`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-electric-cobalt/10 hover:bg-electric-cobalt/20 border border-electric-cobalt/25 text-white rounded text-[9.5px] font-bold transition-all uppercase tracking-wider"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Plans</span>
                      </Link>
                      <Link
                        to={`/dashboard/provider/apis/${api.id}/health`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-solar-amber/10 hover:bg-solar-amber/20 border border-solar-amber/25 text-solar-amber rounded text-[9.5px] font-bold transition-all uppercase tracking-wider"
                      >
                        <Activity className="w-3 h-3" />
                        <span>Health</span>
                      </Link>
                      <Link
                        to={`/dashboard/provider/apis/${api.id}/consumers`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-carbon-800 hover:bg-carbon-750 border border-carbon-border text-gray-300 rounded text-[9.5px] font-bold transition-all uppercase tracking-wider"
                      >
                        <Users className="w-3 h-3" />
                        <span>Consumers</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
