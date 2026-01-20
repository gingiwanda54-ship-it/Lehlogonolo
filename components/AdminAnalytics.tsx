
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_NURSE_STATS } from '../constants';

const AdminAnalytics: React.FC = () => {
  const [nurseStats, setNurseStats] = useState([...MOCK_NURSE_STATS]);
  const [isLive, setIsLive] = useState(true);
  const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

  // Simulation: Update stats every 5 seconds to mimic real-time data flow
  useEffect(() => {
    let interval: number;
    if (isLive) {
      interval = window.setInterval(() => {
        setNurseStats(currentStats => 
          currentStats.map(stat => ({
            ...stat,
            // Randomly increment appointments by 0-1 to simulate new completions
            appointments: stat.appointments + (Math.random() > 0.8 ? 1 : 0),
            // Slight jitter in average duration (±0.5 mins)
            avgDuration: Math.max(20, Math.min(60, stat.avgDuration + (Math.random() - 0.5))),
            // Slight jitter in satisfaction (±0.01)
            satisfaction: Math.max(3.5, Math.min(5.0, Number((stat.satisfaction + (Math.random() * 0.04 - 0.02)).toFixed(2)))),
            // Slight jitter in completion rate (±0.1%)
            completionRate: Math.max(80, Math.min(100, Number((stat.completionRate + (Math.random() * 0.4 - 0.2)).toFixed(1))))
          }))
        );
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLive]);

  const avgCompletion = nurseStats.reduce((acc, curr) => acc + curr.completionRate, 0) / nurseStats.length;
  const totalAppointments = nurseStats.reduce((acc, curr) => acc + curr.appointments, 0);
  const avgSatisfaction = nurseStats.reduce((acc, curr) => acc + curr.satisfaction, 0) / nurseStats.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black text-slate-800">Performance Analytics</h2>
            {isLive && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-full">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Live Stream</span>
              </div>
            )}
          </div>
          <p className="text-slate-500">Evaluating care team efficiency and patient satisfaction levels.</p>
        </div>
        <button 
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isLive ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
        >
          {isLive ? '⏸ Pause Real-time' : '▶️ Resume Updates'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Appointments', value: totalAppointments, trend: '+12% month', color: 'violet' },
          { label: 'Avg. Satisfaction', value: `${avgSatisfaction.toFixed(2)}/5.0`, trend: '98% Positive', color: 'emerald' },
          { label: 'Completion Rate', value: `${avgCompletion.toFixed(1)}%`, trend: 'Stable', color: 'blue' },
          { label: 'Avg. Duration', value: `${(nurseStats.reduce((a,b) => a + b.avgDuration, 0) / nurseStats.length).toFixed(0)}m`, trend: '-2m vs prev', color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
            <p className={`text-[10px] font-bold mt-2 text-${stat.color}-600`}>{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Appointments per Nurse</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nurseStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="appointments" radius={[8, 8, 0, 0]} animationDuration={1000}>
                  {nurseStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Nurse Satisfaction Scores</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nurseStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 5]} hide />
                <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} width={80} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="satisfaction" fill="#10B981" radius={[0, 8, 8, 0]} barSize={20} animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">Detailed Performance Table</h3>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase">Updating every 5s</span>
            <button className="text-xs font-black text-violet-600 uppercase tracking-widest hover:underline">Export CSV</button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Nurse Name</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Total Sessions</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Avg Duration</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Success Rate</th>
              <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nurseStats.map((stat, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-bold text-slate-800">{stat.name}</td>
                <td className="px-8 py-6 text-sm text-slate-500 font-medium">{stat.appointments}</td>
                <td className="px-8 py-6 text-sm text-slate-500 font-medium">{stat.avgDuration.toFixed(1)} mins</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full w-20 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${stat.completionRate > 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        style={{ width: `${stat.completionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{stat.completionRate.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 font-bold">★</span>
                    <span className="text-sm font-bold text-slate-800">{stat.satisfaction.toFixed(2)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAnalytics;
