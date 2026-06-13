import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import DashboardLayout from './layouts/DashboardLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Marketplace from './pages/Marketplace';
import ApiDetails from './pages/ApiDetails';
import ApiDocs from './pages/ApiDocs';
import ConsumerKeys from './pages/ConsumerKeys';
import ProviderAnalytics from './pages/ProviderAnalytics';
import ProviderApis from './pages/ProviderApis';
import NewApi from './pages/NewApi';
import NewPlan from './pages/NewPlan';
import ApiHealth from './pages/ApiHealth';
import ApiConsumers from './pages/ApiConsumers';
import Profile from './pages/Profile';
import Landing from './pages/Landing';

function DashboardRedirect() {
  const { user } = useAuthStore();
  if (user?.role === 'PROVIDER') {
    return <Navigate to="/dashboard/provider/apis" replace />;
  }
  return <Navigate to="/marketplace" replace />;
}


export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initAuth]);

  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />
        
        {/* Dashboard Entry Redirector */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Authentication Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <ResetPassword />
          } 
        />

        <Route 
          path="/apis/:apiId/docs" 
          element={
            <ProtectedRoute>
              <ApiDocs />
            </ProtectedRoute>
          } 
        />

        {/* Protected Dashboard Layout Group */}
        <Route 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route 
            path="marketplace" 
            element={
              <ProtectedRoute allowedRoles={['CONSUMER']}>
                <Marketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="apis/:apiId" 
            element={
              <ProtectedRoute allowedRoles={['CONSUMER']}>
                <ApiDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/consumer/keys" 
            element={
              <ProtectedRoute allowedRoles={['CONSUMER']}>
                <ConsumerKeys />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/provider/analytics" 
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderAnalytics />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="dashboard/provider/apis" 
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderApis />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/provider/apis/new" 
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <NewApi />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/provider/apis/:apiId/plans/new" 
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <NewPlan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/provider/apis/:apiId/health" 
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ApiHealth />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="dashboard/provider/apis/:apiId/consumers" 
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ApiConsumers />
              </ProtectedRoute>
            } 
          />

          <Route path="settings/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}
