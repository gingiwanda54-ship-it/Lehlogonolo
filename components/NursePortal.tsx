
import React, { useState } from 'react';
import { Nurse, AppRoute, Appointment, NurseStatus } from '../types';

interface NursePortalProps {
  nurse: Nurse;
  appointments: Appointment[];
  onUpdateNurse: (nurse: Nurse) => void;
  onNavigate: (route: AppRoute) => void;
}

const ALL_TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
];

const NursePortal: React.FC<NursePortalProps> = ({ nurse, appointments, onUpdateNurse, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'AVAILABILITY'>('HOME');
  const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const nurseAppts = appointments.filter(a => a.nurseId === nurse.id);
  const todayAppts = nurseAppts.filter(a => a.date === new Date().toISOString().split('T')[0]);

  const toggleSlot = (time: string) => {
    const currentAvailability = { ...nurse.availability };
    const dateSlots = currentAvailability[activeDate] || [];
    
    const newSlots = dateSlots.includes(time)
      ? dateSlots.filter(t => t !== time)
      : [...dateSlots, time].sort();
    
    onUpdateNurse({
      ...nurse,
      availability: {
        ...currentAvailability,
        [activeDate]: newSlots
      }
    });
  };

  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img src={nurse.img} alt={nurse.name} className="w-20 h-20 rounded-3xl object-cover shadow-2xl border-4 border-white" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Welcome, {nurse.name.split(' ')[1]}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{nurse.nurseType}</span>
              <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
              <span className="text-xs font-bold text-blue-600">{nurse.specialty}</span>
            </div>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('HOME')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'HOME' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            SHIFT HOME
          </button>
          <button 
            onClick={() => setActiveTab('AVAILABILITY')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black transition-all ${activeTab === 'AVAILABILITY' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            MY SLOTS
          </button>
        </div>
      </header>

      {activeTab === 'HOME' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Today\'s Patients', value: todayAppts.length, color: 'blue' },
                { label: 'Total Sessions', value: nurseAppts.length, color: 'indigo' },
                { label: 'Avg Satisfaction', value: '4.9/5', color: 'emerald' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-800 tracking-tight">Clinical Agenda: Today</h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-ZA', { dateStyle: 'long' })}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {todayAppts.length === 0 ? (
                  <div className="p-20 text-center">
                    <p className="text-slate-400 font-bold">No patients scheduled for today.</p>
                    <button onClick={() => setActiveTab('AVAILABILITY')} className="text-blue-600 text-xs font-black uppercase tracking-widest mt-4 hover:underline">Manage Availability →</button>
                  </div>
                ) : todayAppts.map(appt => (
                  <div key={appt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-lg">
                        {appt.patientName[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{appt.patientName}</p>
                        <p className="text-xs text-slate-500 font-medium">{appt.type} • {appt.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       {appt.consultationType === 'Virtual' && (
                         <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl shadow-lg shadow-blue-100">JOIN CALL</button>
                       )}
                       <button className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl">DETAILS</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 group-hover:rotate-12 transition-transform">🩺</div>
                <h4 className="text-xl font-black italic mb-2 relative z-10">Clinical Dashboard</h4>
                <p className="text-blue-100 text-sm mb-6 relative z-10">You are currently listed as <span className="text-white font-black underline">AVAILABLE</span> for emergency telehealth inquiries.</p>
                <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-xs shadow-xl relative z-10">SET OFFLINE</button>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Staff Quick Links</h4>
                <div className="space-y-3">
                   {['Clinical Guidelines', 'Emergency Protocol', 'Nurse Chat Room', 'Support Helpdesk'].map(link => (
                     <button key={link} className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-blue-50 transition-all text-xs font-bold text-slate-700">
                        {link}
                     </button>
                   ))}
                </div>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in slide-in-from-bottom-4">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Date</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {availableDates.map(date => (
                <button
                  key={date}
                  onClick={() => setActiveDate(date)}
                  className={`w-full p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${
                    activeDate === date ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 bg-white text-slate-400 hover:border-slate-100'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase opacity-60">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                    <p className="text-sm font-black">{date.split('-')[2]} {new Date(date).toLocaleDateString('en-US', { month: 'short' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {(nurse.availability[date] || []).length} SLOTS
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
                <div className="flex justify-between items-end">
                   <div>
                     <h3 className="text-2xl font-black text-slate-800 italic">Availability: {activeDate}</h3>
                     <p className="text-slate-500 text-sm">Select the hours you are available for clinical consultations.</p>
                   </div>
                   <div className="flex gap-2">
                     <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Copy from yesterday</button>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                   {ALL_TIME_SLOTS.map(time => {
                     const isSelected = nurse.availability[activeDate]?.includes(time);
                     return (
                       <button
                         key={time}
                         onClick={() => toggleSlot(time)}
                         className={`py-6 px-4 rounded-3xl text-sm font-black transition-all border-4 ${
                           isSelected 
                             ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-100 scale-105' 
                             : 'bg-slate-50 border-transparent text-slate-400 hover:border-blue-200'
                         }`}
                       >
                         {time}
                       </button>
                     );
                   })}
                </div>

                <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
                   <div className="flex items-center gap-4 text-slate-400">
                     <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">💡</div>
                     <p className="text-xs font-medium max-w-sm italic">Patients will only see dates and times selected above during their booking process.</p>
                   </div>
                   <button className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">PUBLISH SCHEDULE</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NursePortal;
