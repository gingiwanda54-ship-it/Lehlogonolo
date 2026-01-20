
import React, { useState } from 'react';
import { MOCK_METRICS } from '../constants';
import { MeetingPlatform, LegalStatus, Appointment, User } from '../types';

interface DashboardProps {
  user: User;
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  appointments: Appointment[];
  checkInRecords: Record<string, any>;
  onCheckIn: (appointmentId: string, data: any) => void;
  onJoinRoom: (roomId: string, nurseName: string, platform?: MeetingPlatform) => void;
  legalStatus: LegalStatus;
}

interface CheckInData {
  idNumber: string;
  medicalAid: string;
  memberNumber: string;
  emergencyContact: string;
  currentSymptoms: string;
  signature: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, privacyMode, onTogglePrivacy, appointments, checkInRecords, onCheckIn, onJoinRoom, legalStatus }) => {
  const latest = MOCK_METRICS[MOCK_METRICS.length - 1] || { gfr: 0, creatinine: 0, bloodPressureSystolic: 0, bloodPressureDiastolic: 0, potassium: 0 };
  const isCompliant = legalStatus.indemnitySigned && legalStatus.popiaConsent;
  
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkInData, setCheckInData] = useState<CheckInData>({
    idNumber: '',
    medicalAid: '',
    memberNumber: '',
    emergencyContact: '',
    currentSymptoms: '',
    signature: ''
  });

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkingIn) {
      onCheckIn(checkingIn, { ...checkInData });
      setCheckingIn(null);
      setCheckInData({ idNumber: '', medicalAid: '', memberNumber: '', emergencyContact: '', currentSymptoms: '', signature: '' });
    }
  };

  const maskPatientId = (val?: string) => {
    if (!val) return 'KH-NEW';
    if (!privacyMode) return val;
    return 'KH-••••';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Hub Home</h2>
            <div className="flex flex-wrap gap-2">
              {user.patientId && (
                <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${privacyMode ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-violet-50 text-violet-600 border-violet-100'}`}>
                  ID: {maskPatientId(user.patientId)}
                </div>
              )}
              {isCompliant && (
                <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200 uppercase tracking-tighter">
                  ZA Verified 🛡️
                </span>
              )}
              <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-indigo-100 uppercase tracking-tighter">
                NHI Ready 🇿🇦
              </span>
            </div>
          </div>
          <p className="text-slate-500 font-medium">Monitoring your renal metrics in real-time.</p>
        </div>
        
        <button 
          onClick={onTogglePrivacy}
          className={`hidden sm:flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${privacyMode ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200'}`}
        >
          <span className="text-lg">{privacyMode ? '🛡️' : '👁️'}</span>
          <span className="text-[10px] font-black uppercase tracking-widest">{privacyMode ? 'Privacy Shield Active' : 'Enable Privacy Shield'}</span>
        </button>
      </header>

      {!isCompliant && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 animate-in zoom-in-95">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl backdrop-blur-sm">📋</div>
            <div>
              <h4 className="font-black text-xl italic">POPIA Verification Needed</h4>
              <p className="text-white/80 text-sm font-medium">Clinical sharing is restricted until legal sign-offs are complete.</p>
            </div>
          </div>
          <button className="w-full sm:w-auto bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-orange-50 transition-all shadow-lg active:scale-95">
            GO TO COMPLIANCE
          </button>
        </div>
      )}

      {checkingIn && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
            <div className="bg-indigo-700 p-10 text-white relative">
              <button 
                onClick={() => setCheckingIn(null)}
                className="absolute top-8 right-8 bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-xl"
              >
                ✕
              </button>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-5xl">🇿🇦</span>
                <h3 className="text-3xl font-black italic tracking-tight">Clinical Check-in</h3>
              </div>
              <p className="text-indigo-100 text-sm font-medium">Verify your details for Nurse {appointments.find(a => a.id === checkingIn)?.nurseName}.</p>
            </div>
            
            <form onSubmit={handleCheckInSubmit} className="p-10 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SA ID Number</label>
                  <input 
                    required
                    type="password"
                    placeholder="ID Number"
                    value={checkInData.idNumber}
                    onChange={e => setCheckInData({...checkInData, idNumber: e.target.value})}
                    className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-base font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Emergency Contact</label>
                  <input 
                    required
                    type="tel"
                    placeholder="+27 (0) ..."
                    value={checkInData.emergencyContact}
                    onChange={e => setCheckInData({...checkInData, emergencyContact: e.target.value})}
                    className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-base font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Signs/Symptoms</label>
                <textarea 
                  required
                  placeholder="e.g. Dizziness, swelling, unusual pain..."
                  value={checkInData.currentSymptoms}
                  onChange={e => setCheckInData({...checkInData, currentSymptoms: e.target.value})}
                  className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-[1.8rem] text-base font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Patient e-Signature</label>
                <input 
                  required
                  type="text"
                  placeholder="Type Full Legal Name"
                  value={checkInData.signature}
                  onChange={e => setCheckInData({...checkInData, signature: e.target.value})}
                  className="w-full px-6 py-4.5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[1.8rem] text-xl font-serif italic outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-center"
                />
                <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-tight">NHA Compliant Digital Sign-In • POPIA Act Protected</p>
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  className="w-full py-6 bg-indigo-600 text-white rounded-[2.2rem] font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  VERIFY & LOG ARRIVAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Health Metrics Grid with Enhanced Privacy Shield */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'eGFR Status', value: latest.gfr, unit: 'mL/min', trend: '+2.4%', color: 'violet', icon: '🧪' },
          { label: 'Creatinine', value: latest.creatinine, unit: 'mg/dL', trend: '-0.1', color: 'emerald', icon: '🧬' },
          { label: 'Blood Pressure', value: `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`, unit: 'mmHg', trend: 'Stable', color: 'blue', icon: '❤️' },
          { label: 'Potassium', value: latest.potassium, unit: 'mEq/L', trend: '+0.2', color: 'amber', icon: '🍌' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xl">{stat.icon}</span>
              <div className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-${stat.color}-50 text-${stat.color}-600 uppercase tracking-tighter`}>
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className={`flex items-baseline gap-1 transition-all duration-500 ${privacyMode ? 'blur-xl select-none' : ''}`}>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.unit}</span>
            </div>
            {privacyMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm pointer-events-none">
                 <span className="text-[8px] font-black text-indigo-600 bg-white px-2 py-1 rounded-full shadow-sm border border-indigo-100 uppercase tracking-widest">Shielded</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="text-xl font-black text-slate-800 italic tracking-tight">Clinical Agenda</h3>
            <div className="flex items-center gap-3">
               <span className="text-[9px] font-black text-slate-400 uppercase">E2EE Tunnel Active</span>
               <button className="bg-white px-4 py-2 rounded-xl text-[9px] font-black text-slate-500 border border-slate-100 uppercase tracking-widest shadow-sm">Sync Calendar</button>
            </div>
          </div>
          <div className="divide-y divide-slate-50 max-h-[480px] overflow-y-auto scrollbar-hide">
            {appointments.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="text-5xl opacity-20">📅</div>
                <p className="text-slate-400 font-black uppercase text-xs">No upcoming sessions</p>
                <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest underline">Book Your First Consult</button>
              </div>
            ) : appointments.map(appt => (
              <div key={appt.id} className="p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50/50 transition-colors gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-white border border-slate-100 text-indigo-600 rounded-[1.8rem] flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] font-black uppercase leading-none mb-1 text-slate-400">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-2xl font-black leading-none">{appt.date.split('-')[2]}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <p className="text-lg font-black text-slate-800 tracking-tight">{appt.nurseName}</p>
                       <span className={`px-2 py-0.5 text-[8px] font-black rounded-lg uppercase tracking-tighter ${appt.consultationType === 'Virtual' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                         {appt.consultationType}
                       </span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{appt.type} • {appt.time}</p>
                  </div>
                </div>
                {appt.consultationType === 'Virtual' ? (
                  <button 
                    onClick={() => onJoinRoom(appt.videoRoomId || 'default-room', appt.nurseName, appt.platform)}
                    className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    JOIN {appt.platform?.toUpperCase().replace(' ', '') || 'TELEHEALTH'}
                  </button>
                ) : (
                  checkInRecords[appt.id] ? (
                    <div className="w-full sm:w-auto px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      Awaiting Nurse
                    </div>
                  ) : (
                    <button 
                      onClick={() => setCheckingIn(appt.id)}
                      className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black active:scale-95 transition-all"
                    >
                      CLINIC CHECK-IN
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 group-hover:rotate-12 transition-transform select-none">🛡️</div>
            <h4 className="font-black text-xl mb-6 relative z-10 italic tracking-tight">Privacy Score: 100</h4>
            <div className="space-y-6 relative z-10">
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span>POPIA Data Lock</span>
                     <span className="text-emerald-400">Locked</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                  </div>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span>Access Logs</span>
                     <span className="text-indigo-400">Immutable</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 w-[95%] rounded-full shadow-[0_0_15px_#6366f1]"></div>
                  </div>
               </div>
            </div>
            <p className="mt-6 text-[9px] text-slate-500 font-bold uppercase tracking-widest">All activity is digitally fingerprinted.</p>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🧬</div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Health Score</p>
                   <p className="text-base font-black text-slate-800 tracking-tight">Optimal Management</p>
                </div>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Your longitudinal data is protected by AES-256 standards. No unauthorized nodes detected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
