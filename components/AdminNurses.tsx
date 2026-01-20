
import React, { useState, useMemo } from 'react';
import { Nurse, NurseCategory, NurseStatus, Testimonial } from '../types';

interface AdminNursesProps {
  nurses: Nurse[];
  onUpdateNurse: (nurse: Nurse) => void;
  onAddNurse: (nurse: Nurse) => void;
  privacyMode?: boolean;
}

const NURSE_TYPES: NurseCategory[] = [
  'Professional Nurse (RN)',
  'Staff Nurse (EN)',
  'Nursing Assistant (ENA)',
  'Nurse Practitioner (NP)'
];

const SA_LANGUAGES = [
  'English', 'Afrikaans', 'isiZulu', 'isiXhosa', 'isiNdebele', 'Sesotho', 'Northern Sotho', 'Setswana', 'siSwati', 'Tshivenda', 'Xitsonga'
];

const NURSE_STATUSES: NurseStatus[] = ['Available', 'On a Call', 'Offline'];

const ALL_TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

const AdminNurses: React.FC<AdminNursesProps> = ({ nurses, onUpdateNurse, onAddNurse, privacyMode = true }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNurse, setEditingNurse] = useState<Partial<Nurse> | null>(null);
  const [activeTab, setActiveTab] = useState<'INFO' | 'SLOTS' | 'TESTIMONIALS'>('INFO');
  const [activeSlotDate, setActiveSlotDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC' | null>(null);
  const [newCert, setNewCert] = useState('');

  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
    patientName: '',
    rating: 5,
    comment: ''
  });

  const sortedNurses = useMemo(() => {
    if (!sortDirection) return nurses;
    return [...nurses].sort((a, b) => {
      const specA = a.specialty.toLowerCase();
      const specB = b.specialty.toLowerCase();
      if (sortDirection === 'ASC') return specA > specB ? 1 : -1;
      return specA < specB ? 1 : -1;
    });
  }, [nurses, sortDirection]);

  const toggleSort = () => {
    if (sortDirection === null) setSortDirection('ASC');
    else if (sortDirection === 'ASC') setSortDirection('DESC');
    else setSortDirection(null);
  };

  const handleEdit = (nurse: Nurse) => {
    setEditingNurse(nurse);
    setActiveTab('INFO');
    setIsEditing(true);
    setNewCert('');
  };

  const handleAddNew = () => {
    setEditingNurse({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      sancNumber: '',
      nurseType: 'Professional Nurse (RN)',
      specialty: '',
      img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
      active: true,
      status: 'Available',
      certifications: [],
      languages: ['English'],
      testimonials: [],
      availability: {}
    });
    setActiveTab('INFO');
    setIsEditing(true);
    setNewCert('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNurse) return;
    const fullNurse = {
      ...editingNurse,
      languages: editingNurse.languages || ['English'],
      availability: editingNurse.availability || {},
      testimonials: editingNurse.testimonials || [],
      certifications: editingNurse.certifications || []
    } as Nurse;
    const existing = nurses.find(n => n.id === fullNurse.id);
    if (existing) onUpdateNurse(fullNurse);
    else onAddNurse(fullNurse);
    setIsEditing(false);
    setEditingNurse(null);
  };

  const addCertification = () => {
    if (!newCert.trim() || !editingNurse) return;
    const currentCerts = editingNurse.certifications || [];
    if (currentCerts.includes(newCert.trim())) return;
    setEditingNurse({ ...editingNurse, certifications: [...currentCerts, newCert.trim()] });
    setNewCert('');
  };

  const removeCertification = (cert: string) => {
    if (!editingNurse) return;
    const currentCerts = editingNurse.certifications || [];
    setEditingNurse({ ...editingNurse, certifications: currentCerts.filter(c => c !== cert) });
  };

  const toggleLanguage = (lang: string) => {
    if (!editingNurse) return;
    const currentLangs = editingNurse.languages || [];
    const newLangs = currentLangs.includes(lang) ? currentLangs.filter(l => l !== lang) : [...currentLangs, lang];
    setEditingNurse({ ...editingNurse, languages: newLangs });
  };

  const toggleSlot = (time: string) => {
    if (!editingNurse) return;
    const currentAvailability = { ...(editingNurse.availability || {}) };
    const dateSlots = currentAvailability[activeSlotDate] || [];
    const newSlots = dateSlots.includes(time) ? dateSlots.filter(t => t !== time) : [...dateSlots, time].sort();
    setEditingNurse({ ...editingNurse, availability: { ...currentAvailability, [activeSlotDate]: newSlots } });
  };

  const handleAddTestimonial = () => {
    if (!editingNurse || !newTestimonial.patientName || !newTestimonial.comment) return;
    const currentTestimonials = [...(editingNurse.testimonials || [])];
    const updatedTestimonials = [newTestimonial, ...currentTestimonials];
    setEditingNurse({ ...editingNurse, testimonials: updatedTestimonials });
    setNewTestimonial({ patientName: '', rating: 5, comment: '' });
  };

  const removeTestimonial = (index: number) => {
    if (!editingNurse) return;
    const updated = [...(editingNurse.testimonials || [])];
    updated.splice(index, 1);
    setEditingNurse({ ...editingNurse, testimonials: updated });
  };

  const getStatusColor = (status: NurseStatus) => {
    switch (status) {
      case 'Available': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'On a Call': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Offline': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-400';
    }
  };

  const availableDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const maskSanc = (sanc: string) => {
    if (!privacyMode) return sanc;
    return sanc.substring(0, 5) + '••••';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Personnel Hub</h2>
          <p className="text-slate-500 font-medium">Coordinate your clinical staff records securely.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
           <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
             <span className="text-[10px] font-black uppercase tracking-widest">Vault Protected</span>
           </div>
          <button 
            onClick={handleAddNew}
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <span>➕</span> Onboard Clinician
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-lg font-black text-slate-800 italic">Clinical Registry</h3>
          <button onClick={toggleSort} className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-2">
            Sort by Specialty {sortDirection === 'ASC' ? '↑' : sortDirection === 'DESC' ? '↓' : ''}
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {sortedNurses.map(nurse => (
            <div key={nurse.id} className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <img src={nurse.img} className="w-16 h-16 rounded-2xl object-cover shadow-md grayscale-[0.3] group-hover:grayscale-0 transition-all" alt={nurse.name} />
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{nurse.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">{nurse.specialty}</span>
                    <span className="text-slate-300">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${getStatusColor(nurse.status)}`}>
                      {nurse.status}
                    </span>
                  </div>
                  <div className="mt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    SANC: {maskSanc(nurse.sancNumber)}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => handleEdit(nurse)}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-xl text-xs font-black hover:border-violet-600 hover:text-violet-600 transition-all"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isEditing && editingNurse && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="bg-violet-600 p-10 text-white flex flex-col shrink-0">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-black italic tracking-tighter">
                    {nurses.find(n => n.id === editingNurse.id) ? 'Refine Profile' : 'Staff Onboarding'}
                  </h3>
                  <p className="text-violet-200 text-[10px] font-black uppercase tracking-[0.2em] mt-1">NHA & POPIA Compliant Records</p>
                </div>
                <button onClick={() => setIsEditing(false)} className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors text-xl">✕</button>
              </div>
              <div className="flex bg-black/10 rounded-2xl p-1.5 self-start">
                <button onClick={() => setActiveTab('INFO')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'INFO' ? 'bg-white text-violet-800 shadow-xl shadow-violet-900/10' : 'text-white/60 hover:text-white'}`}>IDENTITY</button>
                <button onClick={() => setActiveTab('SLOTS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'SLOTS' ? 'bg-white text-violet-800 shadow-xl shadow-violet-900/10' : 'text-white/60 hover:text-white'}`}>ROSTER</button>
                <button onClick={() => setActiveTab('TESTIMONIALS')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'TESTIMONIALS' ? 'bg-white text-violet-800 shadow-xl shadow-violet-900/10' : 'text-white/60 hover:text-white'}`}>TESTIMONIALS</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
              {activeTab === 'INFO' && (
                <form id="nurse-form" onSubmit={handleSave} className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-center gap-8 mb-4 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 border-dashed">
                    <div className="relative group">
                      <img src={editingNurse.img} alt="Preview" className="w-28 h-28 rounded-3xl object-cover shadow-2xl border-4 border-white transition-transform group-hover:scale-105" />
                      <div className="absolute -bottom-2 -right-2 bg-violet-600 w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] shadow-lg">📸</div>
                    </div>
                    <div className="flex-1 space-y-2 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Photo URL</label>
                      <input 
                        type="text" 
                        value={editingNurse.img}
                        onChange={e => setEditingNurse({...editingNurse, img: e.target.value})}
                        className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-bold focus:border-violet-500 outline-none transition-all"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={editingNurse.name}
                        onChange={e => setEditingNurse({...editingNurse, name: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-violet-500 outline-none transition-all"
                        placeholder="e.g. Nurse Sarah Miller"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SANC Registration</label>
                      <input 
                        required
                        type="text" 
                        value={editingNurse.sancNumber}
                        onChange={e => setEditingNurse({...editingNurse, sancNumber: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-violet-500 outline-none transition-all"
                        placeholder="SANC-XXXXXX"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinician Type</label>
                      <select 
                        required
                        value={editingNurse.nurseType}
                        onChange={e => setEditingNurse({...editingNurse, nurseType: e.target.value as NurseCategory})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-violet-500 outline-none transition-all appearance-none"
                      >
                        {NURSE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Portal Status</label>
                      <select 
                        required
                        value={editingNurse.status}
                        onChange={e => setEditingNurse({...editingNurse, status: e.target.value as NurseStatus})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-violet-500 outline-none transition-all appearance-none"
                      >
                        {NURSE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Specialty</label>
                    <input 
                      required
                      type="text" 
                      value={editingNurse.specialty}
                      onChange={e => setEditingNurse({...editingNurse, specialty: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:border-violet-500 outline-none transition-all"
                      placeholder="e.g. Renal Transplant Coordinator"
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Credentials</label>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">Verified SANC Status</span>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                       <div className="flex flex-wrap gap-2">
                         {editingNurse.certifications && editingNurse.certifications.length > 0 ? (
                           editingNurse.certifications.map(cert => (
                             <div key={cert} className="flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1.5 rounded-xl border border-violet-200 text-[10px] font-black uppercase">
                               <span>🛡️ {cert}</span>
                               <button type="button" onClick={() => removeCertification(cert)} className="w-4 h-4 bg-violet-600 text-white rounded-full flex items-center justify-center hover:bg-violet-800 transition-colors">✕</button>
                             </div>
                           ))
                         ) : (
                           <p className="text-[10px] text-slate-400 italic font-medium p-4 text-center w-full">No professional certifications indexed for this clinician.</p>
                         )}
                       </div>
                       <div className="flex gap-3">
                         <input type="text" value={newCert} onChange={e => setNewCert(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCertification())} className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-violet-400 transition-all" placeholder="e.g. Advanced Renal Care, ACLS, BLS..." />
                         <button type="button" onClick={addCertification} disabled={!newCert.trim()} className="bg-violet-600 text-white px-5 py-3 rounded-xl font-black text-xs hover:bg-violet-700 transition-all disabled:opacity-30">ADD</button>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linguistic Capabilities</label>
                      <span className="text-[9px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full uppercase">11 Official Languages</span>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {SA_LANGUAGES.map(lang => {
                          const isSelected = editingNurse.languages?.includes(lang);
                          return (
                            <button key={lang} type="button" onClick={() => toggleLanguage(lang)} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${isSelected ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-100 scale-[1.02]' : 'bg-white border-slate-100 text-slate-500 hover:border-violet-200 hover:text-slate-700'}`}>
                              <span className="text-[11px] font-black truncate">{lang}</span>
                              {isSelected && <span className="text-[10px]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {activeTab === 'SLOTS' && (
                <div className="space-y-8 animate-in fade-in">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-3">Target Date for Slot Allocation</label>
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                      {availableDates.map(date => (
                        <button key={date} type="button" onClick={() => setActiveSlotDate(date)} className={`px-6 py-3 rounded-2xl text-xs font-black transition-all shrink-0 border-2 ${activeSlotDate === date ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 bg-white text-slate-400 hover:border-violet-200'}`}>
                          <p className="text-[8px] opacity-60 uppercase mb-0.5">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          {date.split('-')[2]} {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-slate-100 border-dashed">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-base font-black text-slate-800 italic">Availability Matrix: {activeSlotDate}</h4>
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-violet-600 shadow-sm"></span>
                          <span className="text-[9px] font-black text-slate-500 uppercase">Allocated</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {ALL_TIME_SLOTS.map(time => {
                        const isSelected = editingNurse.availability?.[activeSlotDate]?.includes(time);
                        return (
                          <button key={time} type="button" onClick={() => toggleSlot(time)} className={`py-5 px-4 rounded-2xl text-xs font-black transition-all border-2 ${isSelected ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-200 scale-105' : 'bg-white border-white text-slate-400 hover:border-violet-100 hover:text-slate-600'}`}>
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'TESTIMONIALS' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 border-dashed space-y-6">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest ml-1 italic">Log Patient Feedback</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Alias</label>
                        <input type="text" value={newTestimonial.patientName} onChange={e => setNewTestimonial({...newTestimonial, patientName: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-violet-500 outline-none" placeholder="e.g. Patient John S." />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Rating</label>
                        <div className="flex items-center gap-3 py-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setNewTestimonial({...newTestimonial, rating: star})} className={`text-3xl transition-all hover:scale-125 ${newTestimonial.rating >= star ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience Summary</label>
                      <textarea value={newTestimonial.comment} onChange={e => setNewTestimonial({...newTestimonial, comment: e.target.value})} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:border-violet-500 outline-none resize-none" rows={3} placeholder="Professionalism feedback..." />
                    </div>
                    <button onClick={handleAddTestimonial} disabled={!newTestimonial.patientName || !newTestimonial.comment} className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all disabled:opacity-20 active:scale-95">COMMIT TESTIMONIAL</button>
                  </div>
                  <div className="space-y-5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Experience Archive</h4>
                    {editingNurse.testimonials && editingNurse.testimonials.length > 0 ? (
                      editingNurse.testimonials.map((t, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group hover:border-violet-200 transition-all">
                          <button onClick={() => removeTestimonial(idx)} className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 text-[9px] font-black uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100">Remove</button>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-black text-slate-800 tracking-tight">{t.patientName}</span>
                            <div className="text-amber-400 text-sm">{'★'.repeat(t.rating)}</div>
                          </div>
                          <p className="text-xs text-slate-500 italic leading-relaxed font-medium">"{t.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="text-4xl mb-4 opacity-20">📜</div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No testimonials indexed.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="p-10 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
              <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-500 rounded-3xl font-black text-xs uppercase hover:bg-slate-50 transition-all">DISCARD</button>
              <button form="nurse-form" type="submit" onClick={handleSave} className="flex-[2] py-5 bg-violet-600 text-white rounded-3xl font-black text-xs uppercase shadow-2xl shadow-violet-200 hover:bg-violet-700 transition-all active:scale-95">SAVE PROFILE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNurses;
