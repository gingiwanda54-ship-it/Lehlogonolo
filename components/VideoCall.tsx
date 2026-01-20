
import React, { useState, useEffect } from 'react';
import { MeetingPlatform } from '../types';

interface VideoCallProps {
  roomId: string;
  nurseName: string;
  platform?: MeetingPlatform;
  onExit: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({ roomId, nurseName, platform = 'Google Meet', onExit }) => {
  const [inCall, setInCall] = useState(false);
  const [signalStrength, setSignalStrength] = useState(4); // 1-4 bars
  const [checklist, setChecklist] = useState({
    mic: false,
    camera: false,
    environment: false
  });

  useEffect(() => {
    let interval: number;
    interval = window.setInterval(() => {
      const rand = Math.random();
      if (rand > 0.9) setSignalStrength(2);
      else if (rand > 0.7) setSignalStrength(3);
      else setSignalStrength(4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderSignalBars = () => {
    const bars = [1, 2, 3, 4];
    const colorClass = signalStrength >= 3 ? 'bg-emerald-500' : signalStrength === 2 ? 'bg-amber-500' : 'bg-rose-500';
    
    return (
      <div className="flex items-end gap-0.5 h-4">
        {bars.map((bar) => (
          <div 
            key={bar}
            className={`w-1 rounded-t-sm transition-all duration-500 ${bar <= signalStrength ? colorClass : 'bg-slate-600'}`}
            style={{ height: `${bar * 25}%` }}
          />
        ))}
      </div>
    );
  };

  const getSignalLabel = () => {
    if (signalStrength === 4) return 'Excellent';
    if (signalStrength === 3) return 'Good';
    if (signalStrength === 2) return 'Fair';
    return 'Poor';
  };

  const getPlatformIcon = () => {
    return platform === 'Google Meet' ? '💙' : '💜';
  };

  const getPlatformColor = () => {
    return platform === 'Google Meet' ? 'from-blue-600 to-indigo-700' : 'from-violet-600 to-fuchsia-700';
  };

  const handleLaunch = () => {
    const link = platform === 'Google Meet' 
      ? `https://meet.google.com/${roomId}` 
      : `https://teams.microsoft.com/l/meetup-join/${roomId}`;
    window.open(link, '_blank');
    setInCall(true);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 py-8 px-4">
      {!inCall ? (
        <div className="space-y-8">
          <header className="text-center">
            <h2 className="text-3xl font-black text-slate-800">Virtual Waiting Room</h2>
            <p className="text-slate-500">Your secure session with {nurseName} is ready.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getPlatformColor()} text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                    {getPlatformIcon()}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</p>
                    <p className="font-black text-slate-800">{platform}</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">Checklist for Success</h3>
                <div className="space-y-4">
                  {[
                    { id: 'mic', label: 'Microphone Check', icon: '🎙️' },
                    { id: 'camera', label: 'Camera Alignment', icon: '📷' },
                    { id: 'environment', label: 'Quiet Environment', icon: '🤫' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof checklist] }))}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        checklist[item.id as keyof typeof checklist] ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-violet-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-bold text-sm">{item.label}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${checklist[item.id as keyof typeof checklist] ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-200'}`}>
                         {checklist[item.id as keyof typeof checklist] ? '✓' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-4 text-center">Connection Quality</p>
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {renderSignalBars()}
                    <span className="text-sm font-bold text-slate-600">{getSignalLabel()} Connection</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Secure</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className={`bg-gradient-to-br ${getPlatformColor()} p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group`}>
                <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 group-hover:rotate-12 transition-transform">{getPlatformIcon()}</div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-black mb-4">Launch Meeting</h4>
                  <p className="text-white/80 text-sm leading-relaxed mb-8">
                    Click below to open your secure consultation in {platform}. Ensure you have the {platform} app installed for the best experience.
                  </p>
                  <button
                    disabled={!checklist.mic || !checklist.camera || !checklist.environment}
                    onClick={handleLaunch}
                    className="w-full bg-white text-slate-900 py-5 rounded-3xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                  >
                    <span>JOIN NOW</span>
                    <span className="text-xl">🚀</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h4 className="font-bold text-slate-800 mb-4">Patient Information</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs text-slate-400 font-bold uppercase">Clinician</span>
                    <span className="text-sm font-bold text-slate-700">{nurseName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50">
                    <span className="text-xs text-slate-400 font-bold uppercase">Duration</span>
                    <span className="text-sm font-bold text-slate-700">30 Minutes</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-400 font-bold uppercase">Status</span>
                    <span className="text-xs font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">Ready</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onExit}
                className="w-full py-4 text-slate-400 font-bold hover:text-rose-500 transition-colors uppercase text-xs tracking-widest"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in space-y-8">
          <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner animate-bounce">
            {getPlatformIcon()}
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-800 italic">Call in Progress</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Your meeting is active in an external window. When you finish your consultation, please return here to complete your session summary.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleLaunch}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Re-open Meeting
            </button>
            <button 
              onClick={onExit}
              className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 shadow-xl shadow-violet-100 transition-all"
            >
              Finish Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;
