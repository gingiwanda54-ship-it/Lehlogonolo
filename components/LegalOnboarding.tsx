
import React, { useState } from 'react';
import { LegalStatus, User } from '../types';

interface Props {
  user: User;
  onComplete: (status: Partial<LegalStatus>, userData: Partial<User>) => void;
}

const LegalOnboarding: React.FC<Props> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    saIdNumber: user.saIdNumber || '',
    medicalAidName: '',
    medicalAidNumber: '',
    popiaSignature: '',
    indemnitySignature: '',
    telemedicineConsent: false,
    sharingPrefs: {
      labs: true,
      specialists: true,
      insurance: false,
      research: false,
      crossBorder: false
    }
  });

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    const legalUpdate: Partial<LegalStatus> = {
      popiaConsent: true,
      popiaDate: new Date().toISOString().split('T')[0],
      popiaSignature: formData.popiaSignature,
      indemnitySigned: true,
      indemnityDate: new Date().toISOString().split('T')[0],
      indemnitySignature: formData.indemnitySignature,
      identityVerified: true,
      telemedicineConsent: formData.telemedicineConsent,
      dataSharingConsent: true,
      sharingPreferences: formData.sharingPrefs
    };

    const userUpdate: Partial<User> = {
      saIdNumber: formData.saIdNumber,
      medicalAidName: formData.medicalAidName,
      medicalAidNumber: formData.medicalAidNumber
    };

    onComplete(legalUpdate, userUpdate);
  };

  const renderStep1 = () => (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-xl">🇿🇦</div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Identity Verification</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">Required under the National Health Act (2003) for clinical record accuracy.</p>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SA Identity Number / Passport</label>
          <input 
            type="text" 
            value={formData.saIdNumber}
            onChange={e => setFormData({...formData, saIdNumber: e.target.value})}
            className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            placeholder="YYMMDDSSSSCAZ"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Aid Provider</label>
            <input 
              type="text" 
              value={formData.medicalAidName}
              onChange={e => setFormData({...formData, medicalAidName: e.target.value})}
              className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              placeholder="e.g. Discovery"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Membership Number</label>
            <input 
              type="text" 
              value={formData.medicalAidNumber}
              onChange={e => setFormData({...formData, medicalAidNumber: e.target.value})}
              className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              placeholder="12345678"
            />
          </div>
        </div>
      </div>

      <button 
        disabled={!formData.saIdNumber || !formData.medicalAidName}
        onClick={handleNext}
        className="w-full py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-30"
      >
        CONTINUE TO CONSENT
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-xl">🛡️</div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">POPIA Consent</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">Specific & Informed Consent under Section 11 of Act No. 4 of 2013.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          I, the undersigned, hereby provide voluntary, informed and specific consent for Kidney Hub to process my personal and special personal information for the purpose of managing my renal health.
        </p>

        <div className="space-y-3">
          {[
            { key: 'labs', label: 'Local Lab Partner Syncing', desc: 'Auto-import from SA Pathology providers.' },
            { key: 'specialists', label: 'Clinician Circle Sharing', desc: 'Access for HPCSA-registered specialists.' },
            { key: 'telemedicine', label: 'Telemedicine Facilitation', desc: 'Secure hosting of virtual clinical sessions.' }
          ].map(pref => (
            <label key={pref.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-emerald-300 transition-all">
              <div className="flex-1 pr-4">
                <p className="text-xs font-black text-slate-800">{pref.label}</p>
                <p className="text-[10px] text-slate-400 font-medium">{pref.desc}</p>
              </div>
              <input 
                type="checkbox" 
                checked={pref.key === 'telemedicine' ? formData.telemedicineConsent : (formData.sharingPrefs as any)[pref.key]}
                onChange={() => {
                  if (pref.key === 'telemedicine') setFormData({...formData, telemedicineConsent: !formData.telemedicineConsent});
                  else setFormData({...formData, sharingPrefs: {...formData.sharingPrefs, [pref.key]: !(formData.sharingPrefs as any)[pref.key]}});
                }}
                className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Signature (Type Full Name)</label>
        <input 
          type="text" 
          value={formData.popiaSignature}
          onChange={e => setFormData({...formData, popiaSignature: e.target.value})}
          className="w-full px-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-base font-serif italic font-semibold outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          placeholder="e-Signature"
        />
      </div>

      <div className="flex gap-4">
        <button onClick={handleBack} className="flex-1 py-4.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">BACK</button>
        <button 
          disabled={formData.popiaSignature.length < 3}
          onClick={handleNext} 
          className="flex-[2] py-4.5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-30"
        >
          I CONSENT
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white text-3xl mx-auto shadow-xl">⚖️</div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Clinical Indemnity</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">Clinical Liability & Services Release compliant with SA Common Law.</p>
      </div>

      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 h-64 overflow-y-auto scrollbar-hide text-[11px] leading-relaxed text-slate-500 font-serif">
        <p className="font-bold text-slate-800 mb-2 uppercase underline">Release of Liability</p>
        <p className="mb-4">1. The user acknowledges that clinical renal services provided via Kidney Hub are ancillary to professional medical consultation.</p>
        <p className="mb-4">2. The user indemnifies the provider against any data inaccuracies sourced from third-party laboratories (e.g., Ampath, Lancet).</p>
        <p className="mb-4">3. The user acknowledges the inherent risks of dialysis and chronic renal care and assumes responsibility for emergency hospital presentation if acute symptoms occur.</p>
        <p className="mb-4">4. This agreement is governed by the laws of the Republic of South Africa.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Execution (Type Full Name)</label>
        <input 
          type="text" 
          value={formData.indemnitySignature}
          onChange={e => setFormData({...formData, indemnitySignature: e.target.value})}
          className="w-full px-6 py-4.5 bg-white border border-slate-200 rounded-2xl text-base font-serif italic font-semibold outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
          placeholder="Full Legal Name"
        />
      </div>

      <div className="flex gap-4">
        <button onClick={handleBack} className="flex-1 py-4.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm">BACK</button>
        <button 
          disabled={formData.indemnitySignature.length < 3}
          onClick={handleSubmit} 
          className="flex-[2] py-4.5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:bg-black transition-all disabled:opacity-30"
        >
          EXECUTE AGREEMENT
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="h-2 bg-slate-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-700 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <div className="p-10 sm:p-14">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
        <div className="px-10 pb-10 text-center">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Clinical Compliance: Johannesburg (Africa-South)</p>
        </div>
      </div>
    </div>
  );
};

export default LegalOnboarding;
