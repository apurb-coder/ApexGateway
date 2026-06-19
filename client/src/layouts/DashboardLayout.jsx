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
  LayoutDashboard,
  DollarSign,
  Landmark
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
        { name: 'Metrics & Analytics', path: '/dashboard/provider/analytics', icon: BarChart3 },
        { name: 'Financial Earnings', path: '/dashboard/provider/earnings', icon: DollarSign },
        { name: 'Withdraw Payouts', path: '/dashboard/provider/withdraw', icon: Landmark }
      ]
    : [
        { name: 'API Marketplace', path: '/marketplace', icon: Search },
        { name: 'My Subscriptions', path: '/dashboard/consumer/keys', icon: Key },
      ];

  const bottomItems = [
    { name: 'Profile Settings', path: '/settings/profile', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-carbon-950 flex text-gray-250 relative overflow-hidden">
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 bg-grid-mask pointer-events-none z-0"></div>
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-electric-cobalt/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-solar-amber/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
 
      {/* Sidebar */}
      <aside 
        className={`bg-carbon-900 border-r border-carbon-border flex flex-col transition-all duration-300 backdrop-blur-md z-20 relative ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Floating Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3.5 top-5 z-30 bg-carbon-900 border border-carbon-border text-gray-400 hover:text-white transition-all p-1.5 rounded-full cursor-pointer hover:bg-carbon-800 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center"
        >
          {sidebarCollapsed ? <Menu className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Brand */}
        <div className={`h-16 flex items-center border-b border-carbon-border ${
          sidebarCollapsed ? 'justify-center px-4' : 'px-6 gap-2.5'
        }`}>
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/icons.png" alt="ApexGateway Logo" className="w-8 h-8 object-contain" />
            {!sidebarCollapsed && (
              <span className="font-extrabold text-white text-sm tracking-wider font-display uppercase">APEX GATEWAY</span>
            )}
          </Link>
        </div>
 
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {!sidebarCollapsed ? (
            <div className="px-2.5 py-1 text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">
              {isProvider ? 'Provider Controls' : 'Developer Console'}
            </div>
          ) : (
            <div className="h-px bg-carbon-border/50 my-4 mx-2"></div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/dashboard/provider/apis'
              ? location.pathname.startsWith('/dashboard/provider/apis') && !location.pathname.startsWith('/dashboard/provider/apis/new')
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center rounded-lg text-xs font-mono tracking-wide transition-all group border ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive 
                    ? 'bg-electric-cobalt/10 text-white border-electric-cobalt shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-carbon-800 border-transparent hover:border-carbon-border/50'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isActive ? 'text-electric-cobalt' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {!sidebarCollapsed && <span className="font-semibold">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
 
        {/* Footer Sidebar */}
        <div className={`border-t border-carbon-border space-y-1.5 ${
          sidebarCollapsed ? 'p-3' : 'p-4'
        }`}>
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center rounded-lg text-xs font-mono tracking-wide transition-all group border ${
                  sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive 
                    ? 'bg-electric-cobalt/10 text-white border-electric-cobalt shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                    : 'text-gray-400 hover:text-white hover:bg-carbon-800 border-transparent hover:border-carbon-border/50'
                }`}
              >
                <Icon className={`w-4 h-4 text-gray-500 group-hover:text-gray-300 ${isActive ? 'text-electric-cobalt' : ''}`} />
                {!sidebarCollapsed && <span className="font-semibold">{item.name}</span>}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg text-xs font-mono tracking-wide text-rose-450 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer group ${
              sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            {!sidebarCollapsed && <span className="font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>
 
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Header */}
        <header className="h-16 border-b border-carbon-border bg-carbon-900/60 backdrop-blur-md px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest font-bold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>/</span>
            <span className="text-gray-350 capitalize">
              {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'}
            </span>
          </div>
 
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-white">{user?.email}</div>
              <div className="text-[9px] text-solar-amber font-mono font-bold uppercase tracking-widest">{user?.role}</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-carbon-800 border border-carbon-border flex items-center justify-center text-electric-cobalt shadow-[0_0_10px_rgba(59,130,246,0.1)]">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>
 
        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
