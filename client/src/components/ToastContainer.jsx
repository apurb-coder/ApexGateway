import { useUIStore } from '../store/useUIStore';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClasses = 'border-blue-500/30 bg-blue-950/80 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
        
        if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClasses = 'border-rose-500/30 bg-rose-950/80 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]';
        } else if (toast.type === 'success') {
          Icon = CheckCircle;
          colorClasses = 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          colorClasses = 'border-amber-500/30 bg-amber-950/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md transition-all duration-300 ${colorClasses}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-70 hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
