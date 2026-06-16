import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.login);
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
      addToast('Password must be at least 6 characters', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await loginUser(email, password);
      if (error) {
        addToast(error.message || 'Invalid email or password', 'error');
      } else {
        addToast('Welcome back!', 'success');
        const user = useAuthStore.getState().user;
        if (user?.role === 'PROVIDER') {
          navigate('/dashboard/provider/apis');
        } else {
          navigate('/marketplace');
        }
      }
    } catch {
      addToast('Authentication failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-carbon-950 relative overflow-hidden px-4">
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 bg-grid-mask pointer-events-none z-0"></div>
 
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-cobalt/5 rounded-full blur-[120px] z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-solar-amber/5 rounded-full blur-[120px] z-0"></div>
 
      <div className="w-full max-w-md bg-carbon-900 border border-carbon-border backdrop-blur-xl rounded-lg p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 mb-6 group">
            <img src="/icons.png" alt="ApexGateway Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-white text-sm tracking-wider font-display uppercase">APEX GATEWAY</span>
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight text-white mb-2 font-display uppercase">Welcome Back</h1>
          <p className="text-[10px] text-gray-400 text-center font-mono">Sign in to your ApexGateway developer portal.</p>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@apex.io"
                className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 pl-11 pr-4 outline-none transition-all placeholder:text-gray-650 text-xs font-mono"
              />
            </div>
          </div>
 
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="login-password" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" className="text-[9px] font-mono font-bold text-electric-cobalt hover:text-blue-400 transition-colors uppercase tracking-wider">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2.5 pl-11 pr-11 outline-none transition-all placeholder:text-gray-650 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
 
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-xs tracking-wider uppercase mt-2 shadow-[0_2px_10px_rgba(59,130,246,0.15)]"
          >
            <span>{loading ? 'Authenticating…' : 'Sign In to Portal'}</span>
            <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
 
        <div className="mt-8 text-center text-[10px] text-gray-500 font-mono">
          New to ApexGateway?{' '}
          <Link to="/signup" className="text-solar-amber hover:text-amber-400 font-bold transition-colors underline underline-offset-4">
            Create Developer Account
          </Link>
        </div>
      </div>
    </div>
  );
}
