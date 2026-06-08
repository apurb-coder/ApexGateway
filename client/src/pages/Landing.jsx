import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Zap, 
  Key, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  Terminal, 
  Play, 
  Check, 
  Menu, 
  X, 
  HelpCircle, 
  Layers, 
  Cpu, 
  Lock, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // State for Mobile Menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State for Interactive Gateway Console
  const [selectedEndpoint, setSelectedEndpoint] = useState('GET /weather');
  const [customKey, setCustomKey] = useState('apx_live_f1e582d921b74a38c92a');
  const [tokens, setTokens] = useState(5);
  const [isRequesting, setIsRequesting] = useState(false);
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

      if (!customKey || customKey.trim() === '') {
        logEntry.status = 401;
        logEntry.response = { error: 'Unauthorized. API Key is missing.' };
      } else if (tokens <= 0) {
        logEntry.status = 429;
        logEntry.response = { error: 'Too Many Requests. Rate limit exceeded. Token bucket empty.' };
      } else {
        setTokens((prev) => prev - 1);
        logEntry.status = endpoint.status;
        logEntry.response = endpoint.res;
      }

      setConsoleLogs((prev) => [logEntry, ...prev.slice(0, 8)]);
      setIsRequesting(false);
    }, 400); // 400ms simulate delay
  };

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-gray-200 selection:bg-primary-500/30 selection:text-primary-300 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-primary-600 to-accent-400 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              A
            </div>
            <span className="font-extrabold text-white text-xl tracking-wider">APEX</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#playground" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Playground</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Pricing</a>
            <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">FAQs</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'PROVIDER' ? '/dashboard/provider/apis' : '/marketplace'}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(139,92,246,0.2)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">
                  Log In
                </Link>
                <Link 
                  to="/signup"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(139,92,246,0.2)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] cursor-pointer"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-bg-dark border-b border-border-dark px-6 py-4 space-y-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white transition-colors py-2 text-sm font-medium">Features</a>
            <a href="#playground" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white transition-colors py-2 text-sm font-medium">Playground</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white transition-colors py-2 text-sm font-medium">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-gray-400 hover:text-white transition-colors py-2 text-sm font-medium">FAQs</a>
            <hr className="border-border-dark" />
            <div className="flex flex-col gap-3 pt-2">
              {isAuthenticated ? (
                <Link 
                  to={user?.role === 'PROVIDER' ? '/dashboard/provider/apis' : '/marketplace'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-primary-500 text-center hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(139,92,246,0.2)] flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-gray-300 hover:text-white font-medium py-2 text-sm"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-primary-500 text-center hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm"
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
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Neon Glow Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[140px] pulse-glow"></div>
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent-500/5 rounded-full blur-[100px] pulse-glow" style={{ animationDelay: '-2s' }}></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5 animate-pulse" />
            Vite + Redis Gateway Stack Active
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            High-Performance API Proxying <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary-400 via-accent-300 to-primary-300">
              With Instant Developer Portals
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
            ApexGateway provides secure Redis-backed token bucket rate limiting, one-time credentials, and custom subscription monetization—all in a unified marketplace.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to={isAuthenticated ? (user?.role === 'PROVIDER' ? '/dashboard/provider/apis' : '/marketplace') : '/signup'}
              className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 px-8 rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#playground" 
              className="w-full sm:w-auto bg-card-dark/60 hover:bg-card-dark border border-border-dark hover:border-border-hover text-gray-300 hover:text-white font-semibold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              Test Gateway Proxy
            </a>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl bg-card-dark/20 border border-border-dark/60 backdrop-blur-md max-w-3xl mx-auto">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">&lt; 12ms</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Average Latency</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-primary-400">99.99%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Gateway Uptime</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white">Redis</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Rate Limiter</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-accent-400">100%</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">Hashed Keys</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Playground Section */}
      <section id="playground" className="py-20 bg-card-dark/10 border-y border-border-dark relative">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pulse-glow"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Try the Token Bucket Rate Limiter
            </h2>
            <p className="mt-4 text-gray-400">
              Simulate high-concurrency requests passing through our gateway proxy. See how the bucket drains and refills in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Controller / Client request panel */}
            <div className="lg:col-span-5 bg-card-dark/50 border border-border-dark rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary-400" />
                  Client Request Editor
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      API Endpoint Route
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['GET /weather', 'POST /checkout', 'GET /users'].map((ep) => (
                        <button
                          key={ep}
                          onClick={() => setSelectedEndpoint(ep)}
                          className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            selectedEndpoint === ep
                              ? 'bg-primary-500/10 border-primary-500 text-primary-400'
                              : 'bg-bg-dark/40 border-border-dark text-gray-400 hover:border-border-hover'
                          }`}
                        >
                          {ep}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                      Header Parameters
                    </label>
                    <div className="bg-bg-dark/60 rounded-xl p-3 border border-border-dark space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-500">Host:</span>
                        <span className="font-mono text-gray-300">gateway.apex.io</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-500">X-API-Key:</span>
                        <input
                          type="text"
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          className="font-mono text-primary-400 bg-transparent border-b border-border-dark outline-none focus:border-primary-500 text-right w-48 text-xs"
                          placeholder="apx_live_..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Token Bucket Meter */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Token Bucket Capacity
                      </span>
                      <span className="text-xs font-bold text-primary-400 font-mono">
                        {tokens} / 5 tokens
                      </span>
                    </div>
                    <div className="flex gap-1.5 h-3 items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                            i < tokens
                              ? 'bg-gradient-to-r from-primary-500 to-accent-400 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                              : 'bg-border-dark'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                        Refills +1 every 2s
                      </span>
                      {tokens === 0 && (
                        <span className="text-[10px] font-bold text-rose-400 animate-pulse">
                          Bucket Empty! Requests Blocked.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleTestRequest}
                  disabled={isRequesting}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.2)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Play className={`w-4 h-4 fill-white ${isRequesting ? 'animate-ping' : ''}`} />
                  {isRequesting ? 'Sending Gateway Request...' : 'Trigger Request'}
                </button>
              </div>
            </div>

            {/* Simulated Live Gateway Log output */}
            <div className="lg:col-span-7 bg-bg-dark/80 border border-border-dark rounded-2xl flex flex-col overflow-hidden shadow-2xl">
              {/* Terminal Title Bar */}
              <div className="bg-card-dark/80 border-b border-border-dark px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-gray-400 font-mono ml-2">apex-gateway-proxy.log</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Listening on Port: 4000
                </div>
              </div>

              {/* Terminal Logs Content */}
              <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 max-h-[340px] min-h-[300px]">
                {consoleLogs.map((log, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border transition-all duration-300 animate-fadeIn ${
                      log.status === 200 || log.status === 201
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                        : log.status === 429
                        ? 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                        : log.status === 401
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-400'
                        : 'bg-card-dark/40 border-border-dark text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-[11px] font-semibold opacity-80">
                      <div className="flex items-center gap-2">
                        <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {log.method}
                        </span>
                        <span>{log.path}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{log.latency}ms</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] pt-1 border-t border-white/5">
                      <span className="font-bold uppercase">
                        Status: {log.status === 100 ? 'READY' : log.status}
                      </span>
                      <span className="opacity-90 max-w-[80%] truncate">
                        {typeof log.response === 'object' ? JSON.stringify(log.response) : log.response}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Complete API Lifecycle Management
          </h2>
          <p className="mt-4 text-gray-400">
            Publish endpoints, create monetization plans, configure rate-limiting, and track analytics on a single developer platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-card-dark/30 border border-border-dark/60 rounded-2xl p-6 hover:border-primary-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">High-Performance Proxy</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Ultra-low latency Redis routing proxies developer queries to backend upstream servers in milliseconds, optimizing system throughput.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-card-dark/30 border border-border-dark/60 rounded-2xl p-6 hover:border-primary-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Token Bucket Rate Limiting</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Securely limit API requests on a per-tier basis using a Redis-based token bucket. Intercept and blocks spam/DDoS requests immediately.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-card-dark/30 border border-border-dark/60 rounded-2xl p-6 hover:border-primary-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">One-Time Hashed Credentials</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Generate secure cryptographically strong API keys. Displays once for immediate copy, storing only one-way SHA-256 hashes.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-card-dark/30 border border-border-dark/60 rounded-2xl p-6 hover:border-primary-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Developer Analytics</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Track active API subscriptions, rate limits triggered, response sizes, and latencies through gorgeous analytics dashboard displays.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-card-dark/30 border border-border-dark/60 rounded-2xl p-6 hover:border-primary-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Plan Subscription Tiers</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              API publishers can define custom tiers with tailored prices, and requests per minute (RPM) limits in an easy-to-use form creator.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-card-dark/30 border border-border-dark/60 rounded-2xl p-6 hover:border-primary-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 mb-6 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upstream Health Monitoring</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Maintains database logs on gateway status. Auto-flags unresponsive downstream web servers and alerts developers immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section id="pricing" className="py-24 bg-card-dark/10 border-t border-border-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Transparent, Developer-Friendly Plans
            </h2>
            <p className="mt-4 text-gray-400">
              No hidden fees. Pick a pricing tier matching your API consumption scale, or configure custom limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-bg-dark/40 border border-border-dark rounded-2xl p-8 flex flex-col justify-between hover:border-border-hover transition-colors">
              <div>
                <h3 className="text-lg font-bold text-white">Basic Starter</h3>
                <p className="text-sm text-gray-500 mt-1">For testing and personal side projects.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-sm text-gray-500 ml-2">/ month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Up to 10 Requests / Minute</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>3 Active API Subscriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Standard Latency Logs</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="block text-center bg-card-dark hover:bg-card-dark/80 text-white font-semibold py-2.5 px-4 rounded-xl border border-border-dark text-sm transition-all cursor-pointer"
                >
                  Start Testing
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary-950/20 border-2 border-primary-500 rounded-2xl p-8 flex flex-col justify-between relative shadow-[0_0_30px_rgba(139,92,246,0.15)]">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Pro Developer
                </h3>
                <p className="text-sm text-primary-400 mt-1">For production web apps & active builders.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-sm text-gray-500 ml-2">/ month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-400 shrink-0" />
                    <span className="font-semibold">Up to 120 Requests / Minute</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-400 shrink-0" />
                    <span>Unlimited Subscriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-400 shrink-0" />
                    <span>Priority Redis Rate-Limiting Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-400 shrink-0" />
                    <span>14-day Analytics Storage</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="block text-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(139,92,246,0.2)] cursor-pointer"
                >
                  Get Pro Access
                </Link>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-bg-dark/40 border border-border-dark rounded-2xl p-8 flex flex-col justify-between hover:border-border-hover transition-colors">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise Scaling</h3>
                <p className="text-sm text-gray-500 mt-1">Custom limits for enterprise scale.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">$99</span>
                  <span className="text-sm text-gray-500 ml-2">/ month</span>
                </div>
                <ul className="mt-8 space-y-4 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">Custom RPM Limits</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated Cluster Upstream Proxy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Unlimited Hashed Keys</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-Time Webhooks Integration</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="block text-center bg-card-dark hover:bg-card-dark/80 text-white font-semibold py-2.5 px-4 rounded-xl border border-border-dark text-sm transition-all cursor-pointer"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-gray-400">
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
              className="bg-card-dark/40 border border-border-dark rounded-xl overflow-hidden transition-colors hover:border-border-hover"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-white outline-none cursor-pointer"
              >
                <span>{item.q}</span>
                <HelpCircle className={`w-5 h-5 text-gray-500 transition-transform ${faqOpen === idx ? 'rotate-180 text-primary-400' : ''}`} />
              </button>
              {faqOpen === idx && (
                <div className="px-5 pb-5 text-sm text-gray-400 border-t border-border-dark/60 pt-4 leading-relaxed animate-slideDown">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-b from-bg-dark to-primary-950/20 text-center relative px-6 border-t border-border-dark">
        <div className="absolute inset-0 bg-primary-500/5 blur-[120px] pointer-events-none pulse-glow"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Start Securing & Monetizing Your APIs Today
          </h2>
          <p className="mt-4 text-gray-400 text-base max-w-lg mx-auto">
            Get instant developer portals, Redis rate limiting, and subscription flows configured in less than 5 minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/signup"
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-dark border-t border-border-dark/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-primary-600 to-accent-400 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              A
            </div>
            <span className="font-extrabold text-white text-lg tracking-wider">APEX</span>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-xs text-gray-500">
            <span className="hover:text-gray-400 transition-colors">© {new Date().getFullYear()} ApexGateway. All rights reserved.</span>
            <a href="#features" className="hover:text-gray-400 transition-colors">Features</a>
            <a href="#playground" className="hover:text-gray-400 transition-colors">Playground</a>
            <a href="#pricing" className="hover:text-gray-400 transition-colors">Pricing</a>
            <span className="text-gray-600">Built for high-concurrency API performance</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
