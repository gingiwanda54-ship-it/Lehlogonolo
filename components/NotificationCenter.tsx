
import React, { useState } from 'react';
import { AppNotification, AppRoute, NotificationPreferences, NotificationType } from '../types';

interface Props {
  notifications: AppNotification[];
  preferences: NotificationPreferences;
  onUpdatePreferences: (prefs: NotificationPreferences) => void;
  onMarkRead: (id: string) => void;
  onNavigate: (route: AppRoute) => void;
}

const NotificationCenter: React.FC<Props> = ({ notifications, preferences, onUpdatePreferences, onMarkRead, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);

  const toggleCategory = (cat: NotificationType) => {
    onUpdatePreferences({
      ...preferences,
      categories: {
        ...preferences.categories,
        [cat]: !preferences.categories[cat]
      }
    });
  };

  const toggleChannel = (channel: keyof NotificationPreferences['channels']) => {
    onUpdatePreferences({
      ...preferences,
      channels: {
        ...preferences.channels,
        [channel]: !preferences.channels[channel]
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT': return '📅';
      case 'RECORD': return '📄';
      case 'HEALTH_ALERT': return '⚠️';
      case 'SECURITY': return '🛡️';
      default: return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'APPOINTMENT': return 'bg-violet-100 text-violet-600';
      case 'RECORD': return 'bg-emerald-100 text-emerald-600';
      case 'HEALTH_ALERT': return 'bg-rose-100 text-rose-600';
      case 'SECURITY': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Filter notifications based on preferences
  const filteredNotifications = notifications.filter(n => preferences.categories[n.type]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Alert Center</h2>
          <p className="text-slate-500">Stay updated with your care plan and health milestones.</p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${showSettings ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}
        >
          <span>{showSettings ? '✕ Close Settings' : '⚙️ Alert Settings'}</span>
        </button>
      </header>

      {showSettings ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden p-10 animate-in slide-in-from-top-4">
          <h3 className="text-xl font-black text-slate-800 mb-8">Notification Preferences</h3>
          
          <div className="space-y-10">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Channels</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['IN_APP', 'EMAIL', 'SMS'] as const).map(channel => (
                  <button
                    key={channel}
                    onClick={() => toggleChannel(channel)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      preferences.channels[channel] ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-sm capitalize">{channel.replace('_', ' ')}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${preferences.channels[channel] ? 'bg-violet-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${preferences.channels[channel] ? 'left-6' : 'left-1'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Alert Categories</p>
              <div className="space-y-3">
                {(['APPOINTMENT', 'RECORD', 'HEALTH_ALERT', 'SYSTEM', 'SECURITY'] as const).map(category => (
                  <div 
                    key={category}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${getTypeColor(category)}`}>
                        {getTypeIcon(category)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm capitalize">{category.toLowerCase().replace('_', ' ')}s</p>
                        <p className="text-xs text-slate-400">Updates regarding your {category.toLowerCase().replace('_', ' ')} activity.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleCategory(category)}
                      className={`w-12 h-6 rounded-full relative transition-colors ${preferences.categories[category] ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.categories[category] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-50 flex justify-end">
             <button 
              onClick={() => setShowSettings(false)}
              className="bg-violet-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-violet-700 shadow-lg shadow-violet-200"
             >
               Save & Apply Preferences
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-20 text-center space-y-4">
              <div className="text-6xl grayscale opacity-20">📭</div>
              <p className="text-slate-400 font-bold">No notifications match your preferences</p>
              <button 
                onClick={() => setShowSettings(true)}
                className="text-xs font-black text-violet-600 uppercase hover:underline"
              >
                Edit Preferences
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(n => (
                <div 
                  key={n.id} 
                  className={`p-6 flex gap-6 hover:bg-slate-50 transition-colors relative group ${!n.read ? 'bg-violet-50/30' : ''}`}
                  onClick={() => onMarkRead(n.id)}
                >
                  {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600" />}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${getTypeColor(n.type)}`}>
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold text-slate-800 ${!n.read ? 'text-violet-900' : ''}`}>{n.title}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(n.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                    {n.actionUrl && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onNavigate(n.actionUrl as AppRoute); }}
                        className="mt-3 text-xs font-black text-violet-600 uppercase tracking-widest hover:underline"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center">
                    <button className="p-2 text-slate-300 hover:text-slate-500">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!showSettings && (
        <div className="bg-violet-600 p-8 rounded-[2.5rem] text-white shadow-lg shadow-violet-200 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-1">Health Trends AI</h4>
            <p className="text-violet-100 text-sm max-w-sm">Our system automatically monitors your shared records for significant health improvements or risks.</p>
          </div>
          <div className="text-6xl opacity-20 absolute -right-4 -bottom-4 z-0 rotate-12 select-none">📊</div>
          <button className="relative z-10 bg-white text-violet-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-violet-50 transition-colors whitespace-nowrap">
            SYSTEM STATUS: OPTIMAL
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
