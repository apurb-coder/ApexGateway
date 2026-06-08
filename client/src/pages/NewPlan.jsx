import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { ArrowLeft } from 'lucide-react';

export default function NewPlan() {
  const { apiId } = useParams();
  const [api, setApi] = useState(null);
  const [name, setName] = useState('');
  const [requestsPerMin, setRequestsPerMin] = useState(60);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    const fetchApiName = async () => {
      try {
        const res = await apiClient.get(`/apis/${apiId}`);
        setApi(res.data.api);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApiName();
  }, [apiId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || requestsPerMin === undefined || price === undefined) {
      addToast('Please fill all required plan parameters', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/apis/${apiId}/plans`, {
        name,
        requestsPerMin: parseInt(requestsPerMin),
        price: parseFloat(price)
      });
      addToast('Pricing plan added successfully!', 'success');
      navigate('/dashboard/provider/apis');
    } catch (err) {
      // Interceptor toasts error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl animate-fadeIn">
      <div>
        <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider font-display cursor-pointer group mb-4">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My APIs</span>
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Create Pricing Plan</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Set up rate limit thresholds and subscription tiers for API <span className="text-primary-400 font-semibold">{api?.name || ''}</span>.
        </p>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Plan Title</label>
            <input
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Rate Limit (Requests / Min)</label>
              <input
                type="number"
                required
                min={1}
                value={requestsPerMin}
                onChange={(e) => setRequestsPerMin(e.target.value)}
                className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none transition-all text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Monthly Fee (USD)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">$</span>
                <input
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

          <div className="pt-6 border-t border-border-dark flex justify-end gap-4 font-display">
            <Link
              to="/dashboard/provider/apis"
              className="px-4 py-2.5 rounded-xl border border-border-dark hover:bg-white/5 transition-all text-xs font-bold text-gray-400 hover:text-white cursor-pointer uppercase tracking-wider"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {loading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
