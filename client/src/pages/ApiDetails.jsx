import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import axios from 'axios';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  ArrowLeft, 
  Cpu, 
  CreditCard, 
  Play, 
  Copy, 
  Check, 
  AlertTriangle, 
  Terminal,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function ApiDetails() {
  const { apiId } = useParams();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [subscribingPlanId, setSubscribingPlanId] = useState(null);
  const [apiKeyModal, setApiKeyModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const [testPath, setTestPath] = useState('');
  const [testMethod, setTestMethod] = useState('GET');
  const [testBody, setTestBody] = useState('');
  const [testApiKey, setTestApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [testing, setTesting] = useState(false);

  const addToast = useUIStore((state) => state.addToast);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchApiDetails = async () => {
      try {
        const res = await apiClient.get(`/apis/${apiId}`);
        const apiData = res.data.api;
        setApi(apiData);
        if (apiData.allowedMethods && apiData.allowedMethods.length > 0) {
          setTestMethod(apiData.allowedMethods[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApiDetails();
  }, [apiId]);

  const handleSubscribe = async (planId) => {
    setSubscribingPlanId(planId);
    try {
      const res = await apiClient.post('/subscriptions', { planId });
      setApiKeyModal({
        apiKey: res.data.apiKey,
        subscriptionId: res.data.subscriptionId
      });
      addToast('Subscribed successfully!', 'success');
    } catch (err) {
      // Axios interceptor handles the toast
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const copyToClipboard = () => {
    if (!apiKeyModal?.apiKey) return;
    navigator.clipboard.writeText(apiKeyModal.apiKey);
    setCopied(true);
    addToast('API Key copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const runTest = async () => {
    if (!testApiKey) {
      addToast('Please enter your API Key to test the gateway', 'warning');
      return;
    }

    setTesting(true);
    setTestResponse(null);
    const start = Date.now();
    
    const gatewayUrl = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:4000';
    const cleanPath = testPath.startsWith('/') ? testPath.substring(1) : testPath;
    const url = `${gatewayUrl}/api/${api.name}/${cleanPath}`;

    try {
      const headers = {
        'X-API-Key': testApiKey,
        'Content-Type': 'application/json'
      };

      const config = {
        method: testMethod,
        url,
        headers,
        data: testMethod !== 'GET' && testBody ? JSON.parse(testBody) : undefined
      };

      const res = await axios(config);
      const latency = Date.now() - start;
      
      setTestResponse({
        status: res.status,
        statusText: res.statusText,
        latency,
        data: res.data,
        headers: res.headers
      });
    } catch (err) {
      const latency = Date.now() - start;
      setTestResponse({
        status: err.response?.status || 500,
        statusText: err.response?.statusText || 'Error',
        latency,
        data: err.response?.data || { error: err.message },
        headers: err.response?.headers || {}
      });
      
      if (err.response?.status === 429) {
        addToast('Gateway rate limit exceeded (429)!', 'error');
      }
    } finally {
      setTesting(false);
    }
  };

  const gatewayUrl = import.meta.env.VITE_GATEWAY_API_URL || 'http://localhost:4000';

  const renderPlans = () => {
    if (!api.plans || api.plans.length === 0) {
      return (
        <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-6 text-center text-gray-500 text-sm">
          No pricing plans defined for this API.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {api.plans.map((plan) => (
          <div 
            key={plan.id}
            className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 transition-[border-color,box-shadow] duration-300 flex flex-col justify-between gap-5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-base font-bold text-white font-display">{plan.name}</h3>
              <div className="text-3xl font-black text-primary-400 mt-2 font-display">
                ${plan.price}
                <span className="text-xs text-gray-500 font-normal font-sans"> /mo</span>
              </div>
              <div className="text-xs text-gray-400 mt-4 font-mono flex items-center justify-between bg-bg-dark/50 border border-border-dark px-3 py-2 rounded-xl">
                <span className="text-gray-500">Rate Limit:</span>
                <span className="text-white font-semibold">{plan.requestsPerMin} req/min</span>
              </div>
            </div>
            
            {user?.role === 'CONSUMER' && (
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribingPlanId === plan.id}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-[background-color,box-shadow] cursor-pointer shadow-[0_4px_15px_rgba(139,92,246,0.25)] relative z-10 focus-visible:ring-2 focus-visible:ring-primary-500 outline-none"
              >
                {subscribingPlanId === plan.id ? 'Subscribing…' : 'Subscribe to Tier'}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPlayground = () => {
    return (
      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md space-y-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="test-method-select" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">HTTP Method</label>
            <select
              id="test-method-select"
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value)}
              className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 text-white rounded-xl py-2.5 px-3.5 outline-none text-xs cursor-pointer font-mono focus-visible:ring-1 focus-visible:ring-primary-500"
            >
              {((api.allowedMethods && api.allowedMethods.length > 0) ? api.allowedMethods : ['GET', 'POST', 'PUT', 'DELETE']).map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="test-api-key-input" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-display">X-API-Key Header</label>
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded px-1"
              >
                {showApiKey ? 'Hide Key' : 'Reveal Key'}
              </button>
            </div>
            <div className="relative">
              <input
                id="test-api-key-input"
                name="apiKey"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter subscription key (apx_live_…)"
                value={testApiKey}
                onChange={(e) => setTestApiKey(e.target.value)}
                className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 px-4 outline-none text-xs font-mono placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-primary-500"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="test-path-input" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Gateway Request URL</label>
          <div className="flex items-center gap-1.5 bg-bg-dark/60 border border-border-dark rounded-xl px-4 py-3 font-mono text-xs overflow-x-auto scrollbar-thin">
            <span className="text-gray-500 select-none shrink-0">{gatewayUrl}/api/{api.name}/</span>
            <input
              id="test-path-input"
              name="testPath"
              type="text"
              placeholder="v1/data-endpoint…"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none border-none p-0 focus:ring-0 text-xs font-mono min-w-[150px] focus-visible:ring-1 focus-visible:ring-primary-500"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        {testMethod !== 'GET' && (
          <div>
            <label htmlFor="test-body-textarea" className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Request Body (JSON)</label>
            <textarea
              id="test-body-textarea"
              name="testBody"
              placeholder='{ "query": "hello world…" }'
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              rows={4}
              className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl p-3.5 outline-none text-xs font-mono placeholder:text-gray-600 focus-visible:ring-1 focus-visible:ring-primary-500"
              spellCheck={false}
            />
          </div>
        )}

        <button
          onClick={runTest}
          disabled={testing}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-[background-color,box-shadow] flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.45)] focus-visible:ring-2 focus-visible:ring-primary-500 outline-none"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{testing ? 'Routing Request…' : 'Trigger Proxy Route'}</span>
        </button>

        {testResponse && (
          <div className="space-y-4 border-t border-border-dark pt-6 animate-fadeIn">
            <div className="flex items-center justify-between text-[11px] font-semibold font-mono">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status Code:</span>
                <span className={`px-2.5 py-0.5 rounded-full ${
                  testResponse.status >= 200 && testResponse.status < 300 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {testResponse.status} {testResponse.statusText}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Roundtrip:</span> <span className="text-primary-400 font-bold">{testResponse.latency}ms</span>
              </div>
            </div>

            <div className="bg-bg-dark/80 border border-border-dark rounded-xl p-4 overflow-x-auto max-h-80 scrollbar-thin relative font-mono text-xs">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 font-sans">Gateway Response Body</div>
              <pre className="text-emerald-400 select-all leading-relaxed whitespace-pre-wrap">{JSON.stringify(testResponse.data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading API specifications…</p>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-white font-display">API Not Found</h3>
        <p className="text-gray-400 mt-2 text-sm">The API you are looking for does not exist or has been removed.</p>
        <Link to="/marketplace" className="inline-block mt-4 text-primary-400 hover:underline text-sm font-semibold transition-colors focus-visible:ring-1 focus-visible:ring-primary-500 rounded px-1">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 relative animate-fadeIn">
      <div>
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer group focus-visible:ring-1 focus-visible:ring-primary-500 rounded px-1">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Marketplace</span>
        </Link>
      </div>

      {/* API Intro block */}
      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-8 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 gradient-border-glow">
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-14 h-14 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white font-display tracking-wide">{api.name}</h1>
            <p className="text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed">{api.description || 'No description provided.'}</p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Gateway Route:</span>
                <span className="text-primary-400 font-semibold bg-bg-dark/80 border border-border-dark px-2 py-0.5 rounded" translate="no">
                  /api/{api.name}
                </span>
              </div>
              {api.upstreamUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Upstream Destination:</span>
                  <span className="text-gray-300 bg-bg-dark/80 border border-border-dark px-2 py-0.5 rounded" translate="no">
                    {api.upstreamUrl}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Allowed Methods:</span>
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

        {api.exampleDocs && (
          <div className="relative z-10 shrink-0 self-start md:self-center">
            <a
              href={`/apis/${api.id}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 border border-primary-600 text-white font-bold rounded-xl text-xs transition-[background-color,box-shadow] cursor-pointer shadow-[0_4px_15px_rgba(139,92,246,0.25)] focus-visible:ring-2 focus-visible:ring-primary-500 outline-none"
              aria-label="View API documentation in a new tab"
            >
              <BookOpen className="w-4 h-4" />
              <span>View Documentation</span>
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Plans Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border-dark">
            <CreditCard className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-white font-display tracking-wide">Pricing Tiers</h2>
          </div>
          {renderPlans()}
        </div>

        {/* Playground Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border-dark">
            <Terminal className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-white font-display tracking-wide">Gateway Playground</h2>
          </div>
          {renderPlayground()}
        </div>
      </div>
    </div>

    {apiKeyModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="w-full max-w-lg bg-card-dark border border-primary-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(139,92,246,0.15)] relative z-10">
          <div className="flex items-center gap-3 text-rose-400 mb-4 pb-2 border-b border-border-dark">
            <AlertTriangle className="w-7 h-7 shrink-0 text-amber-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white font-display tracking-wide">One-Time Secure Key Delivery</h2>
          </div>
          
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Below is the raw API key for this subscription. To protect your backend, ApexGateway hashes this key and **will never display it to you again**. Please copy and store it securely now.
          </p>

          <div className="flex items-center gap-2 bg-bg-dark/80 border border-border-dark rounded-xl p-3.5 font-mono text-xs text-white mb-6 select-all">
            <span className="flex-1 break-all pr-2 tracking-wide font-semibold text-primary-400">{apiKeyModal.apiKey}</span>
            <button
              onClick={copyToClipboard}
              className="shrink-0 p-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-lg transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-primary-500 outline-none"
              aria-label="Copy subscription API key"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={() => {
              setTestApiKey(apiKeyModal.apiKey);
              setApiKeyModal(null);
              addToast('Modal dismissed. Key has been auto-filled in the tester console.', 'info');
            }}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl text-xs transition-[background-color,box-shadow] cursor-pointer shadow-[0_4px_15px_rgba(139,92,246,0.25)] text-center focus-visible:ring-2 focus-visible:ring-primary-500 outline-none"
          >
            I have saved it, close modal
          </button>
        </div>
      </div>
    )}
  </>
);
}
