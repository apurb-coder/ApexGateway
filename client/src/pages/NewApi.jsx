import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { ArrowLeft } from 'lucide-react';

export default function NewApi() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [upstreamUrl, setUpstreamUrl] = useState('');
  const [allowedMethods, setAllowedMethods] = useState(['GET', 'POST', 'PUT', 'DELETE']);
  const [exampleDocs, setExampleDocs] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  const toggleMethod = (method) => {
    if (allowedMethods.includes(method)) {
      if (allowedMethods.length === 1) {
        addToast('At least one HTTP method must be allowed', 'warning');
        return;
      }
      setAllowedMethods(allowedMethods.filter(m => m !== method));
    } else {
      setAllowedMethods([...allowedMethods, method]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !upstreamUrl) {
      addToast('Name and Upstream URL are required', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/apis', { 
        name, 
        description, 
        upstreamUrl, 
        allowedMethods, 
        exampleDocs 
      });
      addToast('API published successfully! Let\'s configure pricing plans.', 'success');
      navigate('/dashboard/provider/apis');
    } catch {
      // Handled by Axios interceptor
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
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Register Upstream API</h1>
        <p className="text-gray-400 mt-1 text-sm">Deploy and route traffic to your microservices via ApexGateway.</p>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label htmlFor="api-name" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">API Service Name</label>
            <div className="relative">
              <input
                id="api-name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                placeholder="weather-service"
                className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none transition-all placeholder:text-gray-600 text-xs font-mono"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Lowercase alphanumeric, hyphens, and underscores only. This dictates your gateway endpoint prefix.</p>
          </div>

          <div>
            <label htmlFor="api-upstream-url" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Upstream Destination URL</label>
            <div className="relative">
              <input
                id="api-upstream-url"
                name="upstreamUrl"
                type="url"
                required
                value={upstreamUrl}
                onChange={(e) => setUpstreamUrl(e.target.value)}
                placeholder="https://api.weather.com"
                className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none transition-all placeholder:text-gray-600 text-xs font-mono"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2">The destination target servers where gateway proxies requests.</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Allowed HTTP Methods</label>
            <div className="flex flex-wrap gap-3">
              {['GET', 'POST', 'PUT', 'DELETE'].map((method) => {
                const isSelected = allowedMethods.includes(method);
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => toggleMethod(method)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                      isSelected 
                        ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_10px_rgba(139,92,246,0.15)]' 
                        : 'bg-bg-dark/40 border-border-dark text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Specify which HTTP methods consumers are allowed to invoke on this endpoint.</p>
          </div>

          <div>
            <label htmlFor="api-description" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Description</label>
            <textarea
              id="api-description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Retrieves live global weather metrics, forecasts, and historical metrics."
              rows={4}
              className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl p-3 outline-none transition-all placeholder:text-gray-600 text-xs font-sans"
            />
          </div>

          <div>
            <label htmlFor="api-example-docs" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Example Documentation / Invocation Guide</label>
            <textarea
              id="api-example-docs"
              name="exampleDocs"
              value={exampleDocs}
              onChange={(e) => setExampleDocs(e.target.value)}
              placeholder={`### Usage Example\n\n**Headers:**\n\`\`\`http\nX-API-Key: apx_live_...\nContent-Type: application/json\n\`\`\`\n\n**Query Parameters:**\n- \`city\` (string, required): e.g. London\n- \`days\` (integer, optional): default 1\n\n**Request Body:**\n\`\`\`json\n{\n  "units": "metric"\n}\n\`\`\``}
              rows={6}
              className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl p-3.5 outline-none transition-all placeholder:text-gray-600 text-xs font-mono"
            />
            <p className="text-[10px] text-gray-500 mt-2">Markdown formatting is supported. Provide headers, body schemas, or query parameter specifications.</p>
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
              {loading ? 'Registering…' : 'Register API'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
