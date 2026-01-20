
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MedicalRecords from './components/MedicalRecords';
import Booking from './components/Booking';
import Telehealth from './components/Telehealth';
import Review from './components/Review';
import ProgressTracker from './components/ProgressTracker';
import AdminDashboard from './components/AdminDashboard';
import AdminNurses from './components/AdminNurses';
import AdminAppointments from './components/AdminAppointments';
import PatientManagement from './components/PatientManagement';
import AdminCalendar from './components/AdminCalendar';
import AdminAnalytics from './components/AdminAnalytics';
import VideoCall from './components/VideoCall';
import NotificationCenter from './components/NotificationCenter';
import TrustCenter from './components/TrustCenter';
import LegalOnboarding from './components/LegalOnboarding';
import UpdatesPortal from './components/UpdatesPortal';
import NursePortal from './components/NursePortal';
import Auth from './components/Auth';
import { AppRoute, User, AppNotification, NotificationPreferences, MeetingPlatform, Nurse, LegalStatus, Appointment, NurseStatus } from './types';
import { MOCK_NOTIFICATIONS as INITIAL_NOTIFICATIONS, MOCK_NURSES, MOCK_APPOINTMENTS } from './constants';

const LogoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Hands at the base */}
    <path d="M30 75C25 70 20 65 20 55C20 45 25 40 30 40M70 75C75 70 80 65 80 55C80 45 75 40 70 40" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round" />
    <path d="M35 85C25 80 15 70 15 55C15 45 20 38 25 35" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    <path d="M65 85C75 80 85 70 85 55C85 45 80 38 75 35" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    
    {/* Trunk */}
    <path d="M50 90V45" stroke="#22C55E" strokeWidth="8" strokeLinecap="round" />
    <path d="M50 70L35 60M50 70L65 60" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
    
    {/* Kidneys */}
    <path d="M48 35C48 20 35 15 28 25C22 35 35 50 48 45V35Z" fill="#A855F7" />
    <path d="M52 35C52 20 65 15 72 25C78 35 65 50 52 45V35Z" fill="#A855F7" />
    
    {/* Leaves */}
    <circle cx="25" cy="40" r="4" fill="#4ADE80" />
    <circle cx="75" cy="40" r="4" fill="#4ADE80" />
    <circle cx="35" cy="20" r="3" fill="#D8B4FE" />
    <circle cx="65" cy="20" r="3" fill="#D8B4FE" />
  </svg>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kh_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLocked, setIsLocked] = useState(!!user);
  const [privacyMode, setPrivacyMode] = useState(() => {
    const saved = localStorage.getItem('kh_privacy_mode');
    return saved === 'true';
  });

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.DASHBOARD);
  const [activeRoom, setActiveRoom] = useState<{ id: string; nurse: string; platform?: MeetingPlatform } | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('kh_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [nurses, setNurses] = useState<Nurse[]>(() => {
    const saved = localStorage.getItem('kh_nurses');
    return saved ? JSON.parse(saved) : MOCK_NURSES;
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('kh_appointments');
    return saved ? JSON.parse(saved) : MOCK_APPOINTMENTS;
  });

  const [checkInRecords, setCheckInRecords] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('kh_checkins');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [legalStatus, setLegalStatus] = useState<LegalStatus>(() => {
    const saved = localStorage.getItem('kh_legal');
    return saved ? JSON.parse(saved) : {
      indemnitySigned: false,
      popiaConsent: false,
      dataSharingConsent: false,
      nhiComplianceStatus: 'Ready',
      identityVerified: false,
      telemedicineConsent: false,
      sharingPreferences: {
        labs: true,
        specialists: true,
        insurance: false,
        research: false,
        crossBorder: false
      }
    };
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    categories: {
      APPOINTMENT: true,
      RECORD: true,
      HEALTH_ALERT: true,
      SYSTEM: true,
      SECURITY: true,
    },
    channels: {
      IN_APP: true,
      EMAIL: true,
      SMS: false,
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNurses(prev => prev.map(n => {
        if (Math.random() > 0.85) {
          const statuses: NurseStatus[] = ['Available', 'On a Call', 'Offline'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { ...n, status: newStatus };
        }
        return n;
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem('kh_user', JSON.stringify(user));
    else localStorage.removeItem('kh_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('kh_privacy_mode', String(privacyMode));
  }, [privacyMode]);

  useEffect(() => {
    localStorage.setItem('kh_legal', JSON.stringify(legalStatus));
  }, [legalStatus]);

  useEffect(() => {
    localStorage.setItem('kh_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('kh_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('kh_nurses', JSON.stringify(nurses));
  }, [nurses]);

  useEffect(() => {
    localStorage.setItem('kh_checkins', JSON.stringify(checkInRecords));
  }, [checkInRecords]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setIsLocked(false);
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveRoom(null);
    setIsLocked(false);
    setCurrentRoute(AppRoute.DASHBOARD);
    localStorage.clear();
  };

  const togglePrivacy = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(5);
    setPrivacyMode(!privacyMode);
  };

  const unLock = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    setIsLocked(false);
  };

  const joinRoom = (roomId: string, nurseName: string, platform?: MeetingPlatform) => {
    setActiveRoom({ id: roomId, nurse: nurseName, platform });
    setCurrentRoute(AppRoute.VIDEO_CALL);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const updateNurse = (updatedNurse: Nurse) => {
    setNurses(prev => prev.map(n => n.id === updatedNurse.id ? updatedNurse : n));
  };

  const addNurse = (newNurse: Nurse) => {
    setNurses(prev => [...prev, newNurse]);
  };

  const updateLegalStatus = (status: Partial<LegalStatus>) => {
    setLegalStatus(prev => ({ ...prev, ...status }));
  };

  const handleOnboardingComplete = (legal: Partial<LegalStatus>, userData: Partial<User>) => {
    setLegalStatus(prev => ({ ...prev, ...legal }));
    setUser(prev => prev ? ({ ...prev, ...userData }) : null);
    setCurrentRoute(AppRoute.DASHBOARD);
  };

  const handleBookAppointment = (appt: Omit<Appointment, 'id' | 'status'>) => {
    const timestamp = new Date().toISOString();
    const newAppt: Appointment = {
      ...appt,
      id: Math.random().toString(36).substr(2, 9),
      status: 'Upcoming'
    };
    setAppointments(prev => [newAppt, ...prev]);
    
    const newNotifs: AppNotification[] = [
      {
        id: 'p-' + Math.random().toString(36).substr(2, 9),
        type: 'APPOINTMENT',
        title: 'Booking Confirmed',
        message: `Your appointment with ${appt.nurseName} is scheduled for ${appt.date} at ${appt.time}. Confirmation email sent.`,
        timestamp,
        read: false,
        actionUrl: AppRoute.DASHBOARD
      },
      {
        id: 'n-' + Math.random().toString(36).substr(2, 9),
        type: 'APPOINTMENT',
        title: 'New Clinical Assignment',
        message: `Urgent: Patient ${appt.patientName} has booked a ${appt.type} session with you for ${appt.date}. Check your schedule.`,
        timestamp,
        read: false,
        actionUrl: AppRoute.DASHBOARD
      },
      {
        id: 'a-' + Math.random().toString(36).substr(2, 9),
        type: 'SECURITY',
        title: 'System Roster Update',
        message: `Audit Alert: Booking established between ${appt.patientName} and ${appt.nurseName}. HIPAA/POPIA compliant emails dispatched to all parties.`,
        timestamp,
        read: false,
        actionUrl: AppRoute.ADMIN_APPOINTMENTS
      }
    ];

    setNotifications(prev => [...newNotifs, ...prev]);
  };

  const handleCheckIn = (appointmentId: string, data: any) => {
    setCheckInRecords(prev => ({ ...prev, [appointmentId]: data }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const navigateAndClean = (route: AppRoute) => {
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (isLocked) {
    return (
      <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-xs w-full space-y-8 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-violet-600 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-2xl shadow-violet-500/20">
            🔒
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tight">Portal Locked</h2>
            <p className="text-slate-400 text-sm mt-2">Biometric authentication required to access clinical records.</p>
          </div>
          <button 
            onClick={unLock}
            className="w-full py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <span className="text-xl">👤</span> Scan Face / Touch ID
          </button>
          <button 
            onClick={handleLogout}
            className="text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white"
          >
            Switch Account
          </button>
        </div>
      </div>
    );
  }

  const isCompliant = legalStatus.indemnitySigned && legalStatus.popiaConsent && legalStatus.identityVerified;
  
  if (user.role === 'PATIENT' && !isCompliant) {
    return <LegalOnboarding user={user} onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    if (currentRoute === AppRoute.VIDEO_CALL && activeRoom) {
      return (
        <VideoCall 
          roomId={activeRoom.id} 
          nurseName={activeRoom.nurse} 
          platform={activeRoom.platform}
          onExit={() => { setActiveRoom(null); setCurrentRoute(AppRoute.DASHBOARD); }} 
        />
      );
    }

    if (user.role === 'ADMIN') {
      switch (currentRoute) {
        case AppRoute.DASHBOARD: return <AdminDashboard nurses={nurses} appointments={appointments} />;
        case AppRoute.ADMIN_NURSES: return <AdminNurses nurses={nurses} onUpdateNurse={updateNurse} onAddNurse={addNurse} />;
        case AppRoute.ADMIN_CALENDAR: return <AdminCalendar nurses={nurses} appointments={appointments} onUpdateNurse={updateNurse} />;
        case AppRoute.ADMIN_ANALYTICS: return <AdminAnalytics />;
        case AppRoute.ADMIN_APPOINTMENTS: return <AdminAppointments appointments={appointments} onJoinRoom={joinRoom} />;
        case AppRoute.ADMIN_PATIENTS: return <PatientManagement legalStatus={legalStatus} privacyMode={privacyMode} />;
        case AppRoute.UPDATES: return <UpdatesPortal role={user.role} />;
        default: return <AdminDashboard nurses={nurses} appointments={appointments} />;
      }
    }

    if (user.role === 'NURSE') {
      const nurseProfile = nurses.find(n => n.id === user.nurseId) || nurses[0];
      switch (currentRoute) {
        case AppRoute.DASHBOARD: return <NursePortal nurse={nurseProfile} appointments={appointments} onUpdateNurse={updateNurse} onNavigate={navigateAndClean} />;
        case AppRoute.NURSE_AVAILABILITY: return <NursePortal nurse={nurseProfile} appointments={appointments} onUpdateNurse={updateNurse} onNavigate={navigateAndClean} />;
        case AppRoute.NURSE_SCHEDULE: return <AdminAppointments appointments={appointments.filter(a => a.nurseId === nurseProfile.id)} onJoinRoom={joinRoom} />;
        case AppRoute.NURSE_PATIENTS: return <PatientManagement />;
        default: return <NursePortal nurse={nurseProfile} appointments={appointments} onUpdateNurse={updateNurse} onNavigate={navigateAndClean} />;
      }
    }

    switch (currentRoute) {
      case AppRoute.DASHBOARD: return (
        <Dashboard 
          user={user}
          privacyMode={privacyMode}
          onTogglePrivacy={togglePrivacy}
          appointments={appointments} 
          checkInRecords={checkInRecords}
          onCheckIn={handleCheckIn}
          onJoinRoom={joinRoom} 
          legalStatus={legalStatus} 
        />
      );
      case AppRoute.PROGRESS: return <ProgressTracker />;
      case AppRoute.RECORDS: return (
        <MedicalRecords 
          role={user.role} 
          legalStatus={legalStatus} 
          onUpdateLegal={updateLegalStatus} 
          privacyMode={privacyMode}
        />
      );
      case AppRoute.BOOKING: return <Booking nurses={nurses} onBook={handleBookAppointment} user={user} />;
      case AppRoute.TELEHEALTH: return <Telehealth />;
      case AppRoute.REVIEWS: return <Review />;
      case AppRoute.TRUST_CENTER: return <TrustCenter legalStatus={legalStatus} />;
      case AppRoute.UPDATES: return <UpdatesPortal role={user.role} />;
      case AppRoute.NOTIFICATIONS: return (
        <NotificationCenter 
          notifications={notifications} 
          preferences={preferences}
          onUpdatePreferences={setPreferences}
          onMarkRead={markNotificationRead} 
          onNavigate={navigateAndClean}
        />
      );
      default: return (
        <Dashboard 
          user={user}
          privacyMode={privacyMode}
          onTogglePrivacy={togglePrivacy}
          appointments={appointments} 
          checkInRecords={checkInRecords}
          onCheckIn={handleCheckIn}
          onJoinRoom={joinRoom} 
          legalStatus={legalStatus} 
        />
      );
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col md:flex-row overflow-x-hidden">
      {currentRoute !== AppRoute.VIDEO_CALL && (
        <Sidebar 
          currentRoute={currentRoute} 
          onNavigate={navigateAndClean} 
          user={user}
          onLogout={handleLogout}
          unreadCount={unreadCount}
          privacyMode={privacyMode}
        />
      )}
      <main className={`flex-1 transition-all duration-300 pb-24 md:pb-8 ${currentRoute !== AppRoute.VIDEO_CALL ? 'md:ml-64 p-4 sm:p-8 max-w-7xl mx-auto w-full' : 'pt-[env(safe-area-inset-top)]'}`}>
        {currentRoute !== AppRoute.VIDEO_CALL && (
          <div className="md:hidden flex justify-between items-center mb-6 px-2 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-3">
               <LogoIcon className="w-8 h-8" />
               <div>
                  <h1 className="text-lg font-black text-slate-800 tracking-tight italic">Kidney Hub</h1>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{currentRoute.replace('_', ' ')}</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={togglePrivacy} 
                className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center text-xl active:scale-95 transition-all ${privacyMode ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}
               >
                 {privacyMode ? '🙈' : '👁️'}
               </button>
               <button onClick={() => navigateAndClean(AppRoute.NOTIFICATIONS)} className="relative w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl active:scale-95">
                  🔔
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
               </button>
            </div>
          </div>
        )}
        <div className="page-enter">
          {renderContent()}
        </div>
        
        {user.role === 'PATIENT' && currentRoute !== AppRoute.VIDEO_CALL && (
          <footer className="mt-20 pt-8 border-t border-slate-200 text-center pb-12">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2">Legal Sovereignty: Africa-South (Johannesburg)</p>
            <p className="text-[10px] text-slate-500 max-w-2xl mx-auto leading-relaxed px-4">
              Kidney Hub is a clinical support platform compliant with South African health regulations. Information provided is for renal health monitoring and should not replace professional medical judgment. 
              Always consult an HPCSA-registered physician for diagnosis and treatment.
            </p>
          </footer>
        )}
      </main>
    </div>
  );
};

export default App;
