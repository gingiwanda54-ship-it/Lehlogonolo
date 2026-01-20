
import React from 'react';
import { AppRoute, User } from '../types';

interface SidebarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  user: User;
  onLogout: () => void;
  unreadCount: number;
  privacyMode?: boolean;
}

interface MenuItem {
  id: AppRoute;
  label: string;
  icon: string;
  badge?: number;
  mobileOnly?: boolean;
}

const LogoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 75C25 70 20 65 20 55C20 45 25 40 30 40M70 75C75 70 80 65 80 55C80 45 75 40 70 40" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round" />
    <path d="M35 85C25 80 15 70 15 55C15 45 20 38 25 35" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    <path d="M65 85C75 80 85 70 85 55C85 45 80 38 75 35" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    <path d="M50 90V45" stroke="#22C55E" strokeWidth="8" strokeLinecap="round" />
    <path d="M50 70L35 60M50 70L65 60" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 35C48 20 35 15 28 25C22 35 35 50 48 45V35Z" fill="#A855F7" />
    <path d="M52 35C52 20 65 15 72 25C78 35 65 50 52 45V35Z" fill="#A855F7" />
    <circle cx="25" cy="40" r="4" fill="#4ADE80" />
    <circle cx="75" cy="40" r="4" fill="#4ADE80" />
    <circle cx="35" cy="20" r="3" fill="#D8B4FE" />
    <circle cx="65" cy="20" r="3" fill="#D8B4FE" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentRoute, onNavigate, user, onLogout, unreadCount, privacyMode = true }) => {
  const patientItems: MenuItem[] = [
    { id: AppRoute.DASHBOARD, label: 'Home', icon: '🏠' },
    { id: AppRoute.PROGRESS, label: 'Progress', icon: '📈' },
    { id: AppRoute.BOOKING, label: 'Book', icon: '📅' },
    { id: AppRoute.RECORDS, label: 'Records', icon: '📁' },
    { id: AppRoute.TELEHEALTH, label: 'Consult', icon: '🎥' },
  ];

  const adminItems: MenuItem[] = [
    { id: AppRoute.DASHBOARD, label: 'Hub', icon: '🛡️' },
    { id: AppRoute.ADMIN_APPOINTMENTS, label: 'Agenda', icon: '📅' },
    { id: AppRoute.ADMIN_NURSES, label: 'Staff', icon: '🩺' },
    { id: AppRoute.ADMIN_PATIENTS, label: 'Data', icon: '👥' },
    { id: AppRoute.ADMIN_ANALYTICS, label: 'Stats', icon: '📈' },
    { id: AppRoute.UPDATES, label: 'Growth', icon: '✨' },
  ];

  const nurseItems: MenuItem[] = [
    { id: AppRoute.DASHBOARD, label: 'Shift Home', icon: '🏥' },
    { id: AppRoute.NURSE_SCHEDULE, label: 'Agenda', icon: '📅' },
    { id: AppRoute.NURSE_AVAILABILITY, label: 'Slots', icon: '🕒' },
    { id: AppRoute.NURSE_PATIENTS, label: 'Patients', icon: '👥' },
  ];

  const getMenu = () => {
    switch(user.role) {
      case 'ADMIN': return adminItems;
      case 'NURSE': return nurseItems;
      default: return patientItems;
    }
  };

  const getRoleBadgeColor = () => {
    switch(user.role) {
      case 'ADMIN': return 'bg-emerald-50 text-emerald-600';
      case 'NURSE': return 'bg-blue-50 text-blue-600';
      default: return 'bg-violet-50 text-violet-600';
    }
  };

  const maskPatientId = (val?: string) => {
    if (!val) return '';
    if (!privacyMode) return val;
    return 'KH-••••';
  };

  const items = getMenu();
  const desktopItems = user.role === 'PATIENT' 
    ? [...items, { id: AppRoute.TRUST_CENTER, label: 'ZA Trust', icon: '🛡️' }, { id: AppRoute.UPDATES, label: 'What\'s New', icon: '✨' }, { id: AppRoute.REVIEWS, label: 'Feedback', icon: '⭐' }, { id: AppRoute.NOTIFICATIONS, label: 'Alerts', icon: '🔔', badge: unreadCount }]
    : items;

  return (
    <>
      <div className="hidden md:flex w-64 bg-white h-screen border-r border-slate-200 flex-col fixed left-0 top-0 z-50">
        <div className="p-6 border-b border-slate-200 flex items-center space-x-3">
          <LogoIcon className="w-10 h-10 shadow-sm" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight italic">Kidney Hub</h1>
        </div>
        
        <div className="px-6 py-4 space-y-4">
          <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full w-fit ${getRoleBadgeColor()}`}>
            {user.role} Portal
          </div>
          {privacyMode && (
            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></div>
               <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Privacy Shield Active</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {desktopItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all min-h-[48px] ${
                currentRoute === item.id
                  ? user.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-600 font-bold' : user.role === 'NURSE' ? 'bg-blue-50 text-blue-600 font-bold' : 'bg-violet-50 text-violet-600 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shadow-inner border border-slate-100">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span className="text-xs font-black text-slate-600">{user.name[0]}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className={`text-sm font-bold text-slate-700 truncate ${privacyMode ? 'blur-[2px]' : ''}`}>{user.name}</p>
                {user.patientId && (
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                    {maskPatientId(user.patientId)}
                  </p>
                )}
                <button onClick={onLogout} className="text-[10px] text-rose-500 font-bold uppercase hover:underline mt-1 block">Exit Portal</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 z-[100] px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (window.navigator.vibrate) window.navigator.vibrate(5);
                onNavigate(item.id);
              }}
              className={`flex flex-col items-center justify-center gap-1 min-w-[56px] h-full transition-all active:scale-90 ${
                currentRoute === item.id 
                  ? user.role === 'ADMIN' ? 'text-emerald-600' : user.role === 'NURSE' ? 'text-blue-600' : 'text-violet-600'
                  : 'text-slate-400'
              }`}
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter whitespace-nowrap">{item.label}</span>
            </button>
          ))}
          <button 
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 min-w-[56px] h-full text-slate-400 active:scale-90"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200">
               {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <span>🚪</span>}
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter">Exit</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
