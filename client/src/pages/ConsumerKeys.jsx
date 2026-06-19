import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { Key, ShieldAlert, CheckCircle, Cpu, Trash2, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';

export default function ConsumerKeys() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancelTarget, setCancelTarget] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const [regenerateTarget, setRegenerateTarget] = useState(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newApiKeyModal, setNewApiKeyModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const addToast = useUIStore((state) => state.addToast);

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

  const handleConfirmRegenerate = async () => {
    if (!regenerateTarget) return;
    setIsRegenerating(true);
    try {
      const res = await apiClient.post(`/subscriptions/${regenerateTarget.id}/regenerate`);
      setNewApiKeyModal({
        apiKey: res.data.apiKey,
        apiName: regenerateTarget.apiName
      });
      addToast('API Key regenerated successfully!', 'success');
      setRegenerateTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!newApiKeyModal?.apiKey) return;
    navigator.clipboard.writeText(newApiKeyModal.apiKey);
    setCopied(true);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };



  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-carbon-border pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">My Subscriptions & Keys</h1>
        <p className="text-gray-450 mt-1 text-xs font-mono">Manage active API gateway subscriptions and instructions for integration.</p>
      </div>
 
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-carbon-900 border border-carbon-border rounded-lg p-6 h-28 animate-pulse"></div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-16 text-center max-w-xl mx-auto">
          <Key className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display uppercase">No Active Subscriptions</h3>
          <p className="text-gray-400 text-xs mt-1 font-mono">Visit the API Marketplace to subscribe to developer services.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const plan = sub.plan;
            const api = plan?.api;
            const statusActive = sub.isActive;
            const isPendingPayment = !statusActive && Number(plan?.price) > 0 && sub.stripeCheckoutUrl;
 
            return (
              <div 
                key={sub.id} 
                className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-electric-cobalt/40 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-11 h-11 bg-carbon-800 border border-carbon-border rounded-lg flex items-center justify-center text-electric-cobalt shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.08)]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display tracking-wide uppercase">{api?.name || 'Unknown API'}</h3>
                    <p className="text-xs text-gray-400 mt-1">Plan: <span className="text-solar-amber font-mono font-bold">{plan?.name}</span> (${plan?.price}/mo)</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-gray-500 font-mono">
                      <span>Rate Limit: {plan?.requestsPerMin} req/min</span>
                      <span>•</span>
                      <span>Subscribed: {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
 
                <div className="flex items-center gap-4 relative z-10">
                  {statusActive ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono font-bold uppercase">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : isPendingPayment ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-solar-amber/10 border border-solar-amber/20 text-solar-amber rounded text-[10px] font-mono font-bold uppercase">
                        <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                        Payment Pending
                      </span>
                      <a
                        href={sub.stripeCheckoutUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-mono font-bold uppercase transition-all duration-200 cursor-pointer"
                      >
                        Complete Payment
                      </a>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[10px] font-mono font-bold uppercase">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Suspended
                    </span>
                  )}
                  {statusActive && (
                    <button
                      onClick={() => setRegenerateTarget({ id: sub.id, apiName: api?.name || 'Unknown API' })}
                      className="flex items-center gap-1 px-2.5 py-1 bg-electric-cobalt/10 hover:bg-electric-cobalt/20 border border-electric-cobalt/20 text-electric-cobalt rounded text-[10px] font-mono font-bold transition-colors duration-200 cursor-pointer uppercase"
                      title="Regenerate API Key"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate Key
                    </button>
                  )}
                  <button
                    onClick={() => setCancelTarget({ id: sub.id, apiName: api?.name || 'Unknown API' })}
                    className="flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded text-[10px] font-mono font-bold transition-colors duration-200 cursor-pointer uppercase"
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
          <div className="bg-carbon-900 border border-carbon-border w-full max-w-md rounded-lg p-6 shadow-2xl relative overflow-hidden transform transition-all duration-300 animate-fadeIn">
            {/* Ambient Red Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wide">Cancel Subscription?</h3>
                <p className="text-gray-405 text-xs font-mono leading-relaxed">
                  Are you sure you want to cancel your subscription to <span className="text-white font-semibold">{cancelTarget.apiName}</span>? 
                  Your API key for this plan will be immediately invalidated and you will lose access.
                </p>
              </div>
            </div>
 
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
                className="px-4 py-2 bg-carbon-950 hover:bg-carbon-800 border border-carbon-border text-gray-300 rounded-lg text-xs font-mono font-bold transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                No, Keep
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold shadow-[0_2px_10px_rgba(225,29,72,0.15)] hover:shadow-[0_2px_15px_rgba(225,29,72,0.3)] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

      {/* Regeneration Confirmation Modal */}
      {regenerateTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-carbon-900 border border-carbon-border w-full max-w-md rounded-lg p-6 shadow-2xl relative overflow-hidden transform transition-all duration-300 animate-fadeIn">
            {/* Ambient Amber Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-solar-amber/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-solar-amber/10 border border-solar-amber/20 text-solar-amber rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white font-display uppercase tracking-wide">Regenerate API Key?</h3>
                <p className="text-gray-405 text-xs font-mono leading-relaxed">
                  Are you sure you want to regenerate your API key for <span className="text-white font-semibold">{regenerateTarget.apiName}</span>? 
                  Your current API key will be immediately invalidated and any clients using it will lose access.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={() => setRegenerateTarget(null)}
                disabled={isRegenerating}
                className="px-4 py-2 bg-carbon-950 hover:bg-carbon-800 border border-carbon-border text-gray-300 rounded-lg text-xs font-mono font-bold transition-colors duration-200 cursor-pointer disabled:opacity-50"
              >
                No, Keep
              </button>
              <button
                onClick={handleConfirmRegenerate}
                disabled={isRegenerating}
                className="px-4 py-2 bg-solar-amber hover:bg-amber-600 text-black rounded-lg text-xs font-mono font-bold shadow-[0_2px_10px_rgba(245,158,11,0.15)] hover:shadow-[0_2px_15px_rgba(245,158,11,0.3)] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isRegenerating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Yes, Regenerate'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* New API Key Modal */}
      {newApiKeyModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-carbon-900 border border-carbon-border rounded-lg p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative z-10">
            <div className="flex items-center gap-3 text-solar-amber mb-4 pb-2 border-b border-carbon-border">
              <AlertTriangle className="w-7 h-7 shrink-0 text-solar-amber animate-pulse" />
              <h2 className="text-base font-bold text-white font-display uppercase tracking-wide">One-Time Secure Key Delivery</h2>
            </div>
            
            <p className="text-xs text-gray-400 mb-6 leading-relaxed font-mono">
              Below is your new API key for <span className="text-white font-semibold">{newApiKeyModal.apiName}</span>. To protect your backend, ApexGateway hashes this key and **will never display it to you again**. Please copy and store it securely now.
            </p>

            <div className="flex items-center gap-2 bg-carbon-950 border border-carbon-border rounded-lg p-3.5 font-mono text-xs text-white mb-6 select-all">
              <span className="flex-1 break-all pr-2 tracking-wide font-semibold text-solar-amber">{newApiKeyModal.apiKey}</span>
              <button
                onClick={copyToClipboard}
                className="shrink-0 p-2 bg-electric-cobalt/10 hover:bg-electric-cobalt/20 border border-electric-cobalt/30 text-electric-cobalt rounded-lg transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-electric-cobalt outline-none"
                aria-label="Copy subscription API key"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={() => setNewApiKeyModal(null)}
              className="w-full bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-3 px-4 rounded-lg text-xs transition-all cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.15)] text-center focus-visible:ring-2 focus-visible:ring-electric-cobalt outline-none uppercase tracking-wider"
            >
              I have saved it, close modal
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

