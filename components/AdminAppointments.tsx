
import React from 'react';
import { MeetingPlatform, Appointment } from '../types';

interface AdminAppointmentsProps {
  appointments: Appointment[];
  onJoinRoom: (roomId: string, nurseName: string, platform?: MeetingPlatform) => void;
}

const AdminAppointments: React.FC<AdminAppointmentsProps> = ({ appointments, onJoinRoom }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-black text-slate-800">Master Schedule</h2>
        <p className="text-slate-500">Monitor and manage all patient-nurse sessions.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {appointments.map(appt => (
            <div key={appt.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="text-center w-16">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-2xl font-black text-slate-800 leading-none">{appt.date.split('-')[2]}</p>
                </div>
                <div className="h-10 w-px bg-slate-100"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800">Patient: {appt.patientName}</p>
                    {appt.consultationType === 'Virtual' && (
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${appt.platform === 'Google Meet' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'}`}>
                        {appt.platform || 'Virtual'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">with {appt.nurseName} • {appt.time}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {appt.consultationType === 'Virtual' && (
                   <button 
                    onClick={() => onJoinRoom(appt.videoRoomId || 'default-room', appt.nurseName, appt.platform)}
                    className="px-4 py-2 bg-violet-600 text-white text-[10px] font-black rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-100"
                   >
                     LAUNCH SESSION
                   </button>
                )}
                <button className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl hover:bg-emerald-100">COMPLETE</button>
                <button className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl hover:bg-rose-100">CANCEL</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAppointments;
