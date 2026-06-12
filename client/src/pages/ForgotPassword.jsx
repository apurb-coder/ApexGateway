import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const forgotPasswordUser = useAuthStore((state) => state.forgotPassword);
  const addToast = useUIStore((state) => state.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      addToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await forgotPasswordUser(email);
      if (error) {
        addToast(error.message || 'Failed to send recovery email', 'error');
      } else {
        setSubmitted(true);
        addToast('Password reset link sent to your email!', 'success');
      }
    } catch (err) {
      addToast('An unexpected error occurred.', 'error');
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
          <Link to="/" className="flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.35)] font-display text-sm group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-extrabold text-white text-base tracking-wider font-display">APEX</span>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2 font-display">Reset Password</h1>
          <p className="text-xs text-gray-400 text-center">
            {submitted 
              ? "We've sent a link to recover access to your account." 
              : "Enter your email address to receive a password reset link."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 font-display">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@apex.io"
                  className="w-full bg-bg-dark/60 border border-border-dark focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white rounded-xl py-2.5 pl-11 pr-4 outline-none transition-all placeholder:text-gray-600 text-xs font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl shadow-[0_4px_15px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-xs mt-2"
            >
              <span>{loading ? 'Sending Request...' : 'Send Reset Link'}</span>
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/10 text-primary-400 mb-2">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs text-gray-400 font-sans leading-relaxed">
              Check your inbox at <span className="text-white font-semibold">{email}</span> for a secure password reset link.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-gray-500 font-sans">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 font-bold transition-colors underline underline-offset-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
