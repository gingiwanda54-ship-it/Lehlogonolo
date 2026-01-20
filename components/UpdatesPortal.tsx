
import React, { useState } from 'react';
import { MOCK_UPDATES, MOCK_FEATURE_FLAGS } from '../constants';
import { AppUpdate, FeatureFlag, UserRole } from '../types';

interface UpdatesPortalProps {
  role: UserRole;
}

const UpdatesPortal: React.FC<UpdatesPortalProps> = ({ role }) => {
  const [activeTab, setActiveTab] = useState<'UPDATES' | 'ROADMAP' | 'FLAGS'>('UPDATES');
  const [flags, setFlags] = useState<FeatureFlag[]>(MOCK_FEATURE_FLAGS);

  const toggleFlag = (id: string) => {
    if (role !== 'ADMIN') return;
    setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: !f.isEnabled } : f));
  };

  const getUpdateIcon = (type: AppUpdate['type']) => {
    switch (type) {
      case 'SECURITY': return '🛡️';
      case 'FEATURE': return '🚀';
      case 'MAINTENANCE': return '🛠️';
      default: return '📦';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="text-center space-y-3">
        <div className="w-16 h-16 bg-violet-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-xl">✨</div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Hub Evolved</h2>
        <p className="text-slate-500">Communicating transparency and growth at Kidney Hub.</p>
      </header>

      <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('UPDATES')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'UPDATES' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}
        >
          What's New
        </button>
        <button
          onClick={() => setActiveTab('ROADMAP')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'ROADMAP' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}
        >
          Roadmap
        </button>
        {role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('FLAGS')}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'FLAGS' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-400'}`}
          >
            Features
          </button>
        )}
      </div>

      {activeTab === 'UPDATES' && (
        <div className="space-y-6">
          {MOCK_UPDATES.map((update) => (
            <div key={update.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group hover:border-violet-200 transition-all">
              {update.isNew && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-1.5 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                  Latest Version
                </div>
              )}
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl shrink-0 group-hover:bg-violet-50 transition-colors">
                  {getUpdateIcon(update.type)}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{update.title}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black">v{update.version}</span>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{update.description}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Released on {update.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ROADMAP' && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🗺️</div>
            <div>
               <h3 className="text-2xl font-black text-slate-800 italic">Future of Renal Care</h3>
               <p className="text-slate-400 text-xs font-bold">Planned features for Q3-Q4 2024.</p>
            </div>
          </div>

          <div className="space-y-12">
            {[
              { q: 'Q3 2024', features: ['Biometric Smart Sync', 'Direct NHI Data Port', 'Emergency Family Alert System'], status: 'In Development', color: 'blue' },
              { q: 'Q4 2024', features: ['AI Diet Personalization', 'Cross-Provincial Provider Hub', 'Wearable GFR Integration'], status: 'Researching', color: 'indigo' },
              { q: '2025 Vision', features: ['Decentralized PHR Ownership', 'Global Renal Research Bridge'], status: 'Planned', color: 'slate' }
            ].map((phase, i) => (
              <div key={i} className="relative pl-10 border-l-4 border-slate-100 pb-2 last:pb-0">
                <div className={`absolute -left-3 top-0 w-5 h-5 rounded-full bg-white border-4 border-${phase.color}-500 shadow-sm shadow-${phase.color}-200`}></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h4 className="text-xl font-black text-slate-800">{phase.q}</h4>
                  <span className={`px-4 py-1.5 rounded-full bg-${phase.color}-50 text-${phase.color}-600 text-[10px] font-black uppercase tracking-widest border border-${phase.color}-100`}>
                    {phase.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {phase.features.map(f => (
                    <div key={f} className="p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-violet-100 transition-all">
                      <p className="text-xs font-black text-slate-700 leading-tight">{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'FLAGS' && role === 'ADMIN' && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
           <div className="flex justify-between items-center">
              <div>
                 <h3 className="text-2xl font-black text-slate-800 italic">Feature Deployment</h3>
                 <p className="text-slate-400 text-sm font-medium">Control platform extensibility in real-time.</p>
              </div>
              <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-[10px] font-black uppercase">Admin Context Active</div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {flags.map(f => (
                <div key={f.id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between gap-6 group hover:bg-white hover:border-violet-200 transition-all">
                   <div className="space-y-1">
                      <p className="text-base font-black text-slate-800">{f.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{f.description}</p>
                   </div>
                   <button 
                    onClick={() => toggleFlag(f.id)}
                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${f.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${f.isEnabled ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>
              ))}
           </div>

           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
              <span className="text-2xl">⚠️</span>
              <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                Toggling feature flags immediately affects all active users across iOS, Android, and Web platforms. Use caution during clinical operational hours.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default UpdatesPortal;
