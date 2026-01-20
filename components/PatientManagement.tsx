
import React, { useState } from 'react';
import { MOCK_RECORDS } from '../constants';
import { LegalStatus } from '../types';

interface PatientManagementProps {
  legalStatus?: LegalStatus;
  privacyMode?: boolean;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ legalStatus, privacyMode = true }) => {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    const next = new Set(revealedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedIds(next);
  };

  const maskName = (name: string, id: string) => {
    if (!privacyMode || revealedIds.has(id)) return name;
    const parts = name.split(' ');
    return parts.map(p => p[0] + '••••').join(' ');
  };

  const maskId = (id: string, internalId: string) => {
    if (!privacyMode || revealedIds.has(internalId)) return id;
    return 'KH-••••';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Patient Registry</h2>
          <p className="text-slate-500 font-medium">Monitoring health metrics and POPIA compliance.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none bg-white border-2 border-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-bold hover:border-violet-200 transition-all">
             Audit Trail
          </button>
          <button className="flex-1 sm:flex-none bg-violet-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all active:scale-95">
            Add Entry
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-lg">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-black text-slate-800 flex items-center gap-3 italic">
                Clinical Roster
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">E2EE Protected</span>
              </h3>
              {privacyMode && (
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click to reveal sensitive PII</p>
              )}
            </div>
            <div className="space-y-4">
              {[
                { name: 'John Doe', id: 'KH-8829', internal: 'p1', indemnity: legalStatus?.indemnitySigned ? 'SIGNED' : 'PENDING', popia: legalStatus?.popiaConsent ? 'COMPLIANT' : 'PENDING' },
                { name: 'Jane Smith', id: 'KH-9102', internal: 'p2', indemnity: 'SIGNED', popia: 'COMPLIANT' },
                { name: 'Sipho Nkosi', id: 'KH-1244', internal: 'p3', indemnity: 'PENDING', popia: 'COMPLIANT' }
              ].map((p, i) => (
                <div 
                  key={i} 
                  onClick={() => toggleReveal(p.internal)}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-violet-200 hover:bg-white transition-all cursor-pointer group gap-4 relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 font-bold text-lg group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                      {p.name[0]}
                    </div>
                    <div>
                      <span className={`font-bold text-slate-800 block transition-all ${privacyMode && !revealedIds.has(p.internal) ? 'blur-[3px]' : ''}`}>
                        {maskName(p.name, p.internal)}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        ID: {maskId(p.id, p.internal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between relative z-10">
                    <div className="flex gap-4 text-right">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Indemnity</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${p.indemnity === 'SIGNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {p.indemnity}
                        </span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">POPIA</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${p.popia === 'COMPLIANT' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                          {p.popia}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-violet-600 transition-colors whitespace-nowrap">VIEW →</span>
                  </div>
                  {privacyMode && !revealedIds.has(p.internal) && (
                    <div className="absolute right-0 bottom-0 top-0 w-1 bg-indigo-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl h-fit relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
          <h3 className="font-black text-xl mb-6 flex items-center gap-3 italic">
            <span>🇿🇦</span> Privacy Audit
          </h3>
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Global PII Shield</p>
               <p className="text-xs font-medium text-slate-400 leading-relaxed">System-wide obfuscation is active. Patient identities are masked in global views to prevent unauthorized exposure.</p>
            </div>
            {!legalStatus?.indemnitySigned && (
              <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 space-y-1">
                <p className="text-[10px] font-black text-rose-400 uppercase">Action Required</p>
                <p className="text-xs font-bold text-slate-300">Clinical data sharing is currently restricted for 1 registry entry due to missing POPIA sign-off.</p>
              </div>
            )}
            <div className="pt-4 border-t border-white/5">
               <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-4">Last Automated Audit: Today, 08:42 AM</p>
               <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Download Audit PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientManagement;
