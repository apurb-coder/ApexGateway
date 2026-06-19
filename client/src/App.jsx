import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy load pages for optimized bundle size and faster initial load
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ApiDetails = lazy(() => import('./pages/ApiDetails'));
const ApiDocs = lazy(() => import('./pages/ApiDocs'));
const ConsumerKeys = lazy(() => import('./pages/ConsumerKeys'));
const ProviderAnalytics = lazy(() => import('./pages/ProviderAnalytics'));
const ProviderApis = lazy(() => import('./pages/ProviderApis'));
const NewApi = lazy(() => import('./pages/NewApi'));
const NewPlan = lazy(() => import('./pages/NewPlan'));
const ApiHealth = lazy(() => import('./pages/ApiHealth'));
const ApiConsumers = lazy(() => import('./pages/ApiConsumers'));
const Profile = lazy(() => import('./pages/Profile'));
const Landing = lazy(() => import('./pages/Landing'));
const ProviderEarnings = lazy(() => import('./pages/ProviderEarnings'));
const ProviderWithdraw = lazy(() => import('./pages/ProviderWithdraw'));

function DashboardRedirect() {
  const { user } = useAuthStore();
  if (user?.role === 'PROVIDER') {
    return <Navigate to="/dashboard/provider/apis" replace />;
  }
  return <Navigate to="/marketplace" replace />;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col items-center justify-center font-mono text-xs text-gray-500 gap-2">
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 border-2 border-electric-cobalt/30 border-t-electric-cobalt rounded-full animate-spin" />
        <span>SYS.LOAD_RESOURCES</span>
      </div>
    </div>
  );
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
      <Suspense fallback={<PageLoader />}>
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
              path="dashboard/provider/earnings" 
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderEarnings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="dashboard/provider/withdraw" 
              element={
                <ProtectedRoute allowedRoles={['PROVIDER']}>
                  <ProviderWithdraw />
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
      </Suspense>
      <ToastContainer />
    </Router>
  );
}
