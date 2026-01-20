
import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Aria&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Jack&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Sara&backgroundColor=d1d4f9',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Milo&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/lorelei/svg?seed=Zoe&backgroundColor=92e6b5'
];

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
    <circle cx="50" cy="15" r="4" fill="#A855F7" opacity="0.5" />
  </svg>
);

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'EMAIL' | 'PHONE'>('EMAIL');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [resetStep, setResetStep] = useState<'IDENTIFIER' | 'VERIFY' | 'NEW_PASS'>('IDENTIFIER');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      setError('Invalid verification code.');
      return;
    }
    if (showResetFlow) {
      setResetStep('NEW_PASS');
      setMfaCode('');
      setError('');
    } else {
      completeAuth();
    }
  };

  const completeAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const name = isLogin 
        ? (identifier.includes('admin') ? 'Admin System' : identifier.includes('nurse') ? 'Nurse Sarah Miller' : 'John Doe') 
        : `${firstName} ${surname}`;
      
      const fName = isLogin 
        ? (identifier.includes('admin') ? 'Admin' : identifier.includes('nurse') ? 'Sarah' : 'John') 
        : firstName;

      const userRole: UserRole = isLogin 
        ? (identifier.includes('admin') ? 'ADMIN' : identifier.includes('nurse') ? 'NURSE' : 'PATIENT') 
        : role;

      const patientId = userRole === 'PATIENT' ? 'KH-8829' : undefined;

      onLogin({
        id: Math.random().toString(36).substr(2, 9),
        patientId,
        email: authMethod === 'EMAIL' ? identifier : `${identifier}@phone.hub`,
        firstName: fName,
        surname: fName === 'Admin' ? 'System' : fName === 'Sarah' ? 'Miller' : 'Doe',
        name: name,
        role: userRole,
        avatarUrl: isLogin ? (userRole === 'NURSE' ? MOCK_NURSES[0].img : undefined) : avatarUrl,
        nurseId: userRole === 'NURSE' ? 'n1' : undefined,
        security: {
          mfaEnabled: true,
          biometricEnabled: true,
          encryptionLevel: 'AES-256-GCM',
          lastAudit: new Date().toISOString(),
          loginAlerts: true,
          autoTimeoutMinutes: 15,
          privacyMode: false
        }
      });
    }, 1200);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResetFlow(false);
      setResetStep('IDENTIFIER');
      setIsLogin(true);
      setError('');
      alert('Password reset successfully. Please log in.');
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!identifier || (!showResetFlow && !password)) {
      setError('Required fields missing.');
      return;
    }

    if (!isLogin && !showResetFlow) {
      if (!firstName || !surname) {
        setError('Full legal name required.');
        return;
      }
      if (!agreedToTerms) {
        setError('Please accept the POPIA & Terms.');
        return;
      }
    }

    setIsSendingCode(true);
    setTimeout(() => {
      setIsSendingCode(false);
      setShowMfa(true);
      if (showResetFlow) setResetStep('VERIFY');
    }, 1800);
  };

  if (isSendingCode) {
    return (
      <div className="min-h-dvh bg-slate-900 flex items-center justify-center p-6 text-white text-center">
        <div className="max-w-xs w-full space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="relative mx-auto w-32 h-32">
             <div className="absolute inset-0 border-[6px] border-white/5 rounded-[3rem]"></div>
             <div className="absolute inset-0 border-[6px] border-violet-500 rounded-[3rem] border-t-transparent animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-4xl">🛡️</div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black italic tracking-tight">Authenticating...</h2>
            <p className="text-slate-400 text-sm">Dispatching secure 6-digit verification code to your {authMethod === 'EMAIL' ? 'email' : 'phone'}.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showMfa && resetStep !== 'NEW_PASS') {
    return (
      <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full animate-in zoom-in duration-300">
          <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
            <div className="space-y-3">
              <div className="w-20 h-20 bg-violet-50 text-violet-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">📬</div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Enter Code</h2>
              <p className="text-slate-500 text-sm font-medium">Verification sent to <span className="font-bold text-slate-800">{identifier}</span></p>
            </div>
            <form onSubmit={handleMfaSubmit} className="space-y-8">
              <input 
                autoFocus
                type="text" 
                inputMode="numeric"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-4xl font-black tracking-[0.4em] py-6 bg-slate-50 border-2 border-slate-200 rounded-[2rem] focus:border-violet-600 outline-none transition-all placeholder:text-slate-200"
                placeholder="000000"
              />
              {error && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}
              <button 
                type="submit"
                disabled={mfaCode.length !== 6 || isLoading}
                className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all disabled:opacity-30"
              >
                {isLoading ? 'VERIFYING...' : 'CONFIRM IDENTITY'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
      <div className="max-w-md w-full py-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10 space-y-6">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-violet-200 overflow-hidden mx-auto p-4 border border-slate-50 relative">
             <div className="absolute inset-0 bg-emerald-400/5 blur-xl"></div>
             <LogoIcon className="w-full h-full animate-pulse relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic">Kidney Hub</h1>
            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.3em] mt-1">Fighting Silent Kidney Disease</p>
          </div>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-[4rem] border border-slate-100 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.1)] space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600"></div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem]">
            <button 
              onClick={() => { setIsLogin(true); setShowResetFlow(false); }}
              className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all ${isLogin && !showResetFlow ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400'}`}
            >
              LOGIN
            </button>
            <button 
              onClick={() => { setIsLogin(false); setShowResetFlow(false); }}
              className={`flex-1 py-4 text-xs font-black rounded-2xl transition-all ${!isLogin && !showResetFlow ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400'}`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && !showResetFlow && (
              <div className="space-y-8 animate-in slide-in-from-top-4">
                <div className="text-center space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select your profile avatar</p>
                  <div className="relative inline-block group">
                    <div className="w-32 h-32 rounded-[3rem] border-4 border-white overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-slate-50 transition-all transform group-hover:scale-[1.02] duration-500 ring-4 ring-slate-50">
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-xl hover:bg-indigo-700 transition-all active:scale-90 border-4 border-white"
                      title="Upload your own photo"
                    >
                      📸
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div className="flex justify-center flex-wrap gap-3 px-6 py-4 bg-slate-50/50 rounded-[2.5rem] border border-slate-100/50">
                    {PRESET_AVATARS.map((url, i) => (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => setAvatarUrl(url)}
                        className={`w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 active:scale-95 shadow-sm ${avatarUrl === url ? 'border-violet-600 ring-2 ring-violet-100 bg-white scale-110' : 'border-white opacity-60 hover:opacity-100 hover:border-slate-200'}`}
                      >
                        <img src={url} className="w-full h-full object-cover rounded-xl" alt={`Character ${i+1}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                    <input 
                      required
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-sm font-bold focus:border-violet-600 outline-none transition-all"
                      placeholder="Legal name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Surname</label>
                    <input 
                      required
                      type="text" 
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-sm font-bold focus:border-violet-600 outline-none transition-all"
                      placeholder="Surname"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setAuthMethod('EMAIL')}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${authMethod === 'EMAIL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  📧 Email
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMethod('PHONE')}
                  className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${authMethod === 'PHONE' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                >
                  📱 Phone
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {authMethod === 'EMAIL' ? 'Email Address' : 'Mobile Number'}
                </label>
                <input 
                  required
                  type={authMethod === 'EMAIL' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-base font-bold focus:border-violet-600 outline-none transition-all"
                  placeholder={authMethod === 'EMAIL' ? 'name@example.com' : '+27 ...'}
                />
              </div>
            </div>

            {!showResetFlow && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                </div>
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-base font-bold focus:border-violet-600 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            )}

            {!isLogin && !showResetFlow && (
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('PATIENT')}
                    className={`p-4 rounded-2xl text-[9px] font-black border-2 transition-all flex flex-col items-center justify-center gap-1 ${role === 'PATIENT' ? 'border-violet-600 bg-violet-50 text-violet-600 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                  >
                    <span className="text-lg">👤</span>
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('NURSE')}
                    className={`p-4 rounded-2xl text-[9px] font-black border-2 transition-all flex flex-col items-center justify-center gap-1 ${role === 'NURSE' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                  >
                    <span className="text-lg">🏥</span>
                    Clinician
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-4 rounded-2xl text-[9px] font-black border-2 transition-all flex flex-col items-center justify-center gap-1 ${role === 'ADMIN' ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-sm' : 'border-slate-100 text-slate-400'}`}
                  >
                    <span className="text-lg">🛡️</span>
                    Admin
                  </button>
                </div>
                <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-[1.8rem] border border-slate-100 cursor-pointer hover:border-violet-200 transition-all group">
                   <input 
                    type="checkbox" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-slate-300 text-violet-600 focus:ring-violet-500"
                   />
                   <span className="text-[10px] font-bold text-slate-500 leading-tight group-hover:text-slate-700">I agree to POPIA & Terms.</span>
                </label>
              </div>
            )}

            {error && <p className="text-center text-rose-500 text-[10px] font-black uppercase tracking-widest">{error}</p>}

            <button 
              type="submit"
              className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all"
            >
              {isLogin ? 'ENTER SECURE HUB' : 'BEGIN ONBOARDING'}
            </button>
          </form>
        </div>
        <p className="text-center mt-8 text-[10px] text-slate-400 font-black uppercase tracking-widest">
           Testing? Use "admin" or "nurse" as credentials.
        </p>
      </div>
    </div>
  );
};

export default Auth;
import { MOCK_NURSES } from '../constants';
