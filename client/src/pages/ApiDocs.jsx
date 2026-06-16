import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { 
  ArrowLeft, 
  Cpu, 
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-carbon-950 gap-4">
        <div className="w-10 h-10 border-4 border-electric-cobalt border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs font-mono">Loading API specifications…</p>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-carbon-950 text-center p-8">
        <h3 className="text-lg font-bold text-white font-display uppercase">// API Not Found</h3>
        <p className="text-gray-405 mt-2 text-xs font-mono">The API you are looking for does not exist or has been removed.</p>
        <button 
          onClick={() => window.close()} 
          className="inline-block mt-4 bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-2 px-6 rounded-lg text-xs transition-colors cursor-pointer"
        >
          Close Tab
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-950 text-white selection:bg-electric-cobalt/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-carbon-950/80 backdrop-blur-md border-b border-carbon-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.close()}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs cursor-pointer group focus-visible:ring-1 focus-visible:ring-electric-cobalt rounded px-1 outline-none font-mono uppercase"
              aria-label="Close documentation tab"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Close Tab</span>
            </button>
            <div className="w-px h-5 bg-carbon-border" />
            <div className="flex items-center gap-2 text-electric-cobalt font-semibold text-xs tracking-wider uppercase font-mono">
              <Compass className="w-4 h-4" />
              <span>Reference Manual</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-carbon-900 hover:bg-carbon-950 border border-carbon-border text-gray-300 hover:text-white font-mono py-2 px-4 rounded-lg text-xs transition-[background-color,border-color] cursor-pointer focus-visible:ring-2 focus-visible:ring-electric-cobalt outline-none uppercase"
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
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-100 pointer-events-none" />
          <div className="flex items-start gap-5 relative z-10">
            <div className="w-14 h-14 bg-electric-cobalt/10 border border-electric-cobalt/20 rounded-lg flex items-center justify-center text-electric-cobalt shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-display uppercase tracking-wide">{api.name}</h1>
              <p className="text-gray-400 mt-2 max-w-3xl text-xs font-mono leading-relaxed">{api.description || 'No description provided.'}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[10px] font-mono uppercase">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Gateway Prefix:</span>
                  <span className="text-solar-amber font-semibold bg-carbon-950 border border-carbon-border px-2 py-0.5 rounded" translate="no">
                    /api/{api.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Supported Methods:</span>
                  <div className="flex gap-1.5">
                    {((api.allowedMethods && api.allowedMethods.length > 0) ? api.allowedMethods : ['GET', 'POST', 'PUT', 'DELETE']).map(m => (
                      <span key={m} className="text-electric-cobalt font-bold bg-electric-cobalt/10 border border-electric-cobalt/20 px-1.5 py-0.5 rounded text-[9px] tracking-wide uppercase" translate="no">
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
            <aside className="lg:col-span-1 sticky top-28 hidden lg:block bg-carbon-900 border border-carbon-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-carbon-border">
                <FileText className="w-4 h-4 text-electric-cobalt" />
                <h3 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">// On this page</h3>
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
                    className={`block text-xs transition-colors rounded px-2 py-1.5 focus-visible:ring-1 focus-visible:ring-electric-cobalt outline-none font-mono ${
                      heading.level === 3 ? 'pl-5 font-mono text-gray-500 text-[10px]' : 'font-semibold font-mono text-[11px] uppercase'
                    } ${
                      activeHeading === heading.id
                        ? 'text-electric-cobalt bg-electric-cobalt/5 font-semibold border-l border-electric-cobalt pl-2'
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
              <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 md:p-12 backdrop-blur-md">
                <MarkdownRenderer content={api.exampleDocs} />
              </div>
            ) : (
              <div className="bg-carbon-900 border border-carbon-border rounded-lg p-12 text-center text-gray-550 text-xs font-mono">
                No detailed documentation available for this API.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
