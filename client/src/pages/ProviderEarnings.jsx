import { useState, useEffect } from 'react';
import { DollarSign, Landmark, RefreshCw, Filter, Search, TrendingUp, ShieldCheck } from 'lucide-react';
import apiClient from '../services/api';

export default function ProviderEarnings() {
  const [data, setData] = useState({
    grossEarnings: 0,
    totalWithdrawn: 0,
    balance: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApi, setSelectedApi] = useState('ALL');

  const fetchEarnings = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await apiClient.get('/payments/earnings');
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch earnings ledger:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(val));
  };

  // Get list of unique APIs for the filter dropdown
  const apis = ['ALL', ...new Set(data.transactions.map(t => t.subscription?.plan?.api?.name).filter(Boolean))];

  const filteredTransactions = data.transactions.filter(tx => {
    const apiName = tx.subscription?.plan?.api?.name || '';
    const planName = tx.subscription?.plan?.name || '';
    const consumerEmail = tx.subscription?.consumer?.email || '';
    
    const matchesSearch = 
      consumerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apiName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.stripePaymentId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApi = selectedApi === 'ALL' || apiName === selectedApi;

    return matchesSearch && matchesApi;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-carbon-border pb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">Financial Earnings</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">View your gross earnings, withdrawals, and balance sheet ledger.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-carbon-900/40 border border-carbon-border rounded-lg p-6 h-32 animate-pulse" />
          ))}
        </div>
        <div className="bg-carbon-900/40 border border-carbon-border rounded-lg p-6 h-80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-carbon-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">Financial Earnings</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">View your gross earnings, withdrawals, and balance sheet ledger.</p>
        </div>
        <button
          onClick={() => fetchEarnings(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-electric-cobalt/10 hover:bg-electric-cobalt/20 border border-electric-cobalt/30 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Finance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gross Earnings */}
        <div className="bg-carbon-900/40 border border-carbon-border hover:border-carbon-border/70 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">Gross Earnings</span>
            <div className="w-8 h-8 rounded-lg bg-electric-cobalt/10 border border-electric-cobalt/20 flex items-center justify-center text-electric-cobalt">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {formatCurrency(data.grossEarnings)}
          </div>
          <div className="text-[9px] text-gray-500 mt-2 font-mono flex items-center gap-1 relative z-10">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>100% commission rate</span>
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-carbon-900/40 border border-carbon-border hover:border-carbon-border/70 rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">Total Withdrawn</span>
            <div className="w-8 h-8 rounded-lg bg-solar-amber/10 border border-solar-amber/20 flex items-center justify-center text-solar-amber">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {formatCurrency(data.totalWithdrawn)}
          </div>
          <div className="text-[9px] text-gray-500 mt-2 font-mono relative z-10">
            Approved Payouts
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-carbon-900/50 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)] hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] rounded-lg p-6 backdrop-blur-md relative overflow-hidden group transition-all duration-300">
          <div className="absolute inset-0 bg-radial-gradient from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="flex items-center justify-between text-gray-400 relative z-10">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-4 font-display tracking-wide relative z-10">
            {formatCurrency(data.balance)}
          </div>
          <div className="text-[9px] text-emerald-400 mt-2 font-mono relative z-10">
            Ready to withdraw
          </div>
        </div>
      </div>

      {/* Sales Ledger */}
      <div className="bg-carbon-900 border border-carbon-border rounded-lg overflow-hidden backdrop-blur-md">
        <div className="p-6 border-b border-carbon-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-electric-cobalt" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Recent Sales Ledger</h3>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search ledger..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-4 py-1.5 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-electric-cobalt transition-all"
              />
            </div>

            {/* API Dropdown Filter */}
            <div className="relative flex items-center bg-carbon-950 border border-carbon-border rounded-lg px-2 text-xs font-mono">
              <Filter className="w-3.5 h-3.5 text-gray-500 mr-2" />
              <select
                value={selectedApi}
                onChange={(e) => setSelectedApi(e.target.value)}
                className="bg-transparent text-white py-1.5 pr-6 focus:outline-none cursor-pointer appearance-none"
              >
                {apis.map(api => (
                  <option key={api} value={api} className="bg-carbon-950 text-white">
                    {api === 'ALL' ? 'Filter: All' : api}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-carbon-border bg-carbon-950/50 text-gray-450">
                <th className="p-4 font-bold uppercase tracking-wider">Consumer Email</th>
                <th className="p-4 font-bold uppercase tracking-wider">API & Plan</th>
                <th className="p-4 font-bold uppercase tracking-wider">Price Paid</th>
                <th className="p-4 font-bold uppercase tracking-wider">Stripe Ref</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Received Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-carbon-border/50 text-gray-300">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const apiName = tx.subscription?.plan?.api?.name || 'Unknown API';
                  const planName = tx.subscription?.plan?.name || 'Unknown Plan';
                  const email = tx.subscription?.consumer?.email || 'N/A';
                  return (
                    <tr key={tx.id} className="hover:bg-carbon-800/20 transition-colors">
                      <td className="p-4 font-semibold text-white">{email}</td>
                      <td className="p-4">
                        <span className="text-emerald-450 font-bold">{apiName}</span>
                        <span className="text-gray-500 ml-1.5">({planName})</span>
                      </td>
                      <td className="p-4 text-solar-amber font-bold">{formatCurrency(tx.amount)}</td>
                      <td className="p-4 text-[10px] text-gray-500">{tx.stripePaymentId || 'N/A'}</td>
                      <td className="p-4 text-right text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
