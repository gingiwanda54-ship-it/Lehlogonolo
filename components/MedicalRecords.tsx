
import React, { useState } from 'react';
import { MOCK_RECORDS } from '../constants';
import { UserRole, LegalStatus } from '../types';

interface Props {
  role: UserRole;
  legalStatus: LegalStatus;
  onUpdateLegal: (status: Partial<LegalStatus>) => void;
  privacyMode?: boolean;
}

const MedicalRecords: React.FC<Props> = ({ role, legalStatus, onUpdateLegal, privacyMode = true }) => {
  const [tab, setTab] = useState<'RECORDS' | 'TRUST'>('RECORDS');
  const [sharing, setSharing] = useState<string | null>(null);
  const [showConsentWarning, setShowConsentWarning] = useState(false);
  
  const [indemnitySignature, setIndemnitySignature] = useState('');
  const [indemnityDate, setIndemnityDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [popiaSignature, setPopiaSignature] = useState('');
  const [popiaDate, setPopiaDate] = useState(new Date().toISOString().split('T')[0]);

  const handleShare = (id: string) => {
    if (!legalStatus.indemnitySigned || !legalStatus.popiaConsent) {
      setShowConsentWarning(true);
      setTab('TRUST');
      return;
    }
    setSharing(id);
    setTimeout(() => setSharing(null), 2000);
  };

  const handleSignIndemnity = () => {
    if (indemnitySignature.length < 3) return;
    onUpdateLegal({ indemnitySigned: true, indemnityDate: indemnityDate });
  };

  const handleSignPopia = () => {
    if (popiaSignature.length < 3) return;
    onUpdateLegal({ popiaConsent: true, popiaDate: popiaDate, dataSharingConsent: true });
  };

  const toggleConsentPref = (key: keyof LegalStatus['sharingPreferences']) => {
    const newPrefs = { ...legalStatus.sharingPreferences, [key]: !legalStatus.sharingPreferences[key] };
    onUpdateLegal({ sharingPreferences: newPrefs, dataSharingConsent: Object.values(newPrefs).some(v => v) });
  };

  const maskHpcsa = (id?: string) => {
    if (!id) return '';
    if (!privacyMode) return id;
    return id.substring(0, 7) + '••••';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Medical Archives</h2>
          <p className="text-slate-500 font-medium">South African NHA & PAIA Compliant Storage.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button onClick={() => setTab('RECORDS')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'RECORDS' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400'}`}>All Records</button>
          <button onClick={() => setTab('TRUST')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${tab === 'TRUST' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>
            🛡️ ZA Compliance
            {(!legalStatus.indemnitySigned || !legalStatus.popiaConsent) && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
          </button>
        </div>
      </header>

      {showConsentWarning && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 text-rose-700">
            <span className="text-xl">⚠️</span>
            <p className="text-sm font-bold">PAIA/POPIA Enforcement: Compliance required before external clinical sharing.</p>
          </div>
          <button onClick={() => setShowConsentWarning(false)} className="text-rose-400 font-bold p-2">✕</button>
        </div>
      )}

      {tab === 'RECORDS' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_RECORDS.map((record) => (
              <div key={record.id} className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                      {record.fileType === 'Lab' ? '🧪' : record.fileType === 'Dialysis' ? '🏥' : '💊'}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg group-hover:text-violet-600 transition-colors">{record.title}</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{record.date} • {record.doctor}</p>
                      <p className="text-[8px] text-slate-300 font-bold uppercase tracking-widest mt-0.5">HPCSA: {maskHpcsa(record.doctorHpcsaNumber || 'HPCSA-1234567')}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                    {record.status}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-100/50 relative">
                  <p className={`text-xs text-slate-600 italic transition-all ${privacyMode ? 'blur-md select-none' : ''}`}>"{record.description}"</p>
                  {privacyMode && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded-full border border-slate-100">Summary Masked</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-3.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-100">Open Report</button>
                  <button onClick={() => handleShare(record.id)} className="px-5 py-3.5 border border-slate-100 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    {sharing === record.id ? '✅ Shared' : '🔗 Link'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-5 bg-slate-100 text-slate-500 rounded-[1.8rem] font-black text-xs hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-[0.2em] flex items-center justify-center gap-3">
             <span>📄</span> PAIA SECTION 13 RECORDS REQUEST
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 relative overflow-hidden">
            <header className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight italic">POPIA Consent</h3>
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mt-1">SA Act No. 4 of 2013 Compliance</p>
              </div>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-indigo-100">🇿🇦</div>
            </header>
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium mb-6">I voluntarily consent to the processing of my special personal information for renal health management in compliance with Section 11 of POPIA.</p>
              <div className="space-y-4">
                {[
                  { key: 'labs', label: 'Local Lab Partners', desc: 'Sync results from SA Pathcare/Lancet.', icon: '🧪' },
                  { key: 'specialists', label: 'Care Circle', desc: 'Share with registered specialists.', icon: '👨‍⚕️' },
                  { key: 'research', label: 'Health Research', desc: 'Anonymized HREC standards.', icon: '🎓' }
                ].map(pref => (
                  <button key={pref.key} onClick={() => toggleConsentPref(pref.key as any)} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${legalStatus.sharingPreferences[pref.key as keyof LegalStatus['sharingPreferences']] ? 'bg-indigo-600 border-indigo-600 shadow-lg' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center gap-4 text-left">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${legalStatus.sharingPreferences[pref.key as keyof LegalStatus['sharingPreferences']] ? 'bg-white/10' : 'bg-slate-50'}`}>{pref.icon}</div>
                      <div>
                        <p className={`font-bold text-xs ${legalStatus.sharingPreferences[pref.key as keyof LegalStatus['sharingPreferences']] ? 'text-white' : 'text-slate-800'}`}>{pref.label}</p>
                        <p className={`text-[9px] ${legalStatus.sharingPreferences[pref.key as keyof LegalStatus['sharingPreferences']] ? 'text-indigo-100' : 'text-slate-400'}`}>{pref.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {!legalStatus.popiaConsent ? (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" value={popiaSignature} onChange={(e) => setPopiaSignature(e.target.value)} placeholder="Type Legal Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-serif italic outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all" />
                  <input type="date" value={popiaDate} onChange={(e) => setPopiaDate(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-semibold outline-none focus:ring-4" />
                </div>
                <button onClick={handleSignPopia} disabled={popiaSignature.length < 3} className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">CONFIRM POPIA COMPLIANCE</button>
              </div>
            ) : (
              <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🛡️</div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em] mb-0.5">POPIA Status</p>
                    <p className="text-sm font-bold text-emerald-900 leading-tight">ACTIVE CONSENT</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 relative overflow-hidden">
             <header className="relative z-10 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight italic">Legal Indemnity</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">SA Clinical Liability Protocol</p>
              </div>
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl shadow-slate-100">⚖️</div>
            </header>
            <div className="h-64 overflow-y-auto bg-slate-50 p-6 rounded-[2rem] text-[11px] leading-relaxed text-slate-500 font-serif border-2 border-slate-100 shadow-inner">
              <p className="font-bold text-slate-800 mb-2 underline uppercase">Clinical Services Release</p>
              Kidney Hub facilitates renal monitoring. As per NHA guidelines, all digital records are ancillary to professional clinical judgment. Patients acknowledge their responsibility to present at an ER for emergencies. Agreement is subject to the High Court of South Africa.
            </div>
            {!legalStatus.indemnitySigned ? (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" value={indemnitySignature} onChange={(e) => setIndemnitySignature(e.target.value)} placeholder="Type Legal Name" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-serif italic font-semibold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" />
                  <input type="date" value={indemnityDate} onChange={(e) => setIndemnityDate(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-semibold outline-none focus:ring-4" />
                </div>
                <button onClick={handleSignIndemnity} disabled={indemnitySignature.length < 3} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-slate-100 hover:bg-black transition-all">EXECUTE ZA INDEMNITY</button>
              </div>
            ) : (
              <div className="p-6 bg-slate-900 text-white rounded-[2rem] border border-slate-800 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">📜</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Agreement Logged</p>
                    <p className="text-sm font-bold leading-tight uppercase">Indemnity Signed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;
