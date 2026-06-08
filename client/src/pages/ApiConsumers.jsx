import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { ArrowLeft, Users, Mail, Clock, CheckCircle } from 'lucide-react';

export default function ApiConsumers() {
  const { apiId } = useParams();
  const [api, setApi] = useState(null);
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiAndSubscriptions = async () => {
      try {
        const [apiRes, subRes] = await Promise.all([
          apiClient.get(`/apis/${apiId}`),
          apiClient.get('/subscriptions')
        ]);
        setApi(apiRes.data.api);
        
        const allSubs = subRes.data.subscriptions || [];
        const filteredSubs = allSubs.filter(sub => sub.plan?.apiId === apiId);
        setConsumers(filteredSubs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiAndSubscriptions();
  }, [apiId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading consumer list...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer group mb-4">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My APIs</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Consumers & Tiers</h1>
        <p className="text-gray-400 mt-1">Manage developers subscribed to API <span className="text-primary-400 font-semibold">{api?.name}</span>.</p>
      </div>

      {consumers.length === 0 ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No active subscriptions</h3>
          <p className="text-gray-400 text-sm mt-1">Consumers will appear here once they subscribe to a plan.</p>
        </div>
      ) : (
        <div className="bg-card-dark/40 border border-border-dark rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-dark bg-bg-dark/20 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="p-4 pl-6">Consumer Email</th>
                  <th className="p-4">Subscribed Plan</th>
                  <th className="p-4">Rate Limit</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark text-sm">
                {consumers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{sub.consumer?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 font-medium">{sub.plan?.name}</td>
                    <td className="p-4 text-gray-400 font-mono text-xs">{sub.plan?.requestsPerMin} req/min</td>
                    <td className="p-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                      </span>
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
