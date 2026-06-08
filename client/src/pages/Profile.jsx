import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Shield, User } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account details and developer preferences.</p>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-4 bg-bg-dark/40 border border-border-dark rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">Email Address</div>
              <div className="text-sm font-medium text-white">{user?.email || 'N/A'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-bg-dark/40 border border-border-dark rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">Account Role</div>
              <div className="text-sm font-medium text-white">{user?.role || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card-dark/40 border border-border-dark rounded-2xl p-6 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-white mb-4">API Token Usage</h2>
        <p className="text-sm text-gray-400 mb-4">
          All requests made to upstream services through ApexGateway require your personal API client token or subscription API key.
        </p>
        <div className="p-4 bg-bg-dark/60 border border-border-dark rounded-xl font-mono text-xs text-gray-400 flex items-center justify-between">
          <span>Role Capability Matrix:</span>
          <span className="text-primary-400 font-semibold uppercase">{user?.role === 'PROVIDER' ? 'Manage APIs & View Consumers' : 'Subscribe & Request Gateway APIs'}</span>
        </div>
      </div>
    </div>
  );
}
