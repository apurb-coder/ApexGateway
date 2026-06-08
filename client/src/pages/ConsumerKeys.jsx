import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Key, ShieldAlert, CheckCircle, Cpu } from 'lucide-react';

export default function ConsumerKeys() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await apiClient.get('/subscriptions');
        setSubscriptions(res.data.subscriptions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">My Subscriptions & Keys</h1>
        <p className="text-gray-400 mt-1">Manage active API gateway subscriptions and instructions for integration.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-card-dark/20 border border-border-dark rounded-2xl p-6 h-28 animate-pulse"></div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-12 text-center">
          <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No Active Subscriptions</h3>
          <p className="text-gray-400 text-sm mt-1">Visit the API Marketplace to subscribe to developer services.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const plan = sub.plan;
            const api = plan?.api;
            const statusActive = sub.isActive;

            return (
              <div 
                key={sub.id} 
                className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-500/20 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-400 shrink-0">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{api?.name || 'Unknown API'}</h3>
                    <p className="text-sm text-gray-400 mt-1">Plan: <span className="text-white font-semibold">{plan?.name}</span> (${plan?.price}/mo)</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 font-mono">
                      <span>Rate Limit: {plan?.requestsPerMin} req/min</span>
                      <span>•</span>
                      <span>Subscribed: {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {statusActive ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-xs font-semibold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h2 className="text-lg font-bold text-white">How to connect</h2>
        <p className="text-sm text-gray-400">
          Incorporate the X-API-Key header in HTTP requests targeting the gateway to authorize operations.
        </p>
        <div className="bg-bg-dark/60 border border-border-dark rounded-xl p-4 font-mono text-xs text-gray-300 space-y-2">
          <div><span className="text-primary-400">curl</span> -X GET \</div>
          <div>  http://localhost:4000/api/<span className="text-emerald-400 font-semibold">{"{api_name}"}</span>/some-path \</div>
          <div>  -H <span className="text-amber-400">"X-API-Key: YOUR_API_KEY"</span></div>
        </div>
      </div>
    </div>
  );
}
