import { useState } from 'react';
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
    } catch {
      addToast('An unexpected error occurred during signup.', 'error');
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
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group">
            <img src="/icons.png" alt="ApexGateway Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-white text-sm tracking-wider font-display uppercase">APEX GATEWAY</span>
          </Link>
          <h1 className="text-xl font-extrabold tracking-tight text-white mb-1 font-display uppercase">// Create Account</h1>
          <p className="text-[10px] text-gray-400 text-center font-mono">Join the secure developer marketplace.</p>
        </div>
 
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="signup-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@apex.io"
                className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2 pl-11 pr-4 outline-none transition-all placeholder:text-gray-655 text-xs font-mono"
              />
            </div>
          </div>
 
          <div>
            <label htmlFor="signup-password" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2 pl-11 pr-11 outline-none transition-all placeholder:text-gray-655 text-xs font-mono"
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
 
          <div>
            <label htmlFor="signup-confirm-password" className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-carbon-950 border border-carbon-border focus:border-electric-cobalt text-white rounded-lg py-2 pl-11 pr-11 outline-none transition-all placeholder:text-gray-655 text-xs font-mono"
              />
            </div>
          </div>
 
          <div>
            <label className="block text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1.5">Developer Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('CONSUMER')}
                className={`py-2 px-3 rounded-lg border text-[11px] font-mono font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'CONSUMER'
                    ? 'bg-electric-cobalt/10 border-electric-cobalt text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'bg-carbon-950 border-carbon-border text-gray-550 hover:border-electric-cobalt/25 hover:text-gray-300'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Consume APIs</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('PROVIDER')}
                className={`py-2 px-3 rounded-lg border text-[11px] font-mono font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  role === 'PROVIDER'
                    ? 'bg-electric-cobalt/10 border-electric-cobalt text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'bg-carbon-950 border-carbon-border text-gray-550 hover:border-electric-cobalt/25 hover:text-gray-300'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Publish APIs</span>
              </button>
            </div>
          </div>
 
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-electric-cobalt hover:bg-blue-600 border border-electric-cobalt hover:border-blue-500 text-white font-mono font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-xs tracking-wider uppercase mt-2 shadow-[0_2px_10px_rgba(59,130,246,0.15)]"
          >
            <span>{loading ? 'Creating Account…' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
 
        <div className="mt-6 text-center text-[10px] text-gray-500 font-mono">
          Already have an account?{' '}
          <Link to="/login" className="text-solar-amber hover:text-amber-400 font-bold transition-colors underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
