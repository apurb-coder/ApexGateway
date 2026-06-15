import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { ArrowLeft, Plus, DollarSign, Zap, Calendar, Sparkles, X, Pencil, Trash2 } from 'lucide-react';

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

  const handleDelete = async (planId) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this pricing plan? This will immediately cancel all active subscriptions associated with it.'
    );
    if (!confirm) return;

    try {
      await apiClient.delete(`/apis/${apiId}/plans/${planId}`);
      addToast('Pricing plan deleted successfully!', 'success');
      await fetchApiData();
    } catch (err) {
      console.error(err);
    }
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
    if (p === 0) return { label: 'Free', class: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
    if (p < 25) return { label: 'Developer', class: 'bg-sky-500/10 border-sky-500/20 text-sky-400' };
    if (p < 100) return { label: 'Pro', class: 'bg-primary-500/10 border-primary-500/20 text-primary-400 shadow-[0_0_10px_rgba(139,92,246,0.1)]' };
    return { label: 'Enterprise', class: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm font-sans">Loading pricing plans…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-dark pb-6">
        <div>
          <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider font-display cursor-pointer group mb-4">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to My APIs</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">
            Plans for <span className="text-primary-400">{api?.name || 'API'}</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Configure subscription tiers, rate limits, and monthly billing to monetize your API service.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] shrink-0 font-display uppercase tracking-wider self-start md:self-center"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Create Pricing Plan</span>
        </button>
      </div>

      {/* Plans display grid */}
      {!api?.plans || api.plans.length === 0 ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-16 text-center max-w-xl mx-auto backdrop-blur-md relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
          <Sparkles className="w-12 h-12 text-primary-500/80 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display">No Pricing Plans Configured</h3>
          <p className="text-gray-400 text-sm mt-1 mb-6">
            Consumers must subscribe to a pricing plan to obtain keys and query your API. Add one now!
          </p>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500/10 border border-primary-500/30 hover:border-primary-500/50 text-primary-400 font-bold rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer font-display"
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
                className="bg-card-dark/40 border border-border-dark hover:border-primary-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.05)] rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border-dark/60 pb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider font-display ${badge.class}`}>
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
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-1.5 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-all cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white font-display group-hover:text-primary-400 transition-colors">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-2 text-gray-300 text-xs font-sans">
                      <Zap className="w-4 h-4 text-primary-400 shrink-0" />
                      <span>Rate Limit: <strong className="text-white font-mono">{plan.requestsPerMin}</strong> req/min</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-300 text-xs font-sans">
                      <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Price: <strong className="text-white font-mono">${parseFloat(plan.price).toFixed(2)}</strong> / month</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-3 text-[10px] text-gray-500 border-t border-border-dark/30 font-sans">
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
          <div className="bg-card-dark border border-border-dark w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
            
            <div className="relative z-10">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border-dark">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    {editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
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
                  <label htmlFor="plan-name" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Plan Title</label>
                  <input
                    id="plan-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pro Developer Tier"
                    className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none transition-all placeholder:text-gray-600 text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="plan-rpm" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Rate Limit (Requests / Min)</label>
                    <input
                      id="plan-rpm"
                      name="requestsPerMin"
                      type="number"
                      required
                      min={1}
                      value={requestsPerMin}
                      onChange={(e) => setRequestsPerMin(e.target.value)}
                      className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none transition-all text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="plan-price" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Monthly Fee (USD)</label>
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
                        className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 pl-8 pr-4 outline-none transition-all text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-6 border-t border-border-dark flex justify-end gap-3 font-display">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-border-dark hover:bg-white/5 transition-all text-xs font-bold text-gray-400 hover:text-white cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
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
