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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-carbon-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">API Marketplace</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">Discover, subscribe to, and consume premium developer APIs.</p>
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
            className="w-full bg-carbon-900 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 pl-10 pr-4 outline-none transition-all text-xs font-mono placeholder:text-gray-650"
          />
        </div>
      </div>
 
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-carbon-900 border border-carbon-border rounded-lg p-6 h-52 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-carbon-800 rounded w-1/2"></div>
                <div className="h-4 bg-carbon-800 rounded w-3/4"></div>
              </div>
              <div className="h-10 bg-carbon-800 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredApis.length === 0 ? (
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-16 text-center max-w-xl mx-auto">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white font-display">No APIs Found</h3>
          <p className="text-gray-450 text-xs mt-1 font-mono">Try refining your search query or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApis.map((api) => (
            <div 
              key={api.id}
              className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/60 hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] rounded-lg p-6 flex flex-col justify-between transition-all duration-300 group relative overflow-hidden"
            >
              {/* Radial gradient hover effect */}
              <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt shadow-[0_0_12px_rgba(59,130,246,0.08)]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-carbon-950 border border-carbon-border text-gray-400 rounded font-mono">
                    {api.plans?.length || 0} {api.plans?.length === 1 ? 'plan' : 'plans'}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-electric-cobalt transition-colors font-display tracking-wide uppercase">{api.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 min-h-[36px] leading-relaxed font-sans">{api.description || 'No description provided.'}</p>
                </div>
              </div>
 
              <div className="mt-6 relative z-10">
                <button
                  onClick={() => navigate(`/apis/${api.id}`)}
                  className="w-full bg-carbon-950 hover:bg-electric-cobalt border border-carbon-border hover:border-electric-cobalt text-white font-mono font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs tracking-wider uppercase group/btn"
                >
                  <span>Explore API</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
