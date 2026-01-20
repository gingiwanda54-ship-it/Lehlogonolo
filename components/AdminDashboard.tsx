
import React from 'react';
import { Nurse, Appointment, NurseStatus } from '../types';

interface AdminDashboardProps {
  nurses: Nurse[];
  appointments: Appointment[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ nurses, appointments }) => {
  const today = new Date().toISOString().split('T')[0];
  const todaysVisits = appointments.filter(a => a.date === today).length;

  const getStatusColor = (status: NurseStatus) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500';
      case 'On a Call': return 'bg-rose-500';
      case 'Offline': return 'bg-slate-400';
      default: return 'bg-slate-300';
    }
  };

  const getStatusLabelColor = (status: NurseStatus) => {
    switch (status) {
      case 'Available': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'On a Call': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Offline': return 'text-slate-500 bg-slate-50 border-slate-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Clinical Command Center</h2>
          <p className="text-slate-500 font-medium">Monitoring real-time kidney care operations.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 shadow-sm">
           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Live Operations Feed</span>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: '1,284', trend: '+12%', color: 'blue' },
          { label: 'Active Personnel', value: nurses.filter(n => n.status !== 'Offline').length, trend: '98% Duty', color: 'emerald' },
          { label: 'Today\'s Visits', value: todaysVisits, trend: '8 Sessions', color: 'violet' },
          { label: 'Critical Labs', value: '2', trend: 'High Priority', color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
            <p className={`text-[9px] font-bold mt-2 text-${stat.color}-600 uppercase tracking-tighter`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Live Status Section */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 italic">Personnel Real-Time Status</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updating Live</span>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nurses.map(n => (
                  <div key={n.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-violet-100 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={n.img} alt={n.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm grayscale-[0.3] group-hover:grayscale-0 transition-all" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white ${getStatusColor(n.status)} ${n.status === 'Available' ? 'animate-pulse' : ''}`}></div>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight">{n.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{n.specialty}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusLabelColor(n.status)}`}>
                      {n.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Upcoming Schedule */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-800 italic">Today's Agenda</h3>
                <button className="text-[10px] font-black text-violet-600 uppercase hover:underline">View All</button>
             </div>
             <div className="divide-y divide-slate-50">
                {appointments.filter(a => a.date === today).length > 0 ? (
                  appointments.filter(a => a.date === today).map(appt => (
                    <div key={appt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center font-black text-xs">
                          {appt.patientName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{appt.patientName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{appt.time} • {appt.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                           <p className="text-[10px] font-black text-slate-400 uppercase">Nurse</p>
                           <p className="text-xs font-bold text-slate-700">{appt.nurseName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${appt.consultationType === 'Virtual' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {appt.consultationType}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-slate-400 font-black uppercase text-xs">No Appointments Today</p>
                  </div>
                )}
             </div>
          </section>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <h4 className="text-xl font-black italic mb-6 relative z-10">Compliance Monitor</h4>
              <div className="space-y-6 relative z-10">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">POPIA Status</span>
                       <span className="text-[10px] font-black text-emerald-400 uppercase">100% Secure</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 w-full rounded-full"></div>
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NHI Interoperability</span>
                       <span className="text-[10px] font-black text-indigo-400 uppercase">Ready</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500 w-[85%] rounded-full shadow-[0_0_10px_#6366f1]"></div>
                    </div>
                 </div>
              </div>
              <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                 System Audit Log
              </button>
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 italic">Facility Notifications</h4>
              <div className="space-y-4">
                 {[
                   { id: 1, type: '⚠️', title: 'Power Backup Test', msg: 'Scheduled for 14:00 today.', color: 'amber' },
                   { id: 2, type: '💊', title: 'Medical Supply', msg: 'Renal kits stock replenished.', color: 'emerald' },
                   { id: 3, type: '🩺', title: 'SANC Audit', msg: 'Sarah Miller verified (Level 1).', color: 'blue' }
                 ].map(n => (
                   <div key={n.id} className={`p-4 rounded-2xl border-l-4 border-${n.color}-500 bg-${n.color}-50/30 flex gap-3`}>
                      <span className="text-lg">{n.type}</span>
                      <div>
                         <p className="text-xs font-black text-slate-800 tracking-tight">{n.title}</p>
                         <p className="text-[10px] text-slate-500 font-medium">{n.msg}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
