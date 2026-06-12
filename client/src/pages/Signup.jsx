import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { UserPlus, Mail, Lock, Shield, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('CONSUMER');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const signUpUser = useAuthStore((state) => state.signUp);
  const addToast = useUIStore((state) => state.addToast);

  const validateForm = () => {
    if (!email) {
      addToast('Email is required', 'error');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      addToast('Please enter a valid email address', 'error');
      return false;
    }
    if (!password) {
      addToast('Password is required', 'error');
      return false;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return false;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await signUpUser(email, password, role);
      if (error) {
        addToast(error.message || 'Signup failed. Please try again.', 'error');
      } else {
        // If Supabase sends confirmation email or directly logs in:
        if (data.session) {
          addToast('Account created and logged in!', 'success');
          if (role === 'PROVIDER') {
            navigate('/dashboard/provider/apis');
          } else {
            navigate('/marketplace');
          }
        } else {
          addToast('Signup successful! Check your email to confirm your account.', 'success');
          navigate('/login');
        }
      }
    } catch (err) {
      addToast('An unexpected error occurred during signup.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark relative overflow-hidden px-4">
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 bg-grid-mask pointer-events-none z-0"></div>

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-[120px] pulse-glow z-0" style={{ animationDelay: '-2s' }}></div>

      <div className="w-full max-w-md bg-card-dark/40 border border-border-dark backdrop-blur-xl rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10 gradient-border-glow">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2 mb-4 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] font-display text-sm group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-extrabold text-white text-base tracking-wider font-display">APEX</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1 font-display">Create Account</h1>
          <p className="text-xs text-gray-400 text-center">Join the secure developer marketplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-display">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@apex.io"
                className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2 pl-11 pr-4 outline-none transition-all placeholder:text-gray-600 text-xs font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-display">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2 pl-11 pr-11 outline-none transition-all placeholder:text-gray-600 text-xs font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-display">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2 pl-11 pr-11 outline-none transition-all placeholder:text-gray-600 text-xs font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 font-display">Developer Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CONSUMER')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'CONSUMER'
                    ? 'bg-primary-500/10 border-primary-500/50 text-primary-400 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-display'
                    : 'bg-bg-dark/30 border-border-dark text-gray-500 hover:border-primary-500/25 hover:text-gray-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="font-display">Consume APIs</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('PROVIDER')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'PROVIDER'
                    ? 'bg-primary-500/10 border-primary-500/50 text-primary-400 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-display'
                    : 'bg-bg-dark/30 border-border-dark text-gray-500 hover:border-primary-500/25 hover:text-gray-300'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span className="font-display">Publish APIs</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-xs mt-2 font-display"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 font-sans">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-bold transition-colors underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
