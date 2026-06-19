import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { ArrowLeft, Plus, DollarSign, Zap, Calendar, Sparkles, X, Pencil } from 'lucide-react';

export default function NewPlan() {
  const { apiId } = useParams();
  const [api, setApi] = useState(null);
  const [name, setName] = useState('');
  const [requestsPerMin, setRequestsPerMin] = useState(60);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const addToast = useUIStore((state) => state.addToast);

  const fetchApiData = async () => {
    try {
      const res = await apiClient.get(`/apis/${apiId}`);
      setApi(res.data.api);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch API details', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, [apiId]);

  const handleCreateClick = () => {
    setEditingPlan(null);
    setName('');
    setRequestsPerMin(60);
    setPrice(0);
    setShowModal(true);
  };

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setRequestsPerMin(plan.requestsPerMin);
    setPrice(parseFloat(plan.price));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || requestsPerMin === undefined || price === undefined) {
      addToast('Please fill all required plan parameters', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingPlan) {
        await apiClient.put(`/apis/${apiId}/plans/${editingPlan.id}`, {
          name,
          requestsPerMin: parseInt(requestsPerMin),
          price: parseFloat(price)
        });
        addToast('Pricing plan updated successfully!', 'success');
      } else {
        await apiClient.post(`/apis/${apiId}/plans`, {
          name,
          requestsPerMin: parseInt(requestsPerMin),
          price: parseFloat(price)
        });
        addToast('Pricing plan added successfully!', 'success');
      }
      setName('');
      setRequestsPerMin(60);
      setPrice(0);
      setEditingPlan(null);
      setShowModal(false);
      await fetchApiData();
    } catch {
      // Interceptor toasts error
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (priceVal) => {
    const p = parseFloat(priceVal);
    if (p === 0) return { label: 'Free', class: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450' };
    if (p < 25) return { label: 'Developer', class: 'bg-sky-500/10 border-sky-500/20 text-sky-450' };
    if (p < 100) return { label: 'Pro', class: 'bg-electric-cobalt/10 border-electric-cobalt/20 text-electric-cobalt shadow-[0_0_10px_rgba(59,130,246,0.1)]' };
    return { label: 'Enterprise', class: 'bg-solar-amber/10 border-solar-amber/20 text-solar-amber' };
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-electric-cobalt border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs font-mono">Loading pricing plans…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-carbon-border pb-6">
        <div>
          <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-mono font-bold uppercase tracking-wider cursor-pointer group mb-4">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to My APIs</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">
            Plans for <span className="text-solar-amber">{api?.name || 'API'}</span>
          </h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">
            Configure subscription tiers, rate limits, and monthly billing to monetize your API service.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-2.5 px-5 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.15)] shrink-0 uppercase tracking-wider self-start md:self-center"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create Pricing Plan</span>
        </button>
      </div>

      {/* Plans display grid */}
      {!api?.plans || api.plans.length === 0 ? (
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-16 text-center max-w-xl mx-auto backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-100 pointer-events-none" />
          <Sparkles className="w-12 h-12 text-electric-cobalt mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display uppercase">No Pricing Plans Configured</h3>
          <p className="text-gray-450 text-xs mt-1 mb-6 font-mono">
            Consumers must subscribe to a pricing plan to obtain keys and query your API. Add one now!
          </p>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-electric-cobalt/10 border border-electric-cobalt/35 hover:border-electric-cobalt/50 text-electric-cobalt font-mono font-bold rounded-lg text-xs tracking-wider uppercase transition-all cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Create First Plan</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {api.plans.map((plan) => {
            const badge = getTierBadge(plan.price);
            return (
              <div 
                key={plan.id}
                className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.05)] rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-carbon-border/60 pb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[9px] font-mono font-bold border uppercase tracking-wider ${badge.class}`}>
                      {badge.label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(plan)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                        title="Edit Plan"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-display uppercase tracking-wide group-hover:text-electric-cobalt transition-colors">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2 text-gray-300 text-xs font-sans">
                      <Zap className="w-4 h-4 text-electric-cobalt shrink-0" />
                      <span className="font-mono text-xs text-gray-400">Rate Limit: <strong className="text-white">{plan.requestsPerMin}</strong> req/min</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-xs font-sans">
                      <DollarSign className="w-4 h-4 text-emerald-450 shrink-0" />
                      <span className="font-mono text-xs text-gray-400">Price: <strong className="text-white">${parseFloat(plan.price).toFixed(2)}</strong> / month</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-3 text-[9px] text-gray-500 border-t border-carbon-border/30 font-mono uppercase">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation/Edit Modal Form */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-carbon-900 border border-carbon-border w-full max-w-lg rounded-lg overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-100 pointer-events-none" />
            
            <div className="relative z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-carbon-border">
                <div>
                  <h3 className="text-base font-bold text-white font-display uppercase">
                    {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
                  </h3>
                  <p className="text-gray-400 text-[10px] mt-0.5 font-mono">
                    {editingPlan ? 'Modify plan settings and rate limit thresholds.' : 'Define a rate limit threshold and price for your plan.'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="plan-name" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Plan Title</label>
                  <input
                    id="plan-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pro Developer Tier"
                    className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 px-4 outline-none transition-all placeholder:text-gray-655 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="plan-rpm" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Rate Limit (Requests / Min)</label>
                    <input
                      id="plan-rpm"
                      name="requestsPerMin"
                      type="number"
                      required
                      min={1}
                      value={requestsPerMin}
                      onChange={(e) => setRequestsPerMin(e.target.value)}
                      className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 px-4 outline-none transition-all text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="plan-price" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Monthly Fee (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">$</span>
                      <input
                        id="plan-price"
                        name="price"
                        type="number"
                        required
                        min={0}
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 pl-8 pr-4 outline-none transition-all text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-6 border-t border-carbon-border flex justify-end gap-3 font-mono">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-lg border border-carbon-border hover:bg-white/5 transition-all text-xs font-bold text-gray-400 hover:text-white cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
                  >
                    {loading ? 'Saving…' : (editingPlan ? 'Save Changes' : 'Create Plan')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
