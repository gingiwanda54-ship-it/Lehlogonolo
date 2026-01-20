
import React, { useState } from 'react';
import { Nurse, Appointment } from '../types';

interface AdminCalendarProps {
  nurses: Nurse[];
  appointments: Appointment[];
  onUpdateNurse: (nurse: Nurse) => void;
}

const AdminCalendar: React.FC<AdminCalendarProps> = ({ nurses, appointments, onUpdateNurse }) => {
  const [selectedNurseId, setSelectedNurseId] = useState<string>(nurses[0].id);
  const [currentMonth, setCurrentMonth] = useState(new Date(2024, 4)); // May 2024
  const [editingSlotsDate, setEditingSlotsDate] = useState<string | null>(null);
  
  const selectedNurse = nurses.find(n => n.id === selectedNurseId) || nurses[0];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const getDayKey = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getAppointmentsForDay = (day: number) => {
    const dateKey = getDayKey(day);
    return appointments.filter(a => a.date === dateKey && a.nurseId === selectedNurseId);
  };

  const isBlocked = (day: number) => {
    const dateKey = getDayKey(day);
    return selectedNurse.blockedDates?.includes(dateKey);
  };

  const toggleBlockDay = (day: number) => {
    const dateKey = getDayKey(day);
    const currentBlocks = selectedNurse.blockedDates || [];
    const newBlocks = currentBlocks.includes(dateKey)
      ? currentBlocks.filter(d => d !== dateKey)
      : [...currentBlocks, dateKey];
    
    onUpdateNurse({
      ...selectedNurse,
      blockedDates: newBlocks
    });
  };

  const hasAvailability = (day: number) => {
    const dateKey = getDayKey(day);
    return selectedNurse.availability[dateKey] && selectedNurse.availability[dateKey].length > 0;
  };

  const toggleSlot = (dateKey: string, time: string) => {
    const currentSlots = selectedNurse.availability[dateKey] || [];
    const newSlots = currentSlots.includes(time)
      ? currentSlots.filter(t => t !== time)
      : [...currentSlots, time].sort();
    
    onUpdateNurse({
      ...selectedNurse,
      availability: {
        ...selectedNurse.availability,
        [dateKey]: newSlots
      }
    });
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const handlePrevMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() + 1));

  const ALL_TIME_SLOTS = [
    "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Scheduling Calendar</h2>
          <p className="text-slate-500">Real-time nurse availability and master session planning.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-black text-slate-400 uppercase">Managing:</label>
          <select 
            value={selectedNurseId}
            onChange={(e) => setSelectedNurseId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-base font-bold text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
          >
            {nurses.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-slate-800">{monthName} {year}</h3>
                <span className="hidden sm:inline px-3 py-1 bg-violet-50 text-violet-600 rounded-full text-[10px] font-black uppercase tracking-widest">Master View</span>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">←</button>
                <button onClick={handleNextMonth} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">→</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-2">{d}</div>
              ))}
              
              {Array.from({ length: startDayOfMonth(year, currentMonth.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 sm:h-32 rounded-3xl bg-slate-50/30"></div>
              ))}

              {Array.from({ length: daysInMonth(year, currentMonth.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const dateKey = getDayKey(day);
                const appts = getAppointmentsForDay(day);
                const blocked = isBlocked(day);
                const available = hasAvailability(day);

                return (
                  <div 
                    key={day} 
                    className={`h-20 sm:h-32 rounded-2xl sm:rounded-3xl border p-1 sm:p-3 flex flex-col transition-all group relative ${
                      blocked ? 'bg-slate-50 border-slate-100' : 
                      available ? 'bg-white border-emerald-100 hover:border-emerald-300' : 'bg-white border-slate-50 hover:border-violet-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <span className={`text-xs sm:text-sm font-black ${blocked ? 'text-slate-300' : 'text-slate-800'}`}>{day}</span>
                      <div className="flex gap-1">
                        {available && !blocked && (
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-200"></span>
                        )}
                        {blocked && (
                           <span className="text-[8px] sm:text-[10px]">🔒</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-0.5 sm:space-y-1 scrollbar-hide">
                      {appts.map(a => (
                        <div key={a.id} className="text-[6px] sm:text-[8px] font-black bg-violet-600 text-white p-0.5 sm:p-1 rounded-sm sm:rounded-md truncate">
                          {a.time}
                        </div>
                      ))}
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-1 right-1 flex gap-0.5 sm:gap-1 transition-opacity">
                       <button 
                        onClick={() => setEditingSlotsDate(dateKey)}
                        className="p-1 sm:p-1.5 bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-600 rounded-lg shadow-sm"
                        title="Manage Slots"
                       >
                         ➕
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {editingSlotsDate && (
             <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-emerald-100 shadow-xl animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-800">Edit Slots</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(editingSlotsDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <button onClick={() => setEditingSlotsDate(null)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_TIME_SLOTS.map(time => {
                    const isActive = selectedNurse.availability[editingSlotsDate]?.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() => toggleSlot(editingSlotsDate, time)}
                        className={`py-3 px-3 rounded-xl text-xs font-black transition-all ${
                          isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
             </div>
          )}

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h4 className="text-lg font-black text-slate-800 mb-6">Calendar Key</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg bg-violet-600 flex items-center justify-center text-[8px] text-white">★</div>
                <span className="text-sm font-bold text-slate-600">Scheduled Session</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-lg border-2 border-emerald-500 bg-white"></div>
                <span className="text-sm font-bold text-slate-600">Open Availability</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;
