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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">My Published APIs</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage upstream endpoints, configure subscription plans, and monitor metrics.</p>
        </div>
        <Link
          to="/dashboard/provider/apis/new"
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] shrink-0 font-display uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Publish API</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-6 h-64 animate-pulse"></div>
      ) : apis.length === 0 ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-16 text-center max-w-xl mx-auto">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display">No APIs Published</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">Get started by registering your first service endpoint.</p>
          <Link
            to="/dashboard/provider/apis/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500/10 border border-primary-500/30 hover:border-primary-500/50 text-primary-400 font-bold rounded-xl text-xs tracking-wider uppercase transition-all"
          >
            <span>Register First API</span>
          </Link>
        </div>
      ) : (
        <div className="bg-card-dark/40 border border-border-dark rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-dark bg-bg-dark/20 text-[10px] font-bold text-gray-500 uppercase tracking-wider font-display">
                  <th className="p-4 pl-6">API Name</th>
                  <th className="p-4">Upstream Endpoint</th>
                  <th className="p-4">Plans</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark text-xs font-sans">
                {apis.map((api) => (
                  <tr key={api.id} className="hover:bg-white/2 transition-colors group">
                    <td className="p-4 pl-6 font-bold text-white font-display text-sm group-hover:text-primary-400 transition-colors">{api.name}</td>
                    <td className="p-4 text-gray-400 font-mono text-xs max-w-xs truncate">{api.upstreamUrl}</td>
                    <td className="p-4 text-primary-400 font-bold font-display">{api.plans?.length || 0} configured</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wider font-display">
                        Active
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right space-x-2">
                      <Link
                        to={`/dashboard/provider/apis/${api.id}/plans/new`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/20 text-primary-400 rounded-lg text-[10px] font-bold transition-all font-display uppercase tracking-wider"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Plans</span>
                      </Link>
                      <Link
                        to={`/dashboard/provider/apis/${api.id}/health`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold transition-all font-display uppercase tracking-wider"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Health</span>
                      </Link>
                      <Link
                        to={`/dashboard/provider/apis/${api.id}/consumers`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold transition-all font-display uppercase tracking-wider"
                      >
                        <Users className="w-3.5 h-3.5" />
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
