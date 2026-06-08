import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    const defaultPath = user?.role === 'PROVIDER' 
      ? '/dashboard/provider/apis' 
      : '/marketplace';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
}
