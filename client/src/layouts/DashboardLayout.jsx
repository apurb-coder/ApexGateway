import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { 
  Globe, 
  PlusCircle, 
  Search, 
  Key, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  User, 
  LayoutDashboard 
} from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, addToast } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const isProvider = user?.role === 'PROVIDER';

  const menuItems = isProvider
    ? [
        { name: 'Published APIs', path: '/dashboard/provider/apis', icon: Globe },
        { name: 'Register New API', path: '/dashboard/provider/apis/new', icon: PlusCircle },
      ]
    : [
        { name: 'API Marketplace', path: '/marketplace', icon: Search },
        { name: 'My Subscriptions', path: '/dashboard/consumer/keys', icon: Key },
        { name: 'Analytics', path: '/dashboard/consumer/analytics', icon: BarChart3 },
      ];

  const bottomItems = [
    { name: 'Profile Settings', path: '/settings/profile', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-bg-dark flex text-gray-200">
      {/* Sidebar */}
      <aside 
        className={`bg-card-dark/40 border-r border-border-dark flex flex-col transition-all duration-300 backdrop-blur-md z-20 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-border-dark gap-3 justify-between">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-primary-600 to-accent-400 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                A
              </div>
              <span className="font-extrabold text-white text-lg tracking-wider">APEX</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-linear-to-tr from-primary-600 to-accent-400 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              A
            </div>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg cursor-pointer"
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {!sidebarCollapsed ? (isProvider ? 'Provider Menu' : 'Consumer Menu') : '...'}
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-border-dark space-y-1.5">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-gray-300" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer group"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-border-dark bg-card-dark/20 backdrop-blur-md px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <LayoutDashboard className="w-4 h-4" />
            <span>/</span>
            <span className="text-gray-200 capitalize font-medium">
              {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{user?.email}</div>
              <div className="text-xs text-primary-400 font-bold uppercase tracking-wider">{user?.role}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-[0_0_10px_rgba(139,92,246,0.15)]">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
