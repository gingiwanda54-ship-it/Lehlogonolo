
import React, { useState } from 'react';
import { Nurse, MeetingPlatform, Appointment, User } from '../types';

type Step = 'NURSE' | 'DATE' | 'TIME' | 'SERVICE' | 'PLATFORM' | 'PREREQUISITE' | 'CONFIRM';

interface BookingProps {
  nurses: Nurse[];
  onBook: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  user: User;
}

const Booking: React.FC<BookingProps> = ({ nurses, onBook, user }) => {
  const [step, setStep] = useState<Step>('NURSE');
  const [selectedNurse, setSelectedNurse] = useState<string | null>(null);
  const [expandedNurse, setExpandedNurse] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'In-person' | 'Virtual'>('In-person');
  const [selectedPlatform, setSelectedPlatform] = useState<MeetingPlatform>('Google Meet');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const nurse = nurses.find(n => n.id === selectedNurse);

  const availableDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const handleServiceSelect = (type: string, consType: 'In-person' | 'Virtual') => {
    setAppointmentType(type);
    setConsultationType(consType);
  };

  const handleConfirm = () => {
    setLoading(true);
    
    onBook({
      patientId: user.id,
      patientName: user.name,
      nurseId: selectedNurse || '',
      nurseName: nurse?.name || '',
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      consultationType,
      platform: consultationType === 'Virtual' ? selectedPlatform : undefined,
      videoRoomId: consultationType === 'Virtual' ? Math.random().toString(36).substr(2, 9) : undefined,
      notes: notes || undefined
    });

    setTimeout(() => {
      setLoading(false);
      setStep('CONFIRM');
    }, 2000);
  };

  const renderServiceIcon = (id: string, isDisabled: boolean) => {
    const baseClasses = `w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-300`;
    
    if (isDisabled) return (
      <div className={`${baseClasses} bg-slate-100 text-slate-400`}>
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
      </div>
    );

    switch(id) {
      case 'Virtual Consultation':
        return (
          <div className={`${baseClasses} ${appointmentType === id ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-blue-50 text-blue-600'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
            </svg>
          </div>
        );
      case 'In-Person Consultation':
        return (
          <div className={`${baseClasses} ${appointmentType === id ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-emerald-50 text-emerald-600'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        );
      case 'Check-up':
        return (
          <div className={`${baseClasses} ${appointmentType === id ? 'bg-violet-600 text-white shadow-violet-200' : 'bg-violet-50 text-violet-600'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case 'Follow-up':
        return (
          <div className={`${baseClasses} ${appointmentType === id ? 'bg-amber-600 text-white shadow-amber-200' : 'bg-amber-50 text-amber-600'}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClasses} bg-slate-100 text-slate-600`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        );
    }
  };

  const renderProgress = () => (
    <div className="flex items-center justify-center space-x-4 mb-12">
      {['NURSE', 'DATE', 'TIME', 'SERVICE'].map((s, i) => {
        const isActive = step === s || (i < 3 && step !== 'NURSE' && step !== 'DATE' && step !== 'TIME') || ['PLATFORM', 'PREREQUISITE', 'CONFIRM'].includes(step);
        return (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-all duration-500 ${
              isActive ? 'bg-violet-600 text-white shadow-xl shadow-violet-200 scale-110' : 'bg-slate-200 text-slate-500'
            }`}>
              {i + 1}
            </div>
            {i < 3 && <div className={`w-12 h-1 rounded-full transition-all duration-500 ${isActive ? 'bg-violet-600' : 'bg-slate-200'}`}></div>}
          </React.Fragment>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="w-20 h-20 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-8"></div>
        <h3 className="text-2xl font-black text-slate-800 italic">Securing Clinical Route...</h3>
        <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest text-center max-w-xs">
          Notifying Nurse & Admin via secure encrypted email & in-app alerts.
        </p>
      </div>
    );
  }

  if (step === 'CONFIRM') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">✓</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 mb-6 max-w-md text-center">
          Your {appointmentType.toLowerCase()} session with {nurse?.name} is scheduled for {selectedDate} at {selectedTime}.
          <span className="block mt-3 text-[10px] font-black uppercase text-indigo-600 tracking-widest">
            Nurse & Admin alerted • Confirmation emails dispatched
          </span>
          {consultationType === 'Virtual' && (
            <span className="block mt-4 font-bold text-slate-800">
              {selectedPlatform === 'Google Meet' ? '💙 Google Meet' : '💜 Microsoft Teams'} link has been added to your dashboard.
            </span>
          )}
        </p>
        
        {consultationType === 'In-person' && (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] max-w-sm mb-8">
            <div className="flex items-start gap-4 text-amber-800">
              <span className="text-2xl">🆔</span>
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1">Final Reminder</p>
                <p className="text-sm font-medium">Please have your <strong>South African ID</strong> and <strong>Medical Aid card</strong> ready for clinic check-in.</p>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => { 
            setStep('NURSE'); 
            setSelectedNurse(null); 
            setSelectedDate(''); 
            setSelectedTime(''); 
            setAcknowledged(false); 
            setNotes('');
            setAppointmentType('');
          }}
          className="bg-violet-600 text-white px-12 py-5 rounded-[1.8rem] font-black shadow-2xl shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all flex items-center gap-3 text-lg"
        >
          <span>📅</span> Book Another Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Book a Nurse</h2>
        <p className="text-slate-500">Professional kidney care tailored to your schedule.</p>
      </header>

      {renderProgress()}

      <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-2xl min-h-[500px]">
        {step === 'NURSE' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 italic">Select your Clinical Nurse</h3>
            <div className="grid grid-cols-1 gap-6">
              {nurses.filter(n => n.active).map(n => (
                <div 
                  key={n.id}
                  className={`rounded-[2.5rem] border-2 transition-all overflow-hidden ${
                    expandedNurse === n.id ? 'border-violet-400 bg-violet-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-8">
                    <div className="relative group">
                      <img src={n.img} alt={n.name} className="w-28 h-28 rounded-3xl object-cover shadow-2xl border-4 border-white transition-transform group-hover:scale-105" />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h4 className="text-2xl font-black text-slate-800">{n.name}</h4>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-200">Clinical Active</span>
                      </div>
                      <p className="text-base font-bold text-violet-600 mb-3">{n.specialty}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {n.languages.map(lang => (
                          <span key={lang} className="text-[10px] font-black text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-100">🗣️ {lang}</span>
                        ))}
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => { setSelectedNurse(n.id); setStep('DATE'); }}
                          className="flex-1 sm:flex-none px-10 py-3.5 bg-violet-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95"
                        >
                          SELECT CLINICIAN
                        </button>
                        <button
                          onClick={() => setExpandedNurse(expandedNurse === n.id ? null : n.id)}
                          className="px-8 py-3.5 border-2 border-slate-200 text-slate-600 rounded-2xl text-xs font-black hover:bg-white hover:border-violet-200 transition-all"
                        >
                          {expandedNurse === n.id ? 'CLOSE PROFILE' : 'VIEW PROFILE'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedNurse === n.id && (
                    <div className="bg-white/80 backdrop-blur-md border-t-2 border-violet-100 p-10 space-y-10 animate-in slide-in-from-top-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Verified Certifications</h5>
                          <div className="grid grid-cols-1 gap-3">
                            {n.certifications.map(cert => (
                              <div key={cert} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700">
                                <span className="text-emerald-600 text-lg">🛡️</span> {cert}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Patient Testimonials</h5>
                          <div className="space-y-4">
                            {n.testimonials.map((t, idx) => (
                              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative">
                                <div className="absolute -top-3 -left-3 text-4xl text-slate-100 font-serif">“</div>
                                <div className="flex justify-between items-center mb-3">
                                  <span className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{t.patientName}</span>
                                  <div className="text-amber-400 text-sm">{'★'.repeat(t.rating)}</div>
                                </div>
                                <p className="text-xs text-slate-500 italic leading-relaxed">"{t.comment}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'DATE' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <header className="flex justify-between items-end">
              <div>
                <button onClick={() => setStep('NURSE')} className="text-[10px] font-black text-violet-600 mb-2 flex items-center gap-1 uppercase tracking-widest hover:underline">← Change Clinician</button>
                <h3 className="text-2xl font-black text-slate-800 italic">Select Consultation Date</h3>
              </div>
              <div className="hidden sm:flex items-center gap-3 p-3 bg-violet-50 rounded-2xl border border-violet-100">
                <img src={nurse?.img} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase">Clinician</p>
                   <p className="text-xs font-black text-violet-800">{nurse?.name}</p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {availableDates.map(date => {
                const slotsAvailable = nurse?.availability[date] && nurse.availability[date].length > 0;
                const canBook = slotsAvailable;
                const d = new Date(date);
                return (
                  <button
                    key={date}
                    disabled={!canBook}
                    onClick={() => { setSelectedDate(date); setStep('TIME'); }}
                    className={`p-8 rounded-[2rem] border-2 transition-all text-center group relative overflow-hidden ${
                      !canBook 
                        ? 'bg-slate-50 border-slate-50 opacity-40 cursor-not-allowed' 
                        : 'bg-white border-slate-100 hover:border-violet-600 hover:shadow-2xl hover:shadow-violet-100 hover:-translate-y-1'
                    }`}
                  >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-violet-600">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-3xl font-black text-slate-800 group-hover:text-violet-600">{date.split('-')[2]}</p>
                    <p className="text-[10px] font-bold text-slate-400 group-hover:text-violet-400">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
                    {canBook && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'TIME' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <header>
              <button onClick={() => setStep('DATE')} className="text-[10px] font-black text-violet-600 mb-2 flex items-center gap-1 uppercase tracking-widest hover:underline">← Back to Calendar</button>
              <h3 className="text-2xl font-black text-slate-800 italic">Clinical Time Slots for {new Date(selectedDate).toLocaleDateString('en-ZA', { dateStyle: 'long' })}</h3>
            </header>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {nurse?.availability[selectedDate]?.map(time => (
                <button
                  key={time}
                  onClick={() => { setSelectedTime(time); setStep('SERVICE'); }}
                  className={`py-6 px-4 rounded-3xl border-2 text-sm font-black transition-all ${
                    selectedTime === time ? 'bg-violet-600 text-white border-violet-600 shadow-2xl shadow-violet-200 scale-105' : 'bg-slate-50 text-slate-500 border-transparent hover:border-violet-200 hover:bg-white'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'SERVICE' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <header>
              <button onClick={() => setStep('TIME')} className="text-[10px] font-black text-violet-600 mb-2 flex items-center gap-1 uppercase tracking-widest hover:underline">← Back to Time</button>
              <h3 className="text-2xl font-black text-slate-800 italic">Appointment Modality</h3>
            </header>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'In-Person Consultation', label: 'In-Person Consultation', desc: 'Face-to-face clinical exam at our renal hub.', type: 'In-person' },
                  { id: 'Virtual Consultation', label: 'Virtual Consultation', desc: 'Secure telehealth session via clinical tunnel.', type: 'Virtual' },
                  { id: 'Check-up', label: 'Routine Check-up', desc: 'Monthly renal health maintenance.', type: 'In-person' },
                  { id: 'Follow-up', label: 'Post-Lab Follow-up', desc: 'Discuss recent pathology results.', type: 'In-person' },
                  { id: 'Dialysis', label: 'Dialysis Session', desc: 'Reserved for long-term patients.', type: 'In-person', disabled: true }
                ].map((s) => (
                  <button
                    key={s.id}
                    disabled={s.disabled}
                    onClick={() => handleServiceSelect(s.id, s.type as any)}
                    className={`flex items-center gap-6 p-6 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden ${
                      s.disabled ? 'opacity-30 grayscale cursor-not-allowed bg-slate-100 border-transparent' :
                      appointmentType === s.id ? 'border-violet-600 bg-violet-50' : 'border-slate-100 bg-white hover:border-violet-200'
                    }`}
                  >
                    {renderServiceIcon(s.id, s.disabled || false)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-lg font-black ${s.disabled ? 'text-slate-500' : 'text-slate-800'}`}>{s.label}</p>
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${s.type === 'Virtual' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.type}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold leading-tight">{s.desc}</p>
                    </div>
                    {!s.disabled && appointmentType === s.id && (
                      <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-lg">✓</div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-2 pt-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes for the Clinician</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Clinical symptoms, medication updates, or specific concerns..."
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-sm font-bold outline-none focus:border-violet-600 focus:bg-white transition-all min-h-[140px] resize-none"
                />
              </div>

              <button
                disabled={!appointmentType}
                onClick={() => {
                  if (consultationType === 'Virtual') setStep('PLATFORM');
                  else setStep('PREREQUISITE');
                }}
                className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-violet-200 hover:bg-violet-700 transition-all disabled:opacity-30 flex items-center justify-center gap-3 mt-8 active:scale-[0.98]"
              >
                PROCEED TO VERIFICATION
              </button>
            </div>
          </div>
        )}

        {step === 'PREREQUISITE' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            <header className="text-center">
               <button onClick={() => setStep('SERVICE')} className="text-[10px] font-black text-violet-600 mb-2 flex items-center gap-1 uppercase tracking-widest hover:underline mx-auto">← Back to Details</button>
               <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner">
                 {consultationType === 'In-person' ? '🆔' : '📋'}
               </div>
               <h3 className="text-3xl font-black text-slate-800 italic">
                 {consultationType === 'In-person' ? 'Clinic Requirements' : 'Digital Consent'}
               </h3>
               <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                 {consultationType === 'In-person' 
                   ? 'Please ensure you bring your South African Identity Document and Medical Aid card for clinical verification.' 
                   : 'In line with HPCSA Telemedicine guidelines, please acknowledge the virtual consultation protocol.'}
               </p>
            </header>

            <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 space-y-6">
              {consultationType === 'In-person' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center gap-3">
                    <span className="text-3xl">🇿🇦</span>
                    <p className="text-sm font-black text-slate-800">SA ID Document</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Verify Identity</p>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center gap-3">
                    <span className="text-3xl">💳</span>
                    <p className="text-sm font-black text-slate-800">Medical Aid Card</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Verify Billing</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-5 p-5 bg-white rounded-3xl border border-slate-200">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">⚖️</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">HPCSA Telemedicine Protocol</p>
                      <p className="text-xs text-slate-500 leading-relaxed">I understand that a virtual session has clinical limitations and cannot replace an ER visit for acute distress.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-5 bg-white rounded-3xl border border-slate-200">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shrink-0">🛡️</div>
                    <div>
                      <p className="text-sm font-black text-slate-800">Encrypted Clinical Tunnel</p>
                      <p className="text-xs text-slate-500 leading-relaxed">My health data will be shared over a secure peer-to-peer encrypted tunnel complying with POPIA.</p>
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-5 p-6 bg-white rounded-[2rem] border-2 border-slate-200 cursor-pointer hover:border-violet-400 transition-all group">
                <input 
                  type="checkbox" 
                  checked={acknowledged} 
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="w-7 h-7 rounded-xl border-slate-300 text-violet-600 focus:ring-violet-500 transition-all cursor-pointer"
                />
                <span className="text-xs font-black text-slate-700 leading-tight group-hover:text-violet-800 transition-colors">
                  {consultationType === 'In-person' 
                    ? 'I acknowledge that I must bring my SA ID and Medical Aid card.' 
                    : 'I provide informed clinical consent for this virtual session.'}
                </span>
              </label>
            </div>

            <button
              disabled={!acknowledged}
              onClick={handleConfirm}
              className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-violet-200 hover:bg-violet-700 transition-all disabled:opacity-30 active:scale-[0.98]"
            >
              CONFIRM & COMPLETE BOOKING
            </button>
          </div>
        )}

        {step === 'PLATFORM' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4">
            <header className="text-center">
              <button onClick={() => setStep('SERVICE')} className="text-[10px] font-black text-violet-600 mb-2 flex items-center gap-1 uppercase tracking-widest hover:underline mx-auto">← Back to Details</button>
              <h3 className="text-3xl font-black text-slate-800 italic">Select Telemedicine Platform</h3>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => setSelectedPlatform('Google Meet')}
                className={`flex flex-col items-center gap-6 p-10 rounded-[3rem] border-4 transition-all ${
                  selectedPlatform === 'Google Meet' ? 'border-blue-500 bg-blue-50 shadow-2xl shadow-blue-100 scale-105' : 'border-slate-50 bg-white hover:border-blue-200'
                }`}
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-5xl shadow-xl">💙</div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-800">Google Meet</p>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">NHA Verified Port</p>
                </div>
              </button>
              <button
                onClick={() => setSelectedPlatform('MS Teams')}
                className={`flex flex-col items-center gap-6 p-10 rounded-[3rem] border-4 transition-all ${
                  selectedPlatform === 'MS Teams' ? 'border-indigo-500 bg-indigo-50 shadow-2xl shadow-indigo-100 scale-105' : 'border-slate-50 bg-white hover:border-indigo-200'
                }`}
              >
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-5xl shadow-xl">💜</div>
                <div className="text-center">
                  <p className="text-xl font-black text-slate-800">MS Teams</p>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Enterprise Secure</p>
                </div>
              </button>
            </div>
            
            <button
              onClick={() => setStep('PREREQUISITE')}
              className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95 transition-all"
            >
              NEXT: CONSENT & VERIFY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
