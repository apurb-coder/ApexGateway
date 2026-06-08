import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const defaultPath = user.role === 'PROVIDER' 
      ? '/dashboard/provider/apis' 
      : '/marketplace';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
}
