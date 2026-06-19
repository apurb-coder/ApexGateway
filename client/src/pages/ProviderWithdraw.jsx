import { useState, useEffect } from 'react';
import { Landmark, CreditCard, Mail, DollarSign, RefreshCw, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';

export default function ProviderWithdraw() {
  const [balanceData, setBalanceData] = useState({
    balance: 0,
    withdrawals: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [payoutMethod, setPayoutMethod] = useState('BANK_TRANSFER');
  const [amount, setAmount] = useState('');
  
  // Payout detail states
  const [stripeEmail, setStripeEmail] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [accountName, setAccountName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const { addToast } = useUIStore();

  const fetchBalanceData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await apiClient.get('/payments/earnings');
      setBalanceData({
        balance: res.data.balance,
        withdrawals: res.data.withdrawals || []
      });
    } catch (err) {
      console.error('Failed to fetch financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const handleWithdrawAll = () => {
    setAmount(balanceData.balance.toFixed(2));
  };

  const validateForm = () => {
    const valAmount = Number(amount);
    if (isNaN(valAmount) || valAmount <= 0) {
      addToast('Please enter a valid withdrawal amount greater than $0', 'error');
      return false;
    }
    if (valAmount > balanceData.balance) {
      addToast(`Insufficient balance. You can only withdraw up to ${formatCurrency(balanceData.balance)}`, 'error');
      return false;
    }

    if (payoutMethod === 'STRIPE_DIRECT') {
      if (!stripeEmail || !stripeEmail.includes('@')) {
        addToast('Please enter a valid Stripe account email', 'error');
        return false;
      }
    } else if (payoutMethod === 'PAYPAL') {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        addToast('Please enter a valid PayPal email', 'error');
        return false;
      }
    } else if (payoutMethod === 'BANK_TRANSFER') {
      if (!accountName.trim()) {
        addToast('Account holder name is required', 'error');
        return false;
      }
      if (!/^\d{9}$/.test(routingNumber)) {
        addToast('Routing number must be exactly 9 digits', 'error');
        return false;
      }
      if (!accountNumber.trim() || accountNumber.length < 4) {
        addToast('Please enter a valid bank account number', 'error');
        return false;
      }
    }
    return true;
  };

  const handleInitiateWithdrawal = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      let payoutDetails = {};
      if (payoutMethod === 'STRIPE_DIRECT') {
        payoutDetails = { stripeEmail };
      } else if (payoutMethod === 'PAYPAL') {
        payoutDetails = { paypalEmail };
      } else if (payoutMethod === 'BANK_TRANSFER') {
        payoutDetails = { accountName, routingNumber, accountNumber };
      }

      await apiClient.post('/payments/withdraw', {
        amount: Number(amount),
        payoutMethod,
        payoutDetails
      });

      addToast('Withdrawal request submitted successfully!', 'success');
      setAmount('');
      // Reset details fields partially
      fetchBalanceData(true);
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to submit withdrawal request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(val));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'APPROVED':
        return 'bg-electric-cobalt/10 text-electric-cobalt border-electric-cobalt/20';
      case 'PENDING':
        return 'bg-solar-amber/10 text-solar-amber border-solar-amber/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-450 border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="border-b border-carbon-border pb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">Withdraw Payouts</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">Transfer your available earnings balance to your financial account.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-carbon-900/40 border border-carbon-border rounded-lg p-6 h-96 animate-pulse" />
          <div className="bg-carbon-900/40 border border-carbon-border rounded-lg p-6 h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-carbon-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">Withdraw Payouts</h1>
          <p className="text-gray-400 mt-1 text-xs font-mono">Transfer your available earnings balance to your financial account.</p>
        </div>
        <button
          onClick={() => fetchBalanceData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-electric-cobalt/10 hover:bg-electric-cobalt/20 border border-electric-cobalt/30 text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-[9px] font-mono text-gray-500 uppercase tracking-widest pointer-events-none">
              Balance: <span className="text-emerald-450 font-bold">{formatCurrency(balanceData.balance)}</span>
            </div>

            <form onSubmit={handleInitiateWithdrawal} className="space-y-6">
              {/* Available Balance display */}
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-450 block mb-1">Available Balance</span>
                <div className="text-3xl font-black text-white font-display tracking-wide flex items-center gap-1.5">
                  <span className="text-emerald-450">{formatCurrency(balanceData.balance)}</span>
                  <span className="text-xs text-gray-500 font-mono font-normal tracking-normal uppercase">Ready to Transfer</span>
                </div>
              </div>

              {/* 1. Select Payout Method */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">1. Select Payout Method</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Bank Transfer ACH */}
                  <label className={`flex flex-col items-center justify-center p-4 rounded-lg border text-center cursor-pointer transition-all duration-200 group ${
                    payoutMethod === 'BANK_TRANSFER' 
                      ? 'bg-electric-cobalt/10 border-electric-cobalt text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                      : 'bg-carbon-950 border-carbon-border text-gray-400 hover:text-white hover:border-carbon-border/70'
                  }`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="BANK_TRANSFER"
                      checked={payoutMethod === 'BANK_TRANSFER'}
                      onChange={() => setPayoutMethod('BANK_TRANSFER')}
                      className="sr-only"
                    />
                    <Landmark className={`w-6 h-6 mb-2 transition-transform group-hover:scale-105 ${payoutMethod === 'BANK_TRANSFER' ? 'text-electric-cobalt' : 'text-gray-500'}`} />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Bank Transfer (ACH)</span>
                  </label>

                  {/* Stripe Direct */}
                  <label className={`flex flex-col items-center justify-center p-4 rounded-lg border text-center cursor-pointer transition-all duration-200 group ${
                    payoutMethod === 'STRIPE_DIRECT' 
                      ? 'bg-electric-cobalt/10 border-electric-cobalt text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                      : 'bg-carbon-950 border-carbon-border text-gray-400 hover:text-white hover:border-carbon-border/70'
                  }`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="STRIPE_DIRECT"
                      checked={payoutMethod === 'STRIPE_DIRECT'}
                      onChange={() => setPayoutMethod('STRIPE_DIRECT')}
                      className="sr-only"
                    />
                    <CreditCard className={`w-6 h-6 mb-2 transition-transform group-hover:scale-105 ${payoutMethod === 'STRIPE_DIRECT' ? 'text-electric-cobalt' : 'text-gray-500'}`} />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">Stripe Direct</span>
                  </label>

                  {/* PayPal */}
                  <label className={`flex flex-col items-center justify-center p-4 rounded-lg border text-center cursor-pointer transition-all duration-200 group ${
                    payoutMethod === 'PAYPAL' 
                      ? 'bg-electric-cobalt/10 border-electric-cobalt text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                      : 'bg-carbon-950 border-carbon-border text-gray-400 hover:text-white hover:border-carbon-border/70'
                  }`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="PAYPAL"
                      checked={payoutMethod === 'PAYPAL'}
                      onChange={() => setPayoutMethod('PAYPAL')}
                      className="sr-only"
                    />
                    <Mail className={`w-6 h-6 mb-2 transition-transform group-hover:scale-105 ${payoutMethod === 'PAYPAL' ? 'text-electric-cobalt' : 'text-gray-500'}`} />
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">PayPal Account</span>
                  </label>
                </div>
              </div>

              {/* 2. Payout Details Form Inputs */}
              <div className="space-y-4 pt-2 border-t border-carbon-border/50">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block">2. Payout Details</span>
                
                {payoutMethod === 'STRIPE_DIRECT' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-450">Stripe Account Email</label>
                    <input
                      type="email"
                      required
                      placeholder="email@stripe.com"
                      value={stripeEmail}
                      onChange={(e) => setStripeEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-electric-cobalt transition-all"
                    />
                  </div>
                )}

                {payoutMethod === 'PAYPAL' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-450">PayPal Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="email@paypal.com"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-electric-cobalt transition-all"
                    />
                  </div>
                )}

                {payoutMethod === 'BANK_TRANSFER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[10px] font-mono uppercase text-gray-450">Account Holder Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-electric-cobalt transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-gray-450">Routing Number (9 Digits)</label>
                      <input
                        type="text"
                        required
                        maxLength={9}
                        placeholder="121000248"
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2.5 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-electric-cobalt transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-gray-450">Account Number</label>
                      <input
                        type="text"
                        required
                        placeholder="************8921"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-electric-cobalt transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Withdrawal Amount */}
              <div className="space-y-3 pt-2 border-t border-carbon-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">3. Withdrawal Amount</span>
                  <button
                    type="button"
                    onClick={handleWithdrawAll}
                    disabled={balanceData.balance <= 0}
                    className="text-[10px] font-mono font-bold text-emerald-450 hover:text-emerald-400 hover:underline uppercase transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Withdraw 100%
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-450 font-bold font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={balanceData.balance}
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-carbon-950 border border-carbon-border rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-electric-cobalt transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || balanceData.balance <= 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-electric-cobalt hover:bg-electric-cobalt-hover border border-electric-cobalt-hover text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-4"
              >
                <span>{submitting ? 'Processing Request...' : 'Initiate Withdrawal Request'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Withdrawal History Side Panel */}
        <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <Landmark className="w-5 h-5 text-electric-cobalt" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Payout History</h3>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {balanceData.withdrawals.length > 0 ? (
              balanceData.withdrawals.map((withdraw) => {
                const formattedDate = new Date(withdraw.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: '2-digit'
                });
                
                const methodLabel = 
                  withdraw.payoutMethod === 'BANK_TRANSFER' ? 'Bank ACH' :
                  withdraw.payoutMethod === 'STRIPE_DIRECT' ? 'Stripe' : 'PayPal';

                return (
                  <div key={withdraw.id} className="bg-carbon-950 border border-carbon-border/50 rounded-lg p-4 flex flex-col gap-2 hover:border-carbon-border transition-all">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-400">{formattedDate}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getStatusBadgeClass(withdraw.status)}`}>
                        {withdraw.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="text-white font-semibold">{methodLabel}</div>
                        <div className="text-[10px] text-gray-500">
                          {withdraw.payoutMethod === 'BANK_TRANSFER' && withdraw.payoutDetails?.accountNumber 
                            ? `Acc: *${withdraw.payoutDetails.accountNumber.slice(-4)}`
                            : withdraw.payoutMethod === 'STRIPE_DIRECT' 
                            ? withdraw.payoutDetails?.stripeEmail
                            : withdraw.payoutDetails?.paypalEmail || ''}
                        </div>
                      </div>
                      <div className="text-solar-amber font-black text-sm">
                        {formatCurrency(withdraw.amount)}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs font-mono">
                No payout requests made yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
