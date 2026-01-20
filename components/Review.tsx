
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

const Review: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [suggestion, setSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const generateSuggestion = async (stars: number) => {
    setLoadingSuggestion(true);
    try {
      // Use apiKey strictly from process.env.API_KEY per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a short, professional Google review for Kidney Hub health app. The user rated it ${stars} stars. Focus on the ease of booking nurses and tracking lab results. Keep it under 40 words.`
      });
      setSuggestion(response.text || '');
    } catch (e) {
      setSuggestion("Great app for managing my kidney health. The nurse booking and progress charts are very helpful!");
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleRating = (r: number) => {
    setRating(r);
    generateSuggestion(r);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in">
        <div className="w-24 h-24 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">💜</div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Thank you!</h2>
        <p className="text-slate-500 mb-8 max-w-md text-center">Your support means everything to our medical team.</p>
        <button 
          onClick={() => window.open('https://g.page/r/sample-link/review', '_blank')}
          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg flex items-center gap-3"
        >
          <span>⭐</span> Post to Google Reviews
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="text-center">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Patient Feedback</h2>
        <p className="text-slate-500">Help us grow by sharing your experience.</p>
      </header>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
        <div className="text-center">
          <p className="text-slate-600 font-bold mb-4 uppercase text-xs tracking-widest">Rate your experience</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRating(star)}
                className={`text-5xl transition-all hover:scale-125 ${rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {rating > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
            <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100 relative">
              <label className="text-xs font-black text-violet-600 uppercase mb-2 block">AI Review Suggestion</label>
              {loadingSuggestion ? (
                <div className="flex items-center gap-2 text-violet-400 py-4">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-150"></div>
                </div>
              ) : (
                <p className="text-slate-700 italic text-sm leading-relaxed">"{suggestion}"</p>
              )}
              <button 
                onClick={() => {navigator.clipboard.writeText(suggestion)}} 
                className="absolute top-6 right-6 text-xs font-bold text-violet-500 hover:underline"
              >
                Copy
              </button>
            </div>

            <textarea 
              className="w-full p-6 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-violet-500 outline-none text-sm min-h-[150px]"
              placeholder="Or write your own thoughts here..."
              defaultValue={suggestion}
            />

            <button 
              onClick={() => setSubmitted(true)}
              className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 transition-all"
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem]">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <span>⚖️</span> HPCSA Ethical Disclaimer
        </h4>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
          In accordance with the Health Professions Council of South Africa (HPCSA) Ethical Rules, patient testimonials are for informational purposes only. Reviews reflect individual patient experiences and do not constitute clinical endorsements or guarantees of health outcomes by Kidney Hub practitioners. Practitioners are prohibited from soliciting reviews for the purpose of self-promotion.
        </p>
      </div>
    </div>
  );
};

export default Review;
