import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { 
  ArrowLeft, 
  Cpu, 
  BookOpen, 
  Printer, 
  FileText,
  Compass
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function ApiDocs() {
  const { apiId } = useParams();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHeading, setActiveHeading] = useState('');
  
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    const fetchApiDetails = async () => {
      try {
        const res = await apiClient.get(`/apis/${apiId}`);
        setApi(res.data.api);
      } catch (err) {
        console.error(err);
        addToast('Failed to fetch API specifications.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchApiDetails();
  }, [apiId, addToast]);

  // Extract headings for Table of Contents
  const getHeadings = () => {
    if (!api?.exampleDocs) return [];
    
    const lines = api.exampleDocs.split('\n');
    const headings = [];
    
    lines.forEach((line) => {
      // Matches both ## and ### headings
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length; // 2 or 3
        const text = match[2].trim();
        // Generate an anchor-friendly ID
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        headings.push({ level, text, id });
      }
    });
    
    return headings;
  };

  const headings = getHeadings();

  // Highlight active heading on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      // Find the current heading
      let current = '';
      for (let i = 0; i < headings.length; i++) {
        const element = document.getElementById(headings[i].id);
        if (element) {
          const top = element.offsetTop;
          if (scrollPosition >= top) {
            current = headings[i].id;
          }
        }
      }
      
      if (current) {
        setActiveHeading(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading API specifications…</p>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark text-center p-8">
        <h3 className="text-lg font-bold text-white font-display">API Not Found</h3>
        <p className="text-gray-400 mt-2 text-sm">The API you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => window.close()} 
          className="inline-block mt-4 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-xl text-xs transition-colors cursor-pointer"
        >
          Close Tab
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-white selection:bg-primary-500/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-bg-dark/80 backdrop-blur-md border-b border-border-dark px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.close()}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer group focus-visible:ring-1 focus-visible:ring-primary-500 rounded px-1 outline-none"
              aria-label="Close documentation tab"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Close Tab</span>
            </button>
            <div className="w-px h-5 bg-border-dark" />
            <div className="flex items-center gap-2 text-primary-400 font-semibold text-xs tracking-wider uppercase font-mono">
              <Compass className="w-4 h-4" />
              <span>Reference Manual</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-card-dark/60 hover:bg-card-dark border border-border-dark hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-xl text-xs transition-[background-color,border-color] cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 outline-none"
              aria-label="Print documentation"
            >
              <Printer className="w-4 h-4" />
              <span>Print Docs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Intro Hero Section */}
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-14 h-14 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white font-display tracking-wide">{api.name}</h1>
              <p className="text-gray-400 mt-2 max-w-3xl text-sm leading-relaxed">{api.description || 'No description provided.'}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Gateway Prefix:</span>
                  <span className="text-primary-400 font-semibold bg-bg-dark/80 border border-border-dark px-2 py-0.5 rounded" translate="no">
                    /api/{api.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Supported Methods:</span>
                  <div className="flex gap-1.5">
                    {((api.allowedMethods && api.allowedMethods.length > 0) ? api.allowedMethods : ['GET', 'POST', 'PUT', 'DELETE']).map(m => (
                      <span key={m} className="text-primary-400 font-bold bg-primary-500/10 border border-primary-500/20 px-1.5 py-0.5 rounded text-[9px] tracking-wide uppercase" translate="no">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          {/* Table of Contents Sidebar */}
          {headings.length > 0 && (
            <aside className="lg:col-span-1 sticky top-28 hidden lg:block bg-card-dark/20 border border-border-dark/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border-dark/60">
                <FileText className="w-4 h-4 text-primary-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-display">On this page</h3>
              </div>
              
              <nav className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`block text-xs transition-colors rounded px-2 py-1.5 focus-visible:ring-1 focus-visible:ring-primary-500 outline-none ${
                      heading.level === 3 ? 'pl-5 font-sans' : 'font-semibold font-display'
                    } ${
                      activeHeading === heading.id
                        ? 'text-primary-400 bg-primary-500/5 font-semibold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          {/* Markdown Content */}
          <div className={`${headings.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-6`}>
            {api.exampleDocs ? (
              <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-8 md:p-12 backdrop-blur-md">
                <MarkdownRenderer content={api.exampleDocs} />
              </div>
            ) : (
              <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-12 text-center text-gray-500 text-sm">
                No detailed documentation available for this API.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
