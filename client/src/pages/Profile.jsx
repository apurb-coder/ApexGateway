import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="border-b border-border-dark pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-display">Profile Settings</h1>
        <p className="text-gray-400 mt-1 text-sm">Manage your account details and developer preferences.</p>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
        <h2 className="text-lg font-bold text-white mb-6 font-display relative z-10">Account Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="flex items-center gap-4 p-4 bg-bg-dark/40 border border-border-dark rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-display">Email Address</div>
              <div className="text-sm font-semibold text-white mt-0.5">{user?.email || 'N/A'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-bg-dark/40 border border-border-dark rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-display">Account Role</div>
              <div className="text-sm font-semibold text-white mt-0.5">{user?.role || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-radial-gradient from-primary-500/5 via-transparent to-transparent opacity-100 pointer-events-none" />
        <h2 className="text-lg font-bold text-white mb-4 font-display relative z-10">API Token Usage</h2>
        <p className="text-xs text-gray-400 mb-6 relative z-10 leading-relaxed">
          All requests made to upstream services through ApexGateway require your personal API client token or subscription API key.
        </p>
        <div className="p-4 bg-bg-dark/60 border border-border-dark rounded-xl font-mono text-xs text-gray-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
          <span>Role Capability Matrix:</span>
          <span className="text-primary-400 font-semibold uppercase">{user?.role === 'PROVIDER' ? 'Manage APIs & View Consumers' : 'Subscribe & Request Gateway APIs'}</span>
        </div>
      </div>
    </div>
  );
}
