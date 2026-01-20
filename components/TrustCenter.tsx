
import React, { useState } from 'react';
import { LegalStatus, PaymentMethod } from '../types';

interface TrustCenterProps {
  legalStatus: LegalStatus;
}

const TrustCenter: React.FC<TrustCenterProps> = ({ legalStatus }) => {
  const [requestSent, setRequestSent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'COMPLIANCE' | 'SECURITY' | 'PAYMENTS'>('COMPLIANCE');

  const handleAction = (type: string) => {
    setRequestSent(type);
    setTimeout(() => setRequestSent(null), 3000);
  };

  const complianceItems = [
    {
      law: 'POPIA',
      fullName: 'Protection of Personal Information Act (2013)',
      status: legalStatus.popiaConsent ? 'Compliant' : 'Action Required',
      description: 'Ensuring your health data is processed lawfully and transparently in accordance with South African privacy standards.',
      icon: '🛡️'
    },
    {
      law: 'NHA',
      fullName: 'National Health Act (2003)',
      status: 'Verified',
      description: 'Compliance with patient confidentiality and the right to access personal health records (Section 13 & 15).',
      icon: '⚖️'
    },
    {
      law: 'HPCSA & SANC',
      fullName: 'Health Professions Council of SA',
      status: 'Active',
      description: 'Verification of medical professional registrations (Doctor HPCSA & Nurse SANC numbers) for all practitioners.',
      icon: '🩺'
    },
    {
      law: 'NHI Ready',
      fullName: 'National Health Insurance Digital Standards',
      status: 'Ready',
      description: 'Data interoperability prepared for South Africa’s unified health system future.',
      icon: '🇿🇦'
    }
  ];

  const authorizedDevices = [
    { name: 'iPhone 15 Pro (This Device)', location: 'Johannesburg, ZA', lastActive: 'Now', icon: '📱' },
    { name: 'MacBook Air M2', location: 'Pretoria, ZA', lastActive: '2 days ago', icon: '💻' }
  ];

  const paymentMethods: PaymentMethod[] = [
    { id: '1', type: 'VISA', last4: '4242', expiry: '12/26', isDefault: true },
    { id: '2', type: 'MASTERCARD', last4: '8891', expiry: '05/25', isDefault: false }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <header className="text-center space-y-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-xl">🛡️</div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">ZA Trust Center</h2>
        <p className="text-slate-500 max-w-md mx-auto">Manage your data sovereignty, payments, and account security in one secure place.</p>
      </header>

      <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] max-w-md mx-auto">
        {['COMPLIANCE', 'SECURITY', 'PAYMENTS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {requestSent && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-xs animate-in slide-in-from-top-4 flex items-center gap-3">
          <span>✅</span> {requestSent} has been logged.
        </div>
      )}

      {activeTab === 'COMPLIANCE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {complianceItems.map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl hover:border-indigo-200 transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  {item.icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  item.status === 'Compliant' || item.status === 'Verified' || item.status === 'Active' || item.status === 'Ready'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                }`}>
                  {item.status}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-1">{item.law}</h3>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">{item.fullName}</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'SECURITY' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl">🛡️</div>
               <div>
                  <h3 className="text-2xl font-black text-slate-800">Advanced Shield</h3>
                  <p className="text-slate-500 text-sm">Military-grade protection for your medical history.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'AES-256-GCM Encryption', status: 'Active', desc: 'End-to-end data lockdown.' },
                { label: 'Two-Factor Auth (MFA)', status: 'Enabled', desc: 'Secure SMS/Email codes.' },
                { label: 'Biometric Access', status: 'Active', desc: 'FaceID/TouchID native sync.' },
                { label: 'Login Notifications', status: 'Active', desc: 'Alerts for new devices.' }
              ].map((sec, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-800">{sec.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{sec.desc}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black ${sec.status === 'Active' || sec.status === 'Enabled' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'}`}>
                    {sec.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Authorized Devices</h4>
               <div className="space-y-3">
                 {authorizedDevices.map((device, i) => (
                   <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{device.icon}</div>
                        <div>
                           <p className="text-sm font-black text-slate-800">{device.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold">{device.location} • {device.lastActive}</p>
                        </div>
                      </div>
                      <button className="text-[9px] font-black text-rose-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Revoke Access</button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PAYMENTS' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-800">Payment Methods</h3>
                  <p className="text-slate-500 text-sm">Securely manage your debit and credit cards.</p>
               </div>
               <button onClick={() => handleAction('Card Addition Portal')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                 + ADD NEW CARD
               </button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {paymentMethods.map((card) => (
                 <div key={card.id} className="relative p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white shadow-2xl overflow-hidden group">
                    <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 group-hover:rotate-12 transition-transform">💳</div>
                    <div className="relative z-10 space-y-8">
                       <div className="flex justify-between items-start">
                          <span className="text-xl font-black italic">{card.type}</span>
                          {card.isDefault && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-full uppercase">Default</span>}
                       </div>
                       <div>
                          <p className="text-2xl font-mono tracking-widest">•••• •••• •••• {card.last4}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Expires {card.expiry}</p>
                       </div>
                       <div className="flex gap-3">
                          <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase transition-colors">Edit</button>
                          <button className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase transition-colors">Remove</button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>

             <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🔒</div>
                <p className="text-xs text-slate-500 font-medium">
                  We use PCI-DSS Level 1 compliant encryption to store card details. Your full card number never touches our servers.
                </p>
             </div>
          </div>
        </div>
      )}

      <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-4xl">📁</span>
            <h3 className="text-2xl font-black italic">PAIA Request Portal</h3>
          </div>
          <p className="text-slate-400 text-sm max-w-lg">
            Under the Promotion of Access to Information Act (PAIA), you have the right to request access to your full medical file held by Kidney Hub.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => handleAction('Full PHR Download')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              DOWNLOAD PHR REPORT (XML/PDF)
            </button>
            <button 
              onClick={() => handleAction('Data Deletion Request')}
              className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-2xl font-black text-xs hover:bg-white/20 transition-all"
            >
              SUBMIT DATA DELETION REQUEST
            </button>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <button 
          onClick={() => handleAction('Account Withdrawal')}
          className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hover:underline"
        >
          Withdraw All Consents & Close Account
        </button>
      </div>
    </div>
  );
};

export default TrustCenter;
