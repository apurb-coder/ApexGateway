import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../services/api';
import { Key, ShieldAlert, CheckCircle, Cpu, Trash2 } from 'lucide-react';

export default function ConsumerKeys() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await apiClient.delete(`/subscriptions/${cancelTarget.id}`);
      setSubscriptions(prev => prev.filter(sub => sub.id !== cancelTarget.id));
      setCancelTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCancelling(false);
    }
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
                  <button
                    onClick={() => setCancelTarget({ id: sub.id, apiName: api?.name || 'Unknown API' })}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-full text-xs font-semibold transition-colors duration-200 cursor-pointer"
                    title="Cancel Subscription"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-card-dark border border-border-dark w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden transform transition-all duration-300 animate-fadeIn">
            {/* Ambient Red Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white font-display">Cancel Subscription?</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Are you sure you want to cancel your subscription to <span className="text-white font-semibold">{cancelTarget.apiName}</span>? 
                  Your API key for this plan will be immediately invalidated and you will lose access.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
                className="px-4 py-2 bg-card-dark hover:bg-card-dark/80 border border-border-dark text-gray-300 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                No, Keep
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(225,29,72,0.2)] hover:shadow-[0_4px_20px_rgba(225,29,72,0.4)] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
