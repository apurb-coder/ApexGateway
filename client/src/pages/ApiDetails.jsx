import { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';

const generateSnippet = (lang, method, url, apiKey, bodyStr) => {
  const key = apiKey || 'YOUR_API_KEY';
  const cleanBody = bodyStr ? bodyStr.trim() : '';
  const hasBody = method !== 'GET' && cleanBody;

  switch (lang) {
    case 'curl': {
      let curlCmd = `curl --request ${method} \\\n  --url '${url}' \\\n  --header 'Content-Type: application/json' \\\n  --header 'X-API-Key: ${key}'`;
      if (hasBody) {
        const escapedBody = cleanBody.replace(/'/g, "'\\''");
        curlCmd += ` \\\n  --data '${escapedBody}'`;
      }
      return curlCmd;
    }

    case 'js_fetch': {
      let fetchOpts = `const options = {\n  method: '${method}',\n  headers: {\n    'Content-Type': 'application/json',\n    'X-API-Key': '${key}'\n  }`;
      if (hasBody) {
        try {
          const parsed = JSON.parse(cleanBody);
          fetchOpts += `,\n  body: JSON.stringify(${JSON.stringify(parsed, null, 2).replace(/\n/g, '\n  ')})`;
        } catch {
          fetchOpts += `,\n  body: JSON.stringify(${cleanBody})`;
        }
      }
      fetchOpts += `\n};`;
      return `${fetchOpts}\n\nfetch('${url}', options)\n  .then(response => response.json())\n  .then(response => console.log(response))\n  .catch(err => console.error(err));`;
    }

    case 'js_axios': {
      let axiosOpts = `const options = {\n  method: '${method}',\n  url: '${url}',\n  headers: {\n    'Content-Type': 'application/json',\n    'X-API-Key': '${key}'\n  }`;
      if (hasBody) {
        try {
          const parsed = JSON.parse(cleanBody);
          axiosOpts += `,\n  data: ${JSON.stringify(parsed, null, 2).replace(/\n/g, '\n  ')}`;
        } catch {
          axiosOpts += `,\n  data: ${cleanBody}`;
        }
      }
      axiosOpts += `\n};`;
      return `import axios from 'axios';\n\n${axiosOpts}\n\naxios.request(options).then((response) => {\n  console.log(response.data);\n}).catch((error) => {\n  console.error(error);\n});`;
    }

    case 'python_requests': {
      let pyPayload = '';
      let pyRequestCall = `response = requests.request("${method}", url, headers=headers)`;
      if (hasBody) {
        try {
          const parsed = JSON.parse(cleanBody);
          pyPayload = `payload = ${JSON.stringify(parsed, null, 4).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}\n`;
          pyRequestCall = `response = requests.request("${method}", url, json=payload, headers=headers)`;
        } catch {
          pyPayload = `payload = """${cleanBody}"""\n`;
          pyRequestCall = `response = requests.request("${method}", url, data=payload, headers=headers)`;
        }
      }
      return `import requests\n\nurl = "${url}"\n\n${pyPayload}headers = {\n    "Content-Type": "application/json",\n    "X-API-Key": "${key}"\n}\n\n${pyRequestCall}\n\nprint(response.json())`;
    }

    case 'go_native': {
      let goPayloadInit = 'payload := nil';
      let goReqInit = `req, _ := http.NewRequest("${method}", url, nil)`;
      if (hasBody) {
        goPayloadInit = `payload := strings.NewReader(\`${cleanBody}\`)`;
        goReqInit = `req, _ := http.NewRequest("${method}", url, payload)`;
      }
      return `package main\n\nimport (\n\t"fmt"\n\t"strings"\n\t"net/http"\n\t"io"\n)\n\nfunc main() {\n\turl := "${url}"\n\t${goPayloadInit}\n\n\t${goReqInit}\n\n\treq.Header.Add("Content-Type", "application/json")\n\treq.Header.Add("X-API-Key", "${key}")\n\n\tres, _ := http.DefaultClient.Do(req)\n\n\tdefer res.Body.Close()\n\tbody, _ := io.ReadAll(res.Body)\n\n\tfmt.Println(string(body))\n}`;
    }

    default:
      return '';
  }
};

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
  const [selectedSnippetLang, setSelectedSnippetLang] = useState('curl');
  const [snippetCopied, setSnippetCopied] = useState(false);

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
    } catch {
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
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 text-center text-gray-500 text-xs font-mono">
          No pricing plans defined for this API.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {api.plans.map((plan) => (
          <div 
            key={plan.id}
            className="bg-carbon-900 border border-carbon-border hover:border-electric-cobalt/30 rounded-lg p-6 transition-[border-color,box-shadow] duration-300 flex flex-col justify-between gap-5 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">{plan.name}</h3>
              <div className="text-2xl font-black text-electric-cobalt mt-2 font-mono">
                ${plan.price}
                <span className="text-xs text-gray-500 font-normal font-sans"> /mo</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-4 font-mono flex items-center justify-between bg-carbon-950/50 border border-carbon-border px-3 py-2 rounded-lg">
                <span className="text-gray-550">Rate Limit:</span>
                <span className="text-white font-semibold">{plan.requestsPerMin} req/min</span>
              </div>
            </div>
            
            {user?.role === 'CONSUMER' && (
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribingPlanId === plan.id}
                className="w-full bg-electric-cobalt hover:bg-blue-600 disabled:opacity-50 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-xs transition-all cursor-pointer relative z-10 focus-visible:ring-2 focus-visible:ring-electric-cobalt outline-none uppercase tracking-wider"
              >
                {subscribingPlanId === plan.id ? 'Subscribing…' : 'Subscribe to Tier'}
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const copySnippetToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setSnippetCopied(true);
    addToast('Code snippet copied!', 'success');
    setTimeout(() => setSnippetCopied(false), 2000);
  };

  const renderCodeSnippetGenerator = () => {
    const cleanPath = testPath.startsWith('/') ? testPath.substring(1) : testPath;
    const url = `${gatewayUrl}/api/${api.name}/${cleanPath}`;
    const snippetCode = generateSnippet(selectedSnippetLang, testMethod, url, testApiKey, testBody);

    const languages = [
      { id: 'curl', name: 'cURL' },
      { id: 'js_fetch', name: 'Fetch (JS)' },
      { id: 'js_axios', name: 'Axios (JS)' },
      { id: 'python_requests', name: 'Requests (Py)' },
      { id: 'go_native', name: 'Go HTTP' }
    ];

    return (
      <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-carbon-border pb-4">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">// Client Code Snippets</h3>
            <p className="text-[10px] text-gray-500 mt-1 font-mono">Generate dynamic integration code in multiple languages.</p>
          </div>
          <div className="flex flex-wrap gap-1 bg-carbon-950 p-1 rounded-lg border border-carbon-border">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedSnippetLang(lang.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-semibold cursor-pointer transition-all duration-200 focus-visible:ring-1 focus-visible:ring-electric-cobalt outline-none ${
                  selectedSnippetLang === lang.id
                    ? 'bg-electric-cobalt text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group/code">
          <div className="absolute right-3 top-3 z-10 flex gap-2">
            <button
              onClick={() => copySnippetToClipboard(snippetCode)}
              className="p-2 bg-carbon-950/80 hover:bg-carbon-950 border border-carbon-border text-gray-400 hover:text-white rounded-lg transition-all duration-200 cursor-pointer focus-visible:ring-1 focus-visible:ring-electric-cobalt outline-none flex items-center justify-center"
              aria-label="Copy code snippet"
            >
              {snippetCopied ? <Check className="w-4 h-4 text-emerald-450" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>

          <div className="bg-carbon-950 border border-carbon-border rounded-lg p-4 overflow-x-auto max-h-80 scrollbar-thin font-mono text-xs select-all text-gray-300">
            <pre className="whitespace-pre" translate="no">{snippetCode}</pre>
          </div>
        </div>
      </div>
    );
  };

  const renderPlayground = () => {
    return (
      <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md space-y-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="test-method-select" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">HTTP Method</label>
            <select
              id="test-method-select"
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value)}
              className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 px-3.5 outline-none text-xs cursor-pointer font-mono focus-visible:ring-1 focus-visible:ring-electric-cobalt"
            >
              {((api.allowedMethods && api.allowedMethods.length > 0) ? api.allowedMethods : ['GET', 'POST', 'PUT', 'DELETE']).map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="test-api-key-input" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">X-API-Key Header</label>
              <button 
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-[9px] text-electric-cobalt hover:text-blue-400 font-semibold cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-electric-cobalt rounded px-1 font-mono uppercase"
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
                className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 px-4 outline-none text-xs font-mono placeholder:text-gray-655 focus-visible:ring-1 focus-visible:ring-electric-cobalt"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="test-path-input" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Gateway Request URL</label>
          <div className="flex items-center gap-1.5 bg-carbon-950 border border-carbon-border rounded-lg px-4 py-3 font-mono text-xs overflow-x-auto scrollbar-thin">
            <span className="text-gray-500 select-none shrink-0">{gatewayUrl}/api/{api.name}/</span>
            <input
              id="test-path-input"
              name="testPath"
              type="text"
              placeholder="v1/data-endpoint…"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none border-none p-0 focus:ring-0 text-xs font-mono min-w-[150px] focus-visible:ring-1 focus-visible:ring-electric-cobalt"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        {testMethod !== 'GET' && (
          <div>
            <label htmlFor="test-body-textarea" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Request Body (JSON)</label>
            <textarea
              id="test-body-textarea"
              name="testBody"
              placeholder='{ "query": "hello world…" }'
              value={testBody}
              onChange={(e) => setTestBody(e.target.value)}
              rows={4}
              className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg p-3.5 outline-none text-xs font-mono placeholder:text-gray-655 focus-visible:ring-1 focus-visible:ring-electric-cobalt"
              spellCheck={false}
            />
          </div>
        )}

        <button
          onClick={runTest}
          disabled={testing}
          className="w-full bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 disabled:opacity-50 text-white font-mono font-bold py-3 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.15)] focus-visible:ring-2 focus-visible:ring-electric-cobalt outline-none uppercase tracking-wider"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{testing ? 'Routing Request…' : 'Trigger Proxy Route'}</span>
        </button>

        {testResponse && (
          <div className="space-y-4 border-t border-carbon-border pt-6 animate-fadeIn">
            <div className="flex items-center justify-between text-[10px] font-semibold font-mono uppercase">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Status Code:</span>
                <span className={`px-2.5 py-0.5 rounded ${
                  testResponse.status >= 200 && testResponse.status < 300 
                    ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {testResponse.status} {testResponse.statusText}
                </span>
              </div>
              <div>
                <span className="text-gray-550">Roundtrip:</span> <span className="text-solar-amber font-bold">{testResponse.latency}ms</span>
              </div>
            </div>

            <div className="bg-carbon-950 border border-carbon-border rounded-lg p-4 overflow-x-auto max-h-80 scrollbar-thin relative font-mono text-xs">
              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-2 font-mono">// Gateway Response Body</div>
              <pre className="text-emerald-450 select-all leading-relaxed whitespace-pre-wrap">{JSON.stringify(testResponse.data, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-electric-cobalt border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-xs font-mono">Loading API specifications…</p>
      </div>
    );
  }

  if (!api) {
    return (
      <div className="text-center py-12 bg-carbon-950 text-white font-mono">
        <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">// API Not Found</h3>
        <p className="text-gray-450 mt-2 text-xs">The API you are looking for does not exist or has been removed.</p>
        <Link to="/marketplace" className="inline-block mt-4 text-electric-cobalt hover:underline text-xs font-bold uppercase tracking-wider transition-colors focus-visible:ring-1 focus-visible:ring-electric-cobalt rounded px-1">Back to Marketplace</Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 relative animate-fadeIn">
      <div>
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-wider cursor-pointer group focus-visible:ring-1 focus-visible:ring-electric-cobalt rounded px-1">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Marketplace</span>
        </Link>
      </div>

      {/* API Intro block */}
      <div className="bg-carbon-900 border border-carbon-border rounded-lg p-8 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-100 pointer-events-none" />
        <div className="flex items-start gap-5 relative z-10">
          <div className="w-14 h-14 bg-electric-cobalt/10 border border-electric-cobalt/20 rounded-lg flex items-center justify-center text-electric-cobalt shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white font-display uppercase tracking-wide">{api.name}</h1>
            <p className="text-gray-400 mt-2 max-w-2xl text-xs font-mono leading-relaxed">{api.description || 'No description provided.'}</p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[10px] font-mono uppercase">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Gateway Route:</span>
                <span className="text-solar-amber font-semibold bg-carbon-950 border border-carbon-border px-2 py-0.5 rounded" translate="no">
                  /api/{api.name}
                </span>
              </div>
              {api.upstreamUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Upstream Destination:</span>
                  <span className="text-gray-300 bg-carbon-950 border border-carbon-border px-2 py-0.5 rounded" translate="no">
                    {api.upstreamUrl}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Allowed Methods:</span>
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

        {api.exampleDocs && (
          <div className="relative z-10 shrink-0 self-start md:self-center">
            <a
              href={`/apis/${api.id}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold rounded-lg text-xs transition-all cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.15)] focus-visible:ring-2 focus-visible:ring-electric-cobalt outline-none uppercase tracking-wider"
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
          <div className="flex items-center gap-2 pb-2 border-b border-carbon-border">
            <CreditCard className="w-5 h-5 text-electric-cobalt" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">// Pricing Tiers</h2>
          </div>
          {renderPlans()}
        </div>

        {/* Playground Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-carbon-border">
            <Terminal className="w-5 h-5 text-electric-cobalt" />
            <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">// Gateway Playground</h2>
          </div>
          {renderPlayground()}
          {renderCodeSnippetGenerator()}
        </div>
      </div>
    </div>

    {apiKeyModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
        <div className="w-full max-w-lg bg-carbon-900 border border-carbon-border rounded-lg p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative z-10">
          <div className="flex items-center gap-3 text-solar-amber mb-4 pb-2 border-b border-carbon-border">
            <AlertTriangle className="w-7 h-7 shrink-0 text-solar-amber animate-pulse" />
            <h2 className="text-base font-bold text-white font-display uppercase tracking-wide">// One-Time Secure Key Delivery</h2>
          </div>
          
          <p className="text-xs text-gray-400 mb-6 leading-relaxed font-mono">
            Below is the raw API key for this subscription. To protect your backend, ApexGateway hashes this key and **will never display it to you again**. Please copy and store it securely now.
          </p>

          <div className="flex items-center gap-2 bg-carbon-950 border border-carbon-border rounded-lg p-3.5 font-mono text-xs text-white mb-6 select-all">
            <span className="flex-1 break-all pr-2 tracking-wide font-semibold text-solar-amber">{apiKeyModal.apiKey}</span>
            <button
              onClick={copyToClipboard}
              className="shrink-0 p-2 bg-electric-cobalt/10 hover:bg-electric-cobalt/20 border border-electric-cobalt/30 text-electric-cobalt rounded-lg transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-electric-cobalt outline-none"
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
            className="w-full bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-3 px-4 rounded-lg text-xs transition-all cursor-pointer shadow-[0_2px_10px_rgba(59,130,246,0.15)] text-center focus-visible:ring-2 focus-visible:ring-electric-cobalt outline-none uppercase tracking-wider"
          >
            I have saved it, close modal
          </button>
        </div>
      </div>
    )}
  </>
);
}
