import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function PublicRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark text-white">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-gray-400 font-display uppercase tracking-widest animate-pulse">Loading Session...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'PROVIDER') {
      return <Navigate to="/dashboard/provider/apis" replace />;
    }
    return <Navigate to="/marketplace" replace />;
  }

  return children;
}
