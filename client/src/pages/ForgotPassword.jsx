import { useState } from 'react';
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
    } catch {
      addToast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carbon-950 relative overflow-hidden px-4">
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 bg-grid-mask pointer-events-none z-0"></div>

      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-cobalt/5 rounded-full blur-[120px] pulse-glow z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-solar-amber/5 rounded-full blur-[120px] pulse-glow z-0" style={{ animationDelay: '-2s' }}></div>

      <div className="w-full max-w-md bg-carbon-900 border border-carbon-border backdrop-blur-xl rounded-lg p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2.5 mb-6 group">
            <img src="/icons.png" alt="ApexGateway Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-white text-sm tracking-wider font-display uppercase">APEX GATEWAY</span>
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight text-white mb-2 font-display uppercase">Reset Password</h1>
          <p className="text-[10px] text-gray-400 text-center font-mono">
            {submitted 
              ? "We've sent a link to recover access to your account." 
              : "Enter your email address to receive a password reset link."}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="forgot-email" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  spellCheck="false"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@apex.io"
                  className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 pl-11 pr-4 outline-none transition-all placeholder:text-gray-655 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-xs tracking-wider uppercase mt-2 shadow-[0_2px_10px_rgba(59,130,246,0.15)]"
            >
              <span>{loading ? 'Sending Request…' : 'Send Reset Link'}</span>
              <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-electric-cobalt/10 border border-electric-cobalt/20 text-electric-cobalt mb-2">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
              Check your inbox at <span className="text-white font-semibold">{email}</span> for a secure password reset link.
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-solar-amber hover:text-amber-400 font-bold transition-colors underline underline-offset-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
