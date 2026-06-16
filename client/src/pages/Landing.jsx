import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Zap, 
  Key, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  Terminal, 
  Play, 
  Menu, 
  X, 
  ChevronDown, 
  Layers, 
  Cpu, 
  RefreshCw,
  Activity,
  Database,
  Server,
  Lock,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, user } = useAuthStore();

  // State for Mobile Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for Interactive Gateway Console
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /weather');
  const [customKey, setCustomKey] = useState('apx_live_f1e582d921b74a38c92a');
  const [tokens, setTokens] = useState(5);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestPulseState, setRequestPulseState] = useState('idle'); // 'idle' | 'sending' | 'success' | 'rate_limited' | 'unauthorized'
  const [consoleLogs, setConsoleLogs] = useState([
    {
      timestamp: new Date().toLocaleTimeString(),
      method: 'SYSTEM',
      path: 'Token bucket initialized. Capacity: 5. Refill: 1 token / 2s.',
      status: 100,
      latency: 0,
      response: 'Ready for requests.'
    }
  ]);
  const [faqOpen, setFaqOpen] = useState(null);

  // Token Bucket Refill Effect (Simulates Redis Token Bucket Limiter)
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) => {
        if (prev < 5) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTestRequest = () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setRequestPulseState('sending');

    const endpointPaths = {
      'GET /weather': { path: '/api/weather', status: 200, res: { temp: '21°C', condition: 'Sunny', wind: '12km/h' } },
      'POST /checkout': { path: '/api/checkout', status: 201, res: { success: true, txn_id: 'txn_98311a2f', amount: 49.99 } },
      'GET /users': { path: '/api/users', status: 200, res: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] }
    };

    const endpoint = endpointPaths[selectedEndpoint];

    setTimeout(() => {
      let logEntry = {
        timestamp: new Date().toLocaleTimeString(),
        method: selectedEndpoint.split(' ')[0],
        path: endpoint.path,
        latency: Math.floor(Math.random() * 12) + 4 // 4ms - 16ms proxy speed
      };

      let finalState = 'success';

      if (!customKey || customKey.trim() === '') {
        logEntry.status = 401;
        logEntry.response = { error: 'Unauthorized. API Key is missing.' };
        finalState = 'unauthorized';
      } else if (tokens <= 0) {
        logEntry.status = 429;
        logEntry.response = { error: 'Too Many Requests. Rate limit exceeded. Token bucket empty.' };
        finalState = 'rate_limited';
      } else {
        setTokens((prev) => prev - 1);
        logEntry.status = endpoint.status;
        logEntry.response = endpoint.res;
        finalState = 'success';
      }

      setConsoleLogs((prev) => [logEntry, ...prev.slice(0, 5)]); // Shorter log slice to fit visual grid
      setIsRequesting(false);
      setRequestPulseState(finalState);

      // Reset request pulse state after a delay
      setTimeout(() => {
        setRequestPulseState('idle');
      }, 1800);
    }, 700); // 700ms simulation time
  };

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-gray-200 selection:bg-electric-cobalt/30 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-carbon-900/80 backdrop-blur-md border-b border-carbon-border/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icons.png" alt="ApexGateway Logo" className="w-9 h-9 object-contain" />
            <span className="font-display font-black text-white text-xl tracking-wider uppercase">APEX GATEWAY</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-xs font-mono font-bold tracking-wider relative py-1.5 group uppercase">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-electric-cobalt transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#playground" className="text-gray-400 hover:text-white transition-colors text-xs font-mono font-bold tracking-wider relative py-1.5 group uppercase">
              Playground
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-electric-cobalt transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-xs font-mono font-bold tracking-wider relative py-1.5 group uppercase">
              FAQs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-electric-cobalt transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'PROVIDER' ? '/dashboard/provider/apis' : '/marketplace'}
                className="bg-electric-cobalt hover:bg-blue-600 text-white font-mono font-bold py-2.5 px-5 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 border border-electric-cobalt hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)] flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-white font-mono font-bold text-xs tracking-wider uppercase transition-colors px-3 py-2">
                  Log In
                </Link>
                <Link 
                  to="/signup"
                  className="bg-electric-cobalt hover:bg-blue-600 text-white font-mono font-bold py-2.5 px-5 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 border border-electric-cobalt hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)] cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg cursor-pointer transition-colors hover:bg-carbon-800 border border-transparent hover:border-carbon-border"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-carbon-900 border-b border-carbon-border px-6 py-4 space-y-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white transition-colors py-2 text-xs font-mono font-bold tracking-wider uppercase">Features</a>
            <a href="#playground" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white transition-colors py-2 text-xs font-mono font-bold tracking-wider uppercase">Playground</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white transition-colors py-2 text-xs font-mono font-bold tracking-wider uppercase">FAQs</a>
            <hr className="border-carbon-border" />
            <div className="flex flex-col gap-3 pt-2">
              {isAuthenticated ? (
                <Link 
                  to={user?.role === 'PROVIDER' ? '/dashboard/provider/apis' : '/marketplace'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-electric-cobalt text-center hover:bg-blue-600 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase transition-all border border-electric-cobalt hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)] flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-gray-400 hover:text-white font-mono font-bold py-2 text-xs tracking-wider uppercase"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-electric-cobalt text-center hover:bg-blue-600 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider uppercase transition-all border border-electric-cobalt hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 overflow-hidden">
        {/* Drafting/Architectural Guide Lines */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid-mask opacity-30 pointer-events-none"></div>
        <div className="absolute left-[8%] top-0 bottom-0 w-px bg-carbon-border/40 border-dashed pointer-events-none hidden lg:block"></div>
        <div className="absolute right-[8%] top-0 bottom-0 w-px bg-carbon-border/40 border-dashed pointer-events-none hidden lg:block"></div>

        {/* Ambient Solaris Carbon Color Blobs */}
        <div className="absolute top-[20%] left-[10%] w-[380px] h-[380px] bg-electric-cobalt/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[420px] h-[420px] bg-solar-amber/5 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Humanly Designed Copywriting & Branding */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">
              
              {/* Technical Indicator Badge */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-carbon-900 border border-carbon-border text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-electric-cobalt">PROX_ENG: ONLINE</span>
                <span className="text-carbon-700">//</span>
                <span>REF_PX-8000</span>
              </div>

              {/* Bold Title without AI Gradients */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-white leading-[1.05] uppercase">
                Zero-Trust <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-solar-amber to-amber-300">
                  API Routing
                </span> <br />
                For Developers.
              </h1>

              {/* Refined Technical Description */}
              <p className="mt-6 text-sm md:text-base text-gray-400 font-normal leading-relaxed max-w-md">
                ApexGateway intercepts upstream APIs with a high-concurrency Redis token bucket proxy, serving cryptographically secure consumer credentials and unified monetization.
              </p>

              {/* Dynamic Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                <Link 
                  to={isAuthenticated ? (user?.role === 'PROVIDER' ? '/dashboard/provider/apis' : '/marketplace') : '/signup'}
                  className="bg-electric-cobalt hover:bg-blue-600 text-white font-mono font-bold py-3.5 px-6 rounded-lg text-xs tracking-wider uppercase transition-all duration-200 border border-electric-cobalt hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  Create Gateway
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a 
                  href="#playground-direct" 
                  className="bg-carbon-900 hover:bg-carbon-805 text-gray-300 hover:text-white font-mono font-bold py-3.5 px-6 rounded-lg text-xs tracking-wider uppercase border border-carbon-border hover:border-carbon-border-glow transition-all duration-200 text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  Test Core Router
                </a>
              </div>

              {/* Fine Print / Features List */}
              <div className="mt-12 pt-8 border-t border-carbon-border/40 w-full grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">// ROUTING</div>
                  <div className="text-white font-mono font-semibold text-xs mt-1">&lt; 12ms Proxy Latency</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">// SECURE</div>
                  <div className="text-white font-mono font-semibold text-xs mt-1">SHA-256 One-Time Keys</div>
                </div>
                <div className="mt-2">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">// CACHING</div>
                  <div className="text-white font-mono font-semibold text-xs mt-1">In-Memory Redis Buckets</div>
                </div>
                <div className="mt-2">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">// MONETIZE</div>
                  <div className="text-white font-mono font-semibold text-xs mt-1">Custom Tier Formulator</div>
                </div>
              </div>

            </div>

            {/* Right Column: Custom Interactive Pipeline Console */}
            <div id="playground-direct" className="lg:col-span-7 w-full">
              <div className="bg-carbon-900 border border-carbon-border rounded-xl p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                
                {/* Console Header */}
                <div className="flex items-center justify-between border-b border-carbon-border/60 pb-3 mb-5 text-[10px] font-mono text-gray-500 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-solar-amber opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-solar-amber"></span>
                    </span>
                    <span className="text-gray-300">APEX ROUTER CONSOLE // NODE_01</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>HOST: 4000</span>
                    <span className="text-electric-cobalt font-black">LIVE STREAM</span>
                  </div>
                </div>

                {/* The Pipeline Visualization Diagram */}
                <div className="relative border border-carbon-border/50 bg-carbon-950/80 rounded-xl p-6 mb-5 flex items-center justify-between gap-2 overflow-hidden min-h-[160px]">
                  
                  {/* Pipeline guide paths */}
                  <div className="absolute inset-x-12 top-[60px] h-0.5 border-t border-dashed border-carbon-border/70 pointer-events-none"></div>

                  {/* SVG overlay for request animation pulse */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                    {requestPulseState === 'sending' && (
                      <div className="absolute top-[58px] left-[15%] w-3 h-3 rounded-full bg-electric-cobalt shadow-[0_0_12px_var(--color-electric-cobalt)] transition-all duration-750 ease-out" style={{ left: '50%', transform: 'translateX(-50%)' }}></div>
                    )}
                    {requestPulseState === 'success' && (
                      <div className="absolute top-[58px] left-[50%] w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] transition-all duration-500 ease-out animate-ping" style={{ left: '85%', transform: 'translateX(-50%)' }}></div>
                    )}
                    {(requestPulseState === 'rate_limited' || requestPulseState === 'unauthorized') && (
                      <div className="absolute top-[58px] left-[50%] w-3.5 h-3.5 rounded-full bg-rose-500 shadow-[0_0_12px_#ef4444] transition-all duration-300 ease-in animate-bounce" style={{ left: '20%', transform: 'translateX(-50%)' }}></div>
                    )}
                  </div>

                  {/* Node 1: Client Card */}
                  <div className="z-10 flex flex-col items-center gap-2 w-20">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                      requestPulseState === 'sending' 
                        ? 'bg-electric-cobalt/10 border-electric-cobalt text-electric-cobalt shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                        : 'bg-carbon-900 border-carbon-border text-gray-500'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">Client</span>
                  </div>

                  {/* Node 2: The Gateway Token Bucket Engine */}
                  <div className="z-10 flex flex-col items-center gap-2">
                    <div className={`py-2 px-3 rounded-lg flex flex-col items-center justify-center border transition-all duration-300 min-w-[120px] ${
                      requestPulseState === 'sending'
                        ? 'bg-carbon-900 border-electric-cobalt/60 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                        : requestPulseState === 'success'
                        ? 'bg-carbon-900 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : requestPulseState === 'rate_limited'
                        ? 'bg-carbon-900 border-solar-amber/70 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-shake'
                        : requestPulseState === 'unauthorized'
                        ? 'bg-carbon-900 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)] animate-shake'
                        : 'bg-carbon-900 border-carbon-border'
                    }`}>
                      {/* Visual LEDs representing token bucket */}
                      <div className="flex gap-1.5 mb-2.5">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1.5 h-3.5 rounded-sm transition-all duration-300 ${
                              i < tokens 
                                ? requestPulseState === 'rate_limited'
                                  ? 'bg-solar-amber shadow-[0_0_8px_var(--color-solar-amber)]'
                                  : 'bg-electric-cobalt shadow-[0_0_8px_var(--color-electric-cobalt)]'
                                : 'bg-carbon-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[8px] font-mono font-bold tracking-widest text-center">
                        {requestPulseState === 'sending' ? (
                          <span className="text-electric-cobalt animate-pulse">AUTH VERIFY...</span>
                        ) : requestPulseState === 'rate_limited' ? (
                          <span className="text-solar-amber">429 LIMIT_EXCEED</span>
                        ) : requestPulseState === 'unauthorized' ? (
                          <span className="text-rose-400">401 INVALID_KEY</span>
                        ) : requestPulseState === 'success' ? (
                          <span className="text-emerald-400">STATUS: 200 PASSED</span>
                        ) : (
                          <span className="text-gray-500">APEX GATEWAY</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">Proxy Core</span>
                  </div>

                  {/* Node 3: Upstream Target */}
                  <div className="z-10 flex flex-col items-center gap-2 w-20">
                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                      requestPulseState === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : 'bg-carbon-900 border-carbon-border text-gray-500'
                    }`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">Upstream</span>
                  </div>

                </div>

                {/* Console Configuration Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Endpoint Select Card */}
                  <div className="bg-carbon-950/40 p-4 border border-carbon-border/50 rounded-lg">
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-2">// Select Route Target</label>
                    <div className="flex flex-col gap-2">
                      {['GET /weather', 'POST /checkout', 'GET /users'].map((ep) => (
                        <button
                          key={ep}
                          onClick={() => setSelectedEndpoint(ep)}
                          className={`py-2 px-3 text-[10px] font-mono rounded text-left transition-all cursor-pointer font-semibold ${
                            selectedEndpoint === ep
                              ? 'bg-electric-cobalt/10 border border-electric-cobalt text-electric-cobalt font-bold'
                              : 'text-gray-400 border border-carbon-border hover:text-gray-200 bg-carbon-950/20'
                          }`}
                        >
                          {ep}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* API Key Header Input */}
                  <div className="bg-carbon-950/40 p-4 border border-carbon-border/50 rounded-lg flex flex-col justify-between">
                    <div>
                      <label className="block text-[9px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-2">// Inject Credentials</label>
                      <div className="bg-carbon-950 border border-carbon-border rounded p-2.5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-gray-500">Header:</span>
                          <span className="text-gray-300 font-bold">X-API-Key</span>
                        </div>
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={customKey}
                            onChange={(e) => setCustomKey(e.target.value)}
                            className="font-mono text-solar-amber bg-transparent border-t border-carbon-border/40 outline-none focus:border-solar-amber/40 text-left w-full text-[11px] pt-1.5 transition-colors"
                            placeholder="apx_live_..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Token refill metadata */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 mt-3 pt-2 border-t border-carbon-border/40">
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: '6s' }} />
                        Refills +1 every 2s
                      </span>
                      <span>Capacity: {tokens}/5</span>
                    </div>
                  </div>
                </div>

                {/* Large Trigger Button */}
                <button
                  onClick={handleTestRequest}
                  disabled={isRequesting}
                  className="w-full bg-electric-cobalt hover:bg-blue-600 disabled:opacity-50 text-white font-mono font-bold py-3 px-4 rounded text-xs tracking-wider uppercase border border-electric-cobalt hover:border-blue-500 transition-all duration-205 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.15)] mb-5"
                >
                  <Play className={`w-3.5 h-3.5 fill-white ${isRequesting ? 'animate-ping' : ''}`} />
                  {isRequesting ? 'FORWARDING PACKET...' : 'Execute Proxy Call'}
                </button>

                {/* Log Terminal */}
                <div className="bg-carbon-950 border border-carbon-border rounded-lg overflow-hidden flex flex-col">
                  {/* Tab Title */}
                  <div className="bg-carbon-900 border-b border-carbon-border/50 px-4 py-2 flex items-center justify-between text-[9px] font-mono text-gray-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-solar-amber" />
                      LOG FEED // STDOUT
                    </span>
                    <span className="text-[8px] text-carbon-700">PORT_4000</span>
                  </div>

                  {/* Console Logs */}
                  <div className="p-3 font-mono text-[10px] overflow-y-auto space-y-2 max-h-[140px] min-h-[120px] scrollbar-thin">
                    {consoleLogs.map((log, index) => (
                      <div 
                        key={index}
                        className={`p-2.5 rounded border transition-all duration-300 animate-fadeIn ${
                          log.status === 200 || log.status === 201
                            ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400/90'
                            : log.status === 429
                            ? 'bg-amber-950/10 border-solar-amber/20 text-solar-amber/90'
                            : log.status === 401
                            ? 'bg-rose-950/10 border-rose-500/20 text-rose-400/90'
                            : 'bg-carbon-900/40 border-carbon-border text-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1 text-[9px] font-bold opacity-90">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-black/40 px-1 py-0.2 rounded text-[8px] text-gray-300">
                              {log.method}
                            </span>
                            <span>{log.path}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <span>{log.latency}ms</span>
                            <span>{log.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[8px] pt-1 border-t border-carbon-border/30">
                          <span className="font-bold">STATUS: {log.status === 100 ? 'READY' : log.status}</span>
                          <span className="opacity-95 truncate max-w-[70%] font-semibold text-gray-300">
                            {typeof log.response === 'object' ? JSON.stringify(log.response) : log.response}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technical Architecture Flow Section */}
      <section className="py-20 border-y border-carbon-border bg-carbon-950/30 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-mono font-bold tracking-widest text-electric-cobalt uppercase">// PIPELINE STAGES</span>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight mt-2">
              The Proxy Architecture Lifecycle
            </h2>
            <p className="mt-4 text-xs md:text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              How the reverse proxy intercepts and handles high-throughput requests using sub-millisecond lookups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-carbon-900/40 border border-carbon-border p-6 rounded-lg relative overflow-hidden">
              <div className="text-solar-amber font-mono font-black text-2xl mb-4">01</div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">Ingress Check</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The reverse proxy checks the Host headers and routes queries from consumer domains directly to specific registered tenant endpoints.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-carbon-900/40 border border-carbon-border p-6 rounded-lg relative overflow-hidden">
              <div className="text-electric-cobalt font-mono font-black text-2xl mb-4">02</div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">Token Bucket Limiting</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Redis reads and decrements the client's token count in-memory, blocking bursts that violate the plan rate structure instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-carbon-900/40 border border-carbon-border p-6 rounded-lg relative overflow-hidden">
              <div className="text-white font-mono font-black text-2xl mb-4">03</div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">SHA-256 Auth</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                API keys are hashed with one-way SHA-256 and matched with stored subscription records in PostgreSQL, preventing raw key exposures.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-carbon-900/40 border border-carbon-border p-6 rounded-lg relative overflow-hidden">
              <div className="text-emerald-400 font-mono font-black text-2xl mb-4">04</div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">Reverse Routing</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The validated request forwards to the target API destination. Gateway monitors upstream HTTP status logs for real-time health checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-carbon-border">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-[10px] font-mono font-bold tracking-widest text-solar-amber uppercase">// SERVICE FEATURES</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase mt-2">
            Complete API Lifecycle Management
          </h2>
          <p className="mt-3 text-xs md:text-sm text-gray-400 font-mono leading-relaxed">
            Publish endpoints, create monetization plans, configure rate-limiting, and track analytics on a single developer platform.
          </p>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 hover:border-electric-cobalt/40 transition-all duration-300 hover:translate-y-[-2px] group hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
            <div className="w-11 h-11 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt mb-6 group-hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.08)]">
              <Zap className="w-4 h-4 text-electric-cobalt group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-electric-cobalt transition-colors">High-Performance Proxy</h3>
            <p className="text-xs text-gray-450 leading-relaxed font-sans">
              Ultra-low latency Redis routing proxies developer queries to backend upstream servers in milliseconds, optimizing system throughput.
            </p>
          </div>
 
          {/* Card 2 */}
          <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 hover:border-electric-cobalt/40 transition-all duration-300 hover:translate-y-[-2px] group hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
            <div className="w-11 h-11 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt mb-6 group-hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.08)]">
              <Shield className="w-4 h-4 text-electric-cobalt group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-electric-cobalt transition-colors">Token Bucket Rate Limiting</h3>
            <p className="text-xs text-gray-450 leading-relaxed font-sans">
              Securely limit API requests on a per-tier basis using a Redis-based token bucket. Intercept and blocks spam/DDoS requests immediately.
            </p>
          </div>
 
          {/* Card 3 */}
          <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 hover:border-electric-cobalt/40 transition-all duration-300 hover:translate-y-[-2px] group hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
            <div className="w-11 h-11 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt mb-6 group-hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.08)]">
              <Key className="w-4 h-4 text-electric-cobalt group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-electric-cobalt transition-colors">One-Time Hashed Credentials</h3>
            <p className="text-xs text-gray-450 leading-relaxed font-sans">
              Generate secure cryptographically strong API keys. Displays once for immediate copy, storing only one-way SHA-256 hashes.
            </p>
          </div>
 
          {/* Card 4 */}
          <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 hover:border-electric-cobalt/40 transition-all duration-300 hover:translate-y-[-2px] group hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
            <div className="w-11 h-11 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt mb-6 group-hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.08)]">
              <BarChart3 className="w-4 h-4 text-electric-cobalt group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-electric-cobalt transition-colors">Developer Analytics</h3>
            <p className="text-xs text-gray-450 leading-relaxed font-sans">
              Track active API subscriptions, rate limits triggered, response sizes, and latencies through gorgeous analytics dashboard displays.
            </p>
          </div>
 
          {/* Card 5 */}
          <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 hover:border-electric-cobalt/40 transition-all duration-300 hover:translate-y-[-2px] group hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
            <div className="w-11 h-11 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt mb-6 group-hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.08)]">
              <Layers className="w-4 h-4 text-electric-cobalt group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-electric-cobalt transition-colors">Multi-Plan Tiers</h3>
            <p className="text-xs text-gray-450 leading-relaxed font-sans">
              API publishers can define custom tiers with tailored prices, and requests per minute (RPM) limits in an easy-to-use form creator.
            </p>
          </div>
 
          {/* Card 6 */}
          <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 hover:border-electric-cobalt/40 transition-all duration-300 hover:translate-y-[-2px] group hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]">
            <div className="w-11 h-11 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt mb-6 group-hover:scale-105 transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.08)]">
              <Cpu className="w-4 h-4 text-electric-cobalt group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2 font-display uppercase tracking-wide group-hover:text-electric-cobalt transition-colors">Health Monitoring</h3>
            <p className="text-xs text-gray-455 leading-relaxed font-sans">
              Maintains database logs on gateway status. Auto-flags unresponsive downstream web servers and alerts developers immediately.
            </p>
          </div>
        </div>
      </section>
 
      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto border-t border-carbon-border">
        <div className="text-center mb-16">
          <span className="text-[10px] font-mono font-bold tracking-widest text-solar-amber uppercase">// FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase mt-2">
            Technical FAQs
          </h2>
          <p className="mt-3 text-xs md:text-sm text-gray-450 font-mono">
            Everything you need to know about the ApexGateway architecture.
          </p>
        </div>
 
        <div className="space-y-4">
          {[
            {
              q: 'How does the Redis token bucket rate limiting work?',
              a: 'When an incoming request hits our Gateway Proxy (Port 4000), it checks the client API Key in Redis. The key is matched against a Redis key containing the token count and the last refill timestamp. If tokens are available, the count decrements and the request passes to the upstream URL. Otherwise, it is blocked immediately with a 429 Too Many Requests response.'
            },
            {
              q: 'Why are credentials only displayed once?',
              a: 'To guarantee maximum security. We do not store raw credentials/API keys in our database. When you subscribe, we generate a cryptographically secure key, display it once in the UI, and immediately write a one-way SHA-256 hash to PostgreSQL. Future requests authenticate by hashing the incoming key and comparing it to the hash in PostgreSQL.'
            },
            {
              q: 'How do I publish an API as a Provider?',
              a: 'After creating an account with the PROVIDER role, navigate to the Dashboard and select "Register New API". Input your service name, target upstream endpoint URL, and details. Once registered, you can create pricing plan structures to specify limits and pricing rates.'
            },
            {
              q: 'Is there a latency overhead for proxying through the gateway?',
              a: 'Miniscule. Because we route and validate credentials against in-memory Redis token buckets and caches, proxy routing latency overhead remains under 12 milliseconds in average workloads, preventing bottlenecks.'
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-carbon-900 border border-carbon-border rounded-lg overflow-hidden transition-colors hover:border-carbon-border/80"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left outline-none cursor-pointer group"
              >
                <span className="group-hover:text-electric-cobalt transition-colors text-xs font-mono font-bold tracking-wide uppercase">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-all duration-300 ${faqOpen === idx ? 'rotate-180 text-electric-cobalt' : 'group-hover:text-gray-300'}`} />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-5 text-xs text-gray-400 border-t border-carbon-border/40 pt-4 leading-relaxed font-sans animate-fadeIn">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
 
      {/* CTA Section */}
      <section className="py-24 bg-carbon-950 text-center relative px-6 border-t border-carbon-border overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-mask opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-electric-cobalt/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-[10px] font-mono font-bold tracking-widest text-electric-cobalt uppercase">// GET STARTED NOW</span>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight uppercase mt-2">
            Start Securing & Monetizing Your APIs Today
          </h2>
          <p className="mt-4 text-gray-400 text-xs md:text-sm max-w-lg mx-auto leading-relaxed font-mono">
            Get instant developer portals, Redis rate limiting, and subscription flows configured in less than 5 minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/signup"
              className="bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider shadow-[0_2px_10px_rgba(59,130,246,0.15)]"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
 
      {/* Footer */}
      <footer className="bg-carbon-900 border-t border-carbon-border py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1 - Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/icons.png" alt="ApexGateway Logo" className="w-8 h-8 object-contain" />
              <span className="font-display font-black text-white text-base tracking-widest uppercase">APEX GATEWAY</span>
            </div>
            <p className="text-[11px] text-gray-450 leading-relaxed max-w-xs font-sans">
              Secure, high-concurrency Redis rate-limiting and instant developer portals for modern APIs.
            </p>
          </div>
 
          {/* Column 2 - Product */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-mono">Product</h4>
            <ul className="space-y-2 text-[11px] font-mono text-gray-400">
              <li><a href="#features" className="hover:text-electric-cobalt transition-colors">Features</a></li>
              <li><a href="#playground" className="hover:text-electric-cobalt transition-colors">Interactive Playground</a></li>
            </ul>
          </div>
 
          {/* Column 3 - Developers */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-mono">Developers</h4>
            <ul className="space-y-2 text-[11px] font-mono text-gray-400">
              <li><Link to="/login" className="hover:text-electric-cobalt transition-colors">Portal Login</Link></li>
              <li><Link to="/signup" className="hover:text-electric-cobalt transition-colors">API Registration</Link></li>
              <li><a href="#faq" className="hover:text-electric-cobalt transition-colors">Technical FAQs</a></li>
            </ul>
          </div>
 
          {/* Column 4 - Status */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 font-mono">Gateway Status</h4>
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-500/20 px-3 py-1.5 rounded w-max font-mono uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
          </div>
        </div>
 
        <div className="max-w-7xl mx-auto border-t border-carbon-border/40 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-gray-600 font-mono">
          <div>
            © {new Date().getFullYear()} ApexGateway. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span>Built for high-concurrency API performance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
