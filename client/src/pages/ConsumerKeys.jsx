import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Key, ShieldAlert, CheckCircle, Cpu, Copy, Check } from 'lucide-react';

export default function ConsumerKeys() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const gatewayUrl = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:4000';

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

  const handleCopyCommand = () => {
    const codeText = `curl -X GET \\\n  ${gatewayUrl}/api/{api_name}/some-path \\\n  -H "X-API-Key: YOUR_API_KEY"`;
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-border-dark pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">My Subscriptions & Keys</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage active API gateway subscriptions and instructions for integration.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-card-dark/20 border border-border-dark rounded-2xl p-6 h-28 animate-pulse"></div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-16 text-center max-w-xl mx-auto">
          <Key className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display">No Active Subscriptions</h3>
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
                className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-500/30 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display tracking-wide">{api?.name || 'Unknown API'}</h3>
                    <p className="text-sm text-gray-400 mt-1">Plan: <span className="text-white font-semibold">{plan?.name}</span> (${plan?.price}/mo)</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 font-mono">
                      <span>Rate Limit: {plan?.requestsPerMin} req/min</span>
                      <span>•</span>
                      <span>Subscribed: {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
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
        <h2 className="text-lg font-bold text-white font-display">Integration Blueprint</h2>
        <p className="text-xs text-gray-400">
          Incorporate the X-API-Key header in HTTP requests targeting the gateway to authorize operations.
        </p>
        
        <div className="relative group">
          <div className="bg-bg-dark/80 border border-border-dark rounded-xl p-5 font-mono text-xs text-gray-300 space-y-2 leading-relaxed">
            <div><span className="text-primary-400">curl</span> -X GET \</div>
            <div>  {gatewayUrl}/api/<span className="text-emerald-400 font-semibold">{"{api_name}"}</span>/some-path \</div>
            <div>  -H <span className="text-amber-400">"X-API-Key: YOUR_API_KEY"</span></div>
          </div>
          
          <button 
            onClick={handleCopyCommand}
            className="absolute top-3.5 right-3.5 p-2 bg-card-dark border border-border-dark hover:border-primary-500 text-gray-400 hover:text-white rounded-lg transition-all cursor-pointer shadow-md"
            title="Copy command to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
