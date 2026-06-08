import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useUIStore } from '../store/useUIStore';
import { UserPlus, Mail, Lock, Shield, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CONSUMER');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', { email, password, role });
      addToast('Registration successful! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      // API interceptor will show the toast for server errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden px-4">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] pulse-glow" style={{ animationDelay: '-2s' }}></div>

      <div className="w-full max-w-md bg-card-dark/60 border border-border-dark backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-500/20 border border-primary-500/40 rounded-xl flex items-center justify-center text-primary-400 mb-4 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create an account</h1>
          <p className="text-sm text-gray-400 text-center">Join ApexGateway Dev Portal to build, deploy, or consume APIs.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@apex.io"
                className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 pl-11 pr-4 outline-none transition-all placeholder:text-gray-600 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-dark/50 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 pl-11 pr-4 outline-none transition-all placeholder:text-gray-600 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('CONSUMER')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'CONSUMER'
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'bg-bg-dark/30 border-border-dark text-gray-400 hover:border-border-hover'
                }`}
              >
                <Shield className="w-5 h-5 mb-1" />
                <span>Consume APIs</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('PROVIDER')}
                className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'PROVIDER'
                    ? 'bg-primary-500/10 border-primary-500 text-primary-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'bg-bg-dark/30 border-border-dark text-gray-400 hover:border-border-hover'
                }`}
              >
                <UserPlus className="w-5 h-5 mb-1" />
                <span>Publish APIs</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.45)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-sm"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
