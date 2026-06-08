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
  Terminal 
} from 'lucide-react';

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
        setApi(res.data.api);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading API specifications...</p>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-white">API Not Found</h3>
        <p className="text-gray-400 mt-2">The API you are looking for does not exist or has been removed.</p>
        <Link to="/marketplace" className="inline-block mt-4 text-primary-400 hover:underline">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      <div>
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm cursor-pointer group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-8 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-center justify-center text-primary-400 shrink-0">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{api.name}</h1>
            <p className="text-gray-400 mt-2 max-w-2xl">{api.description || 'No description provided.'}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-xs font-mono text-gray-500">
              <div>
                <span className="text-gray-400">Gateway Route:</span>{' '}
                <span className="text-primary-400 font-semibold bg-bg-dark/60 px-2 py-1 rounded">/api/{api.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Upstream:</span>{' '}
                <span className="bg-bg-dark/60 px-2 py-1 rounded">{api.upstreamUrl}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Subscription Plans</h2>
          </div>

          {api.plans?.length === 0 ? (
            <div className="bg-card-dark/20 border border-border-dark rounded-2xl p-6 text-center text-gray-400 text-sm">
              No pricing plans defined for this API.
            </div>
          ) : (
            <div className="space-y-4">
              {api.plans.map((plan) => (
                <div 
                  key={plan.id}
                  className="bg-card-dark/40 border border-border-dark hover:border-primary-500/30 rounded-2xl p-6 transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <div className="text-2xl font-extrabold text-primary-400 mt-2">
                      ${plan.price}
                      <span className="text-xs text-gray-500 font-normal"> /mo</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-3 font-mono">
                      Limit: <span className="text-white font-semibold">{plan.requestsPerMin}</span> requests/min
                    </div>
                  </div>
                  
                  {user?.role === 'CONSUMER' && (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribingPlanId === plan.id}
                      className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-[0_2px_10px_rgba(139,92,246,0.2)]"
                    >
                      {subscribingPlanId === plan.id ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Interactive API Tester</h2>
          </div>

          <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">HTTP Method</label>
                <select
                  value={testMethod}
                  onChange={(e) => setTestMethod(e.target.value)}
                  className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 text-white rounded-xl py-2 px-3 outline-none text-sm cursor-pointer"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>X-API-Key</span>
                  <button 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[10px] text-primary-400 hover:underline cursor-pointer"
                  >
                    {showApiKey ? 'Hide Key' : 'Show Key'}
                  </button>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="apx_live_..."
                    value={testApiKey}
                    onChange={(e) => setTestApiKey(e.target.value)}
                    className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 text-white rounded-xl py-2.5 px-4 outline-none text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Request Endpoint Path</label>
              <div className="flex items-center gap-1 bg-bg-dark/50 border border-border-dark rounded-xl px-4 py-2 font-mono text-sm">
                <span className="text-gray-500 select-none">http://localhost:4000/api/{api.name}/</span>
                <input
                  type="text"
                  placeholder="v1/forecast"
                  value={testPath}
                  onChange={(e) => setTestPath(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none border-none p-0 focus:ring-0 text-sm font-mono"
                />
              </div>
            </div>

            {testMethod !== 'GET' && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Request Body (JSON)</label>
                <textarea
                  placeholder='{ "key": "value" }'
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  rows={4}
                  className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 text-white rounded-xl p-3 outline-none text-sm font-mono"
                />
              </div>
            )}

            <button
              onClick={runTest}
              disabled={testing}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
            >
              <Play className="w-4 h-4" />
              <span>{testing ? 'Sending Request...' : 'Send Test Request'}</span>
            </button>

            {testResponse && (
              <div className="space-y-4 border-t border-border-dark pt-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between text-xs font-semibold font-mono">
                  <div className="flex items-center gap-2">
                    <span>Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full ${
                      testResponse.status >= 200 && testResponse.status < 300 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {testResponse.status} {testResponse.statusText}
                    </span>
                  </div>
                  <div>
                    <span>Latency:</span> <span className="text-primary-400">{testResponse.latency}ms</span>
                  </div>
                </div>

                <div className="bg-bg-dark/60 border border-border-dark rounded-xl p-4 overflow-x-auto max-h-80 scrollbar-thin">
                  <div className="text-xs text-gray-500 font-semibold uppercase mb-2">Response Body</div>
                  <pre className="text-xs font-mono text-emerald-400 select-all">{JSON.stringify(testResponse.data, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {apiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card-dark border border-border-dark rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-400 mb-4">
              <AlertTriangle className="w-8 h-8 shrink-0 animate-bounce" />
              <h2 className="text-xl font-bold text-white">One-Time API Key Delivery</h2>
            </div>
            
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Below is your secure API key for this subscription. To protect your credentials, ApexGateway hashes this key and **will never show it to you again**. Please copy and store it somewhere safe immediately.
            </p>

            <div className="flex items-center gap-2 bg-bg-dark/60 border border-border-dark rounded-xl p-3 font-mono text-sm text-white mb-6 select-all">
              <span className="flex-1 break-all pr-2">{apiKeyModal.apiKey}</span>
              <button
                onClick={copyToClipboard}
                className="shrink-0 p-2 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/30 text-primary-400 rounded-lg transition-all cursor-pointer"
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
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-[0_4px_20px_rgba(139,92,246,0.3)] text-center font-bold"
            >
              I have saved it, close modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
