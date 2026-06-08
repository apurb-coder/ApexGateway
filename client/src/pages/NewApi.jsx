import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { ArrowLeft } from 'lucide-react';

export default function NewApi() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [upstreamUrl, setUpstreamUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !upstreamUrl) {
      addToast('Name and Upstream URL are required', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/apis', { name, description, upstreamUrl });
      addToast('API published successfully! Let\'s configure pricing plans.', 'success');
      navigate('/dashboard/provider/apis');
    } catch (err) {
      // Handled by Axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link to="/dashboard/provider/apis" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer group mb-4">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My APIs</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white">Register Upstream API</h1>
        <p className="text-gray-400 mt-1">Deploy and route traffic to your microservices via ApexGateway.</p>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">API Service Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                placeholder="weather-service"
                className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none transition-all placeholder:text-gray-600 text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Lowercase alphanumeric, hyphens, and underscores only. This dictates your gateway endpoint prefix.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Upstream Destination URL</label>
            <div className="relative">
              <input
                type="url"
                required
                value={upstreamUrl}
                onChange={(e) => setUpstreamUrl(e.target.value)}
                placeholder="https://api.weather.com"
                className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none transition-all placeholder:text-gray-600 text-sm font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">The destination target servers where gateway proxies requests.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Retrieves live global weather metrics, forecasts, and historical metrics."
              rows={4}
              className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl p-3 outline-none transition-all placeholder:text-gray-600 text-sm"
            />
          </div>

          <div className="pt-4 border-t border-border-dark flex justify-end gap-4">
            <Link
              to="/dashboard/provider/apis"
              className="px-4 py-2.5 rounded-xl border border-border-dark hover:bg-white/5 transition-all text-sm font-semibold text-gray-300 cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? 'Registering...' : 'Register API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
