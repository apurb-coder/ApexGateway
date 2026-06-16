import { useAuthStore } from '../store/useAuthStore';
import { Mail, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-carbon-border pb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white font-display uppercase">Profile Settings</h1>
        <p className="text-gray-400 mt-1 text-xs font-mono">Manage your account details and developer preferences.</p>
      </div>

      <div className="bg-carbon-900 border border-carbon-border rounded-lg p-6 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient from-electric-cobalt/5 via-transparent to-transparent opacity-100 pointer-events-none" />
        <h2 className="text-sm font-bold text-white mb-6 font-mono uppercase tracking-widest relative z-10">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="flex items-center gap-4 p-4 bg-carbon-950/40 border border-carbon-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-electric-cobalt/10 border border-electric-cobalt/20 flex items-center justify-center text-electric-cobalt">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] text-gray-550 font-mono font-bold uppercase tracking-widest">Email Address</div>
              <div className="text-xs font-mono font-semibold text-white mt-0.5">{user?.email || 'N/A'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-carbon-950/40 border border-carbon-border rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-electric-cobalt/10 border border-electric-cobalt/20 flex items-center justify-center text-electric-cobalt">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[9px] text-gray-550 font-mono font-bold uppercase tracking-widest">Account Role</div>
              <div className="text-xs font-mono font-semibold text-white mt-0.5">{user?.role || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
