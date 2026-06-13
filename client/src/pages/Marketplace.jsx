import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { Search, Globe, ChevronRight, Cpu } from 'lucide-react';

export default function Marketplace() {
  const [apis, setApis] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApis = async () => {
      try {
        const res = await apiClient.get('/apis');
        setApis(res.data.apis || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApis();
  }, []);

  const filteredApis = apis.filter((api) => 
    api.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    api.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">API Marketplace</h1>
          <p className="text-gray-400 mt-1 text-sm">Discover, subscribe to, and consume premium developer APIs.</p>
        </div>

        <div className="relative w-full md:w-80">
          <label htmlFor="search-apis-input" className="sr-only">Search APIs</label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
          <input
            id="search-apis-input"
            type="text"
            placeholder="Search APIs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-sm placeholder:text-gray-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card-dark/20 border border-border-dark rounded-2xl p-6 h-52 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-border-dark rounded w-1/2"></div>
                <div className="h-4 bg-border-dark rounded w-3/4"></div>
              </div>
              <div className="h-10 bg-border-dark rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredApis.length === 0 ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-16 text-center max-w-xl mx-auto">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display">No APIs Found</h3>
          <p className="text-gray-400 text-sm mt-1">Try refining your search query or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApis.map((api) => (
            <div 
              key={api.id}
              className="bg-card-dark/40 border border-border-dark hover:border-primary-500/40 hover:shadow-[0_4px_30px_rgba(139,92,246,0.15)] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
            >
              {/* Radial gradient hover effect */}
              <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-bg-dark/80 border border-border-dark text-gray-400 rounded-full font-mono">
                    {api.plans?.length || 0} {api.plans?.length === 1 ? 'plan' : 'plans'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors font-display tracking-wide">{api.name}</h3>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2 min-h-[40px] leading-relaxed">{api.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="mt-6 relative z-10">
                <button
                  onClick={() => navigate(`/apis/${api.id}`)}
                  className="w-full bg-bg-dark hover:bg-primary-500 border border-border-dark hover:border-primary-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm shadow-sm hover:shadow-[0_4px_20px_rgba(139,92,246,0.25)] group/btn"
                >
                  <span>Explore API</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
