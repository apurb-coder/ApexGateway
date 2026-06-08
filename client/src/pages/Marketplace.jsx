import React, { useState, useEffect } from 'react';
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">API Marketplace</h1>
          <p className="text-gray-400 mt-1">Discover, subscribe to, and consume premium developer APIs.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card-dark/40 border border-border-dark focus:border-primary-500 text-white rounded-xl py-2 pl-9 pr-4 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-card-dark/20 border border-border-dark rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-6 bg-border-dark rounded w-1/2"></div>
                <div className="h-4 bg-border-dark rounded w-3/4"></div>
              </div>
              <div className="h-10 bg-border-dark rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredApis.length === 0 ? (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-12 text-center">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white">No APIs Found</h3>
          <p className="text-gray-400 text-sm mt-1">Try refining your search query or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApis.map((api) => (
            <div 
              key={api.id}
              className="bg-card-dark/40 border border-border-dark hover:border-primary-500/50 hover:shadow-[0_4px_30px_rgba(139,92,246,0.1)] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-border-dark text-gray-400 rounded-full">
                    {api.plans?.length || 0} plans
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{api.name}</h3>
                  <p className="text-sm text-gray-400 mt-2 line-clamp-2 min-h-[40px]">{api.description || 'No description provided.'}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate(`/marketplace/${api.id}`)}
                  className="w-full bg-border-dark hover:bg-primary-500 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  <span>Explore API</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
