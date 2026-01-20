import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { SA_MEDICAL_AIDS } from '../constants';

interface ChatMessage {
  text: string;
  sender: 'user' | 'hub';
  timestamp: string;
}

interface GroundingResult {
  title: string;
  uri: string;
  type: 'MAPS' | 'WEB';
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Robustly decodes raw PCM audio data into an AudioBuffer.
 * Uses DataView to handle byte alignment and supports varying sample rates/channels.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer | null> {
  try {
    if (!data || data.length === 0 || numChannels <= 0) return null;

    const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const bytesPerSample = 2; // 16-bit PCM
    const frameCount = Math.floor(data.byteLength / (numChannels * bytesPerSample));
    
    if (frameCount <= 0) return null;

    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        // Calculate offset for this specific channel and sample index
        const offset = (i * numChannels + channel) * bytesPerSample;
        // Verify we don't read out of bounds
        if (offset + bytesPerSample <= data.byteLength) {
          const sample = dataView.getInt16(offset, true); // true for little-endian
          channelData[i] = sample / 32768.0;
        }
      }
    }
    return buffer;
  } catch (err) {
    console.error("Critical error during audio decoding:", err);
    return null;
  }
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const Telehealth: React.FC = () => {
  const [activeView, setActiveView] = useState<'CONSULT' | 'INTELLIGENCE'>('CONSULT');
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [showIntake, setShowIntake] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showThreeDS, setShowThreeDS] = useState(false);
  const [isTunneling, setIsTunneling] = useState(false);
  const [tunnelStep, setTunnelStep] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [intakeData, setIntakeData] = useState({
    firstName: '',
    surname: '',
    saId: '',
    billingMethod: 'medical_aid' as 'medical_aid' | 'cash',
    medicalAid: SA_MEDICAL_AIDS[0],
    medicalAidNumber: ''
  });

  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    otp: ''
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [groundingQuery, setGroundingQuery] = useState('');
  const [groundingResults, setGroundingResults] = useState<GroundingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isActive) scrollToBottom();
  }, [chatHistory, isActive]);

  const cleanupAudio = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const performGroundingSearch = async (type: 'MAPS' | 'WEB') => {
    setIsSearching(true);
    setGroundingResults([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      if (type === 'MAPS') {
        const pos: any = await new Promise((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true })
        );
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Find renal health facilities, dialysis centers, and kidney specialists near my current coordinates: ${lat}, ${lng}. Specifically search for: ${groundingQuery || 'nearby dialysis'}`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: {
              retrievalConfig: {
                latLng: { latitude: lat, longitude: lng }
              }
            }
          }
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const results = chunks
          .filter((c: any) => c.maps)
          .map((c: any) => ({
            title: c.maps.title,
            uri: c.maps.uri,
            type: 'MAPS' as const
          }));
        setGroundingResults(results);
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Provide current medical news and clinical research regarding renal care, kidney transplant updates, and South African healthcare advancements for 2025: ${groundingQuery || 'latest renal research'}`,
          config: { tools: [{ googleSearch: {} }] },
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const results = chunks
          .filter((c: any) => c.web)
          .map((c: any) => ({
            title: c.web.title,
            uri: c.web.uri,
            type: 'WEB' as const
          }));
        setGroundingResults(results);
      }
    } catch (err) {
      console.error("Clinical Intelligence search error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const runSecurityHandshake = async () => {
    setIsTunneling(true);
    const steps = [
      "Initializing E2EE AES-256-GCM Protocol",
      "Authenticating Secure Renal Node",
      "Verifying NHI Interoperability Status",
      "Locking P2P Telehealth Tunnel",
      "Identity Verified by RSA Node"
    ];

    for (let i = 0; i < steps.length; i++) {
      setTunnelStep(i);
      await new Promise(r => setTimeout(r, 600));
    }

    setIsTunneling(false);
    startSession();
  };

  const startSession = async () => {
    setIsConnecting(true);
    setErrorMsg(null);
    setShowConsent(false);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (audioContextRef.current) await audioContextRef.current.close();
      if (outputAudioContextRef.current) await outputAudioContextRef.current.close();
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            if (audioContextRef.current) {
              const source = audioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBlob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                
                sessionPromise.then((session) => {
                  if (session) session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) cleanupAudio();

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              if (ctx.state === 'suspended') await ctx.resume();
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                if (audioBuffer) {
                  const source = ctx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(ctx.destination);
                  source.addEventListener('ended', () => sourcesRef.current.delete(source));
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  sourcesRef.current.add(source);
                }
              } catch (err) {
                console.error("Audio buffer scheduling failed", err);
              }
            }

            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (message.serverContent?.outputTranscription) {
              setChatHistory(prev => [...prev, { text: message.serverContent!.outputTranscription!.text, sender: 'hub', timestamp }]);
            }
            if (message.serverContent?.inputTranscription) {
              setChatHistory(prev => [...prev, { text: message.serverContent!.inputTranscription!.text, sender: 'user', timestamp }]);
            }
          },
          onerror: () => {
            setIsActive(false);
            setIsConnecting(false);
            setErrorMsg("Clinical portal handshake failed.");
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are a professional renal clinical assistant for Kidney Hub. Ensure POPIA compliance. Be empathetic and accurate. You are communicating via a secure clinical tunnel in South Africa.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsConnecting(false);
      setErrorMsg("Security hardware initialization failed.");
    }
  };

  const handleIntakeSubmit = () => {
    setShowIntake(false);
    if (intakeData.billingMethod === 'cash') setShowPayment(true);
    else setShowConsent(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setShowThreeDS(true);
    }, 1500);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setShowThreeDS(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPayment(false);
        setShowConsent(true);
      }, 1000);
    }, 1800);
  };

  const stopSession = () => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
    cleanupAudio();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Hub Telehealth</h2>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.3em]">Encrypted Clinical Tunnel 🇿🇦</p>
        </div>
        {isActive && (
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
             <button onClick={() => setActiveView('CONSULT')} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all ${activeView === 'CONSULT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>CONSULTATION</button>
             <button onClick={() => setActiveView('INTELLIGENCE')} className={`px-5 py-2 text-[10px] font-black rounded-lg transition-all ${activeView === 'INTELLIGENCE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>INTELLIGENCE</button>
          </div>
        )}
      </header>

      {isTunneling && (
        <div className="fixed inset-0 bg-slate-900/98 backdrop-blur-2xl z-[300] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-32 h-32 bg-indigo-600/20 rounded-[2.5rem] flex items-center justify-center mb-12 relative animate-pulse">
            <div className="absolute inset-0 border-4 border-indigo-500/50 rounded-[2.5rem] animate-ping"></div>
            <span className="text-5xl">🛡️</span>
          </div>
          <div className="space-y-6 max-w-sm">
            <h3 className="text-2xl font-black text-white italic">Hardening Clinical Tunnel</h3>
            <p className="text-indigo-300 font-mono text-[10px] uppercase tracking-widest bg-indigo-950/50 py-2 px-4 rounded-full border border-indigo-500/30">
              Protocol: AES-256-GCM | Step: {tunnelStep + 1}/5
            </p>
          </div>
        </div>
      )}

      {showIntake && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 animate-in zoom-in max-w-2xl mx-auto">
           <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-slate-100 shadow-inner">📋</div>
              <h3 className="text-2xl font-black text-slate-800 italic">Secure Clinical Intake</h3>
              <p className="text-slate-500 text-sm">Required for HPCSA regulated telemedicine.</p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input required type="text" value={intakeData.firstName} onChange={e => setIntakeData({...intakeData, firstName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-indigo-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Surname</label>
                <input required type="text" value={intakeData.surname} onChange={e => setIntakeData({...intakeData, surname: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-indigo-500 transition-all" />
              </div>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Protocol</label>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIntakeData({...intakeData, billingMethod: 'medical_aid'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${intakeData.billingMethod === 'medical_aid' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                  <span className="text-2xl">🏥</span>
                  <span className="text-xs font-black uppercase">Medical Aid</span>
                </button>
                <button onClick={() => setIntakeData({...intakeData, billingMethod: 'cash'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${intakeData.billingMethod === 'cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                  <span className="text-2xl">💳</span>
                  <span className="text-xs font-black uppercase">Cash / Private</span>
                </button>
              </div>
           </div>
           <button onClick={handleIntakeSubmit} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-xl hover:bg-black transition-all active:scale-95">PROCEED TO HANDSHAKE</button>
        </div>
      )}

      {showPayment && (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl space-y-8 animate-in zoom-in border border-slate-100 overflow-hidden relative max-w-xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
          {showThreeDS ? (
            <form onSubmit={handleOtpVerify} className="space-y-8 py-10 text-center animate-in slide-in-from-right-10">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner">🔒</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic">Verified by HubSecure</h3>
                <p className="text-slate-500 text-sm">A 3D Secure verification OTP has been sent to your bank-registered mobile ending in ••{Math.floor(Math.random()*90)+10}.</p>
              </div>
              <input required type="text" maxLength={6} value={cardData.otp} onChange={e => setCardData({...cardData, otp: e.target.value.replace(/\D/g, '')})} className="w-full text-center text-4xl font-black tracking-[0.5em] py-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-indigo-600 outline-none" placeholder="000000" />
              <button disabled={paymentLoading} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                {paymentLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'AUTHENTICATE & PAY'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black italic">Encrypted Payment</h3>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    PCI-DSS Level 1 Secure Node
                  </p>
                </div>
                <span className="text-3xl">💳</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cardholder Name</label>
                <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-600" placeholder="Full legal name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                <input required type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xl tracking-widest outline-none focus:border-indigo-600" placeholder="4242 •••• •••• ••••" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <input required type="text" className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-600" placeholder="MM/YY" />
                 <input required type="password" maxLength={3} className="px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-600" placeholder="CVC" />
              </div>
              <div className="p-5 bg-slate-900 rounded-2xl text-white flex justify-between items-center shadow-xl">
                 <span className="text-xs font-black uppercase text-slate-400">Clinical Fee</span>
                 <span className="text-2xl font-black italic tracking-tight">R 450.00</span>
              </div>
              <button disabled={paymentLoading} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                {paymentLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'INITIATE SECURE PAYMENT'}
              </button>
            </form>
          )}
        </div>
      )}

      {showConsent && !isActive && !isTunneling && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 animate-in zoom-in max-w-2xl mx-auto">
           <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[1.8rem] flex items-center justify-center text-4xl mx-auto shadow-inner">🛡️</div>
              <h3 className="text-2xl font-black text-slate-800 italic">Telemedicine Consent</h3>
              <p className="text-slate-500 text-sm leading-relaxed">I provide informed clinical consent for this virtual session. I understand this session is hosted on an encrypted peer-to-peer tunnel and is recorded for clinical records.</p>
           </div>
           <button onClick={runSecurityHandshake} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm shadow-xl hover:bg-indigo-700 transition-all active:scale-95">ESTABLISH SECURE LINK</button>
        </div>
      )}

      {isActive && (
        <div className="animate-in fade-in duration-700">
           {activeView === 'CONSULT' ? (
             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               <div className="lg:col-span-3 bg-slate-900 rounded-[3rem] p-6 shadow-2xl min-h-[600px] border-4 border-slate-800 flex flex-col relative overflow-hidden group">
                  <div className="flex-1 overflow-y-auto space-y-4 px-4 py-12 scrollbar-hide">
                     {chatHistory.length === 0 && (
                       <div className="h-full flex flex-col items-center justify-center text-center space-y-6 text-slate-500">
                          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-5xl animate-pulse">🎙️</div>
                          <p className="text-xs uppercase font-black tracking-[0.3em] text-slate-600">Clinical Tunnel Active • Start Speaking</p>
                       </div>
                     )}
                     {chatHistory.map((msg, i) => (
                       <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-6 rounded-[2rem] ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none backdrop-blur-xl border border-white/5'}`}>
                             <p className="text-[13px] font-medium leading-relaxed">{msg.text}</p>
                          </div>
                       </div>
                     ))}
                     <div ref={chatEndRef} />
                  </div>
                  <div className="p-4 bg-black/40 rounded-[2.5rem] border border-white/10 flex items-center justify-between gap-4 backdrop-blur-3xl">
                     <div className="flex items-center gap-4 px-6 text-white/80">
                        <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-lg animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.5)]">🎙️</div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Clinician Listening...</span>
                     </div>
                     <button onClick={stopSession} className="bg-white/10 hover:bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all border border-white/10">END SESSION</button>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Metrics</h4>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-500">Tunnel Status</span>
                           <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase">Locked</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-500">Data Flow</span>
                           <span className="text-[9px] font-black text-slate-800">128kbps</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-xs font-bold text-slate-500">RSA Compliance</span>
                           <span className="text-[9px] font-black text-indigo-600">Active</span>
                        </div>
                     </div>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl space-y-4 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
                     <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-widest relative z-10">AI Clinical Memo</h4>
                     <p className="text-[11px] text-white/90 leading-relaxed font-bold italic relative z-10">Real-time session transcription is active. All clinical data is indexed for your medical archive.</p>
                  </div>
               </div>
             </div>
           ) : (
             <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">📍</div>
                         <div>
                            <h3 className="text-2xl font-black text-slate-800 italic">Facility Navigator</h3>
                            <p className="text-slate-500 text-sm">Find nearby specialized renal facilities.</p>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <input type="text" value={groundingQuery} onChange={e => setGroundingQuery(e.target.value)} placeholder="Dialysis, specialists, labs..." className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 transition-all" />
                         <button onClick={() => performGroundingSearch('MAPS')} disabled={isSearching} className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95">
                           {isSearching ? '...' : 'FIND'}
                         </button>
                      </div>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                         {groundingResults.filter(r => r.type === 'MAPS').map((res, i) => (
                           <a key={i} href={res.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.8rem] border border-transparent hover:border-emerald-200 hover:bg-white transition-all group shadow-sm">
                              <div className="truncate mr-4">
                                <span className="text-xs font-black text-slate-800 block truncate">{res.title}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Google Maps Grounded</span>
                              </div>
                              <span className="text-[10px] font-black text-emerald-600 uppercase group-hover:underline shrink-0 flex items-center gap-1">NAVIGATE →</span>
                           </a>
                         ))}
                         {groundingResults.length === 0 && !isSearching && <div className="text-center py-16 opacity-30">
                            <span className="text-5xl block mb-4">🔎</span>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Search to index nearby facilities.</p>
                         </div>}
                         {isSearching && <div className="text-center py-16 animate-pulse">
                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Querying Global Nodes...</p>
                         </div>}
                      </div>
                   </div>

                   <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">🧬</div>
                         <div>
                            <h3 className="text-2xl font-black text-slate-800 italic">Research Intelligence</h3>
                            <p className="text-slate-500 text-sm">Latest clinical news globally.</p>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         <input type="text" value={groundingQuery} onChange={e => setGroundingQuery(e.target.value)} placeholder="Renal news, transplant updates..." className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all" />
                         <button onClick={() => performGroundingSearch('WEB')} disabled={isSearching} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
                           {isSearching ? '...' : 'RESEARCH'}
                         </button>
                      </div>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                         {groundingResults.filter(r => r.type === 'WEB').map((res, i) => (
                           <a key={i} href={res.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.8rem] border border-transparent hover:border-indigo-200 hover:bg-white transition-all group shadow-sm">
                              <div className="truncate mr-4">
                                <span className="text-xs font-black text-slate-800 block truncate">{res.title}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">Google Search Verified</span>
                              </div>
                              <span className="text-[10px] font-black text-indigo-600 uppercase group-hover:underline shrink-0">READ FULL →</span>
                           </a>
                         ))}
                         {groundingResults.length === 0 && !isSearching && <div className="text-center py-16 opacity-30">
                            <span className="text-5xl block mb-4">📚</span>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Index latest clinical research news.</p>
                         </div>}
                      </div>
                   </div>
                </div>
                <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl flex items-center justify-between overflow-hidden relative group">
                   <div className="absolute -right-8 -bottom-8 text-9xl opacity-5 group-hover:rotate-12 transition-transform">🤖</div>
                   <div className="relative z-10">
                      <h4 className="text-xl font-black italic">Clinical Insight AI</h4>
                      <p className="text-slate-400 text-sm max-w-xl">Intelligence module is grounding responses in real-time verified clinical journals and geographic node data.</p>
                   </div>
                   <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl relative z-10">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-black uppercase">Nodes Verified</span>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {isConnecting && !isActive && (
        <div className="flex flex-col items-center justify-center py-32 space-y-8">
           <div className="w-20 h-20 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
           <div className="text-center">
             <p className="text-slate-800 font-black uppercase text-sm tracking-widest">Verifying Peer Handshake...</p>
             <p className="text-slate-400 text-[10px] font-bold mt-2">RSA SECURE AUTHENTICATION IN PROGRESS</p>
           </div>
        </div>
      )}
      
      {errorMsg && (
        <div className="max-w-md mx-auto p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] text-center space-y-4 animate-in zoom-in">
           <span className="text-4xl">⚠️</span>
           <h3 className="text-xl font-black text-rose-900 italic">Handshake Error</h3>
           <p className="text-rose-700 text-sm">{errorMsg}</p>
           <button onClick={() => { setErrorMsg(null); setShowIntake(true); }} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase hover:bg-rose-700 transition-all shadow-lg shadow-rose-200">RETRY SECURITY HANDSHAKE</button>
        </div>
      )}
    </div>
  );
};

export default Telehealth;