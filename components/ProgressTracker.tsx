
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ReferenceLine, ComposedChart } from 'recharts';
import { MOCK_METRICS } from '../constants';

type MetricType = 'gfr' | 'creatinine' | 'potassium' | 'bp';

const ProgressTracker: React.FC = () => {
  const [metric, setMetric] = useState<MetricType>('gfr');
  const [showTrend, setShowTrend] = useState<boolean>(true);
  
  // Current View Range
  const [startIndex, setStartIndex] = useState<number>(Math.max(0, MOCK_METRICS.length - 3));
  const [endIndex, setEndIndex] = useState<number>(MOCK_METRICS.length - 1);

  // Comparison View Range
  const [compStartIndex, setCompStartIndex] = useState<number>(0);
  const [compEndIndex, setCompEndIndex] = useState<number>(Math.min(1, MOCK_METRICS.length - 1));
  const [showComparison, setShowComparison] = useState<boolean>(false);

  const filteredData = useMemo(() => {
    return MOCK_METRICS.slice(startIndex, endIndex + 1);
  }, [startIndex, endIndex]);

  const comparisonDataRange = useMemo(() => {
    return MOCK_METRICS.slice(compStartIndex, compEndIndex + 1);
  }, [compStartIndex, compEndIndex]);

  const trendData = useMemo(() => {
    if (filteredData.length < 2 || metric === 'bp') return filteredData;
    
    const x = filteredData.map((_, i) => i);
    const y = filteredData.map(d => d[metric as keyof typeof d] as number);
    
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for(let i=0; i<n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return filteredData.map((d, i) => ({
      ...d,
      trend: Number((slope * i + intercept).toFixed(2))
    }));
  }, [filteredData, metric]);

  const trendStats = useMemo(() => {
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const getAverage = (data: any[], key: string) => 
      data.reduce((acc, curr) => acc + (curr[key] as number), 0) / data.length;

    if (metric === 'bp') {
      const currentSysAvg = getAverage(filteredData, 'bloodPressureSystolic');
      const currentDiaAvg = getAverage(filteredData, 'bloodPressureDiastolic');
      const compSysAvg = getAverage(comparisonDataRange, 'bloodPressureSystolic');
      const compDiaAvg = getAverage(comparisonDataRange, 'bloodPressureDiastolic');

      return { 
        sysChange: calculateChange(currentSysAvg, compSysAvg), 
        diaChange: calculateChange(currentDiaAvg, compDiaAvg),
        currentSys: currentSysAvg.toFixed(0),
        currentDia: currentDiaAvg.toFixed(0),
        compSys: compSysAvg.toFixed(0),
        compDia: compDiaAvg.toFixed(0)
      };
    }

    const currentAvg = getAverage(filteredData, metric);
    const compAvg = getAverage(comparisonDataRange, metric);
    
    return { 
      change: calculateChange(currentAvg, compAvg), 
      current: currentAvg.toFixed(2), 
      previous: compAvg.toFixed(2) 
    };
  }, [metric, filteredData, comparisonDataRange]);

  const getTrendColor = (change: number, metricType: MetricType) => {
    if (metricType === 'gfr') return change >= 0 ? 'text-emerald-500' : 'text-rose-500';
    return change <= 0 ? 'text-emerald-500' : 'text-rose-500';
  };

  const renderChart = () => {
    if (metric === 'bp') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
            <YAxis hide domain={[60, 160]} />
            <Tooltip 
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
              itemStyle={{ fontWeight: 800, fontSize: '12px' }}
            />
            <Line type="monotone" name="Systolic" dataKey="bloodPressureSystolic" stroke="#7C3AED" strokeWidth={4} dot={{ r: 6, fill: '#7C3AED', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
            <Line type="monotone" name="Diastolic" dataKey="bloodPressureDiastolic" stroke="#10B981" strokeWidth={4} dot={{ r: 6, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    const config = {
      gfr: { color: '#7C3AED', name: 'eGFR' },
      creatinine: { color: '#10B981', name: 'Creatinine' },
      potassium: { color: '#F59E0B', name: 'Potassium' }
    }[metric as 'gfr' | 'creatinine' | 'potassium'];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={trendData}>
          <defs>
            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
            itemStyle={{ fontWeight: 800, fontSize: '12px' }}
          />
          <Area type="monotone" dataKey={metric} stroke={config.color} strokeWidth={4} fillOpacity={1} fill="url(#colorMetric)" dot={{ r: 6, fill: config.color, strokeWidth: 0 }} />
          {showTrend && (
            <Line type="monotone" dataKey="trend" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Trend" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">Health Progress</h2>
          <p className="text-slate-500 font-medium">Longitudinal tracking with comparative trend analysis.</p>
        </div>
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto gap-1">
          {[
            { id: 'gfr', label: 'eGFR' },
            { id: 'creatinine', label: 'CREA' },
            { id: 'bp', label: 'BP' },
            { id: 'potassium', label: 'K+' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id as MetricType)}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                metric === m.id ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-[3rem] border border-slate-100 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 italic">Analytical Timeline</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                  Active Range: {MOCK_METRICS[startIndex].date} — {MOCK_METRICS[endIndex].date}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase px-2">View</span>
                  <select 
                    value={startIndex}
                    onChange={(e) => setStartIndex(Number(e.target.value))}
                    className="bg-transparent border-none text-[10px] font-black text-slate-700 outline-none cursor-pointer"
                  >
                    {MOCK_METRICS.map((m, i) => (
                      <option key={m.date} value={i} disabled={i >= endIndex}>{m.date}</option>
                    ))}
                  </select>
                  <span className="text-slate-300">→</span>
                  <select 
                    value={endIndex}
                    onChange={(e) => setEndIndex(Number(e.target.value))}
                    className="bg-transparent border-none text-[10px] font-black text-slate-700 outline-none cursor-pointer"
                  >
                    {MOCK_METRICS.map((m, i) => (
                      <option key={m.date} value={i} disabled={i <= startIndex}>{m.date}</option>
                    ))}
                  </select>
                </div>
                {metric !== 'bp' && (
                  <button 
                    onClick={() => setShowTrend(!showTrend)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      showTrend ? 'bg-violet-600 text-white border-violet-600 shadow-lg shadow-violet-100' : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    Regression {showTrend ? 'ON' : 'OFF'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="h-80 w-full">
              {renderChart()}
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 group-hover:rotate-12 transition-transform select-none">📊</div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-10">
              <div className="space-y-6 flex-1">
                <h4 className="text-xl font-black italic tracking-tight flex items-center gap-2">
                  Period Comparison Summary
                  {showComparison && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase">Range Comparison Active</span>}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {metric !== 'bp' ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Range Avg</p>
                        <p className="text-4xl font-black tracking-tighter">{(trendStats as any).current} <span className="text-xs text-slate-500 font-bold uppercase">{metric === 'potassium' ? 'mEq/L' : metric === 'creatinine' ? 'mg/dL' : 'mL/min'}</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">vs. Comparison Period Avg</p>
                        <div className="flex items-center gap-3">
                          <p className={`text-4xl font-black tracking-tighter ${getTrendColor((trendStats as any).change, metric)}`}>
                            {(trendStats as any).change >= 0 ? '+' : ''}{(trendStats as any).change.toFixed(1)}%
                          </p>
                          <span className={`text-2xl ${getTrendColor((trendStats as any).change, metric)}`}>
                            {(trendStats as any).change >= 0 ? '↑' : '↓'}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Systolic Variance</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-3xl font-black tracking-tighter ${getTrendColor((trendStats as any).sysChange, 'bp')}`}>
                            {(trendStats as any).sysChange >= 0 ? '+' : ''}{(trendStats as any).sysChange.toFixed(1)}%
                          </p>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">avg {(trendStats as any).currentSys} mmHg</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Diastolic Variance</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-3xl font-black tracking-tighter ${getTrendColor((trendStats as any).diaChange, 'bp')}`}>
                            {(trendStats as any).diaChange >= 0 ? '+' : ''}{(trendStats as any).diaChange.toFixed(1)}%
                          </p>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">avg {(trendStats as any).currentDia} mmHg</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="sm:w-64 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Comparison Range</p>
                  <button onClick={() => setShowComparison(!showComparison)} className={`w-8 h-4 rounded-full relative transition-colors ${showComparison ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showComparison ? 'left-4.5' : 'left-0.5'}`} />
                  </button>
                </div>
                
                <div className={`space-y-3 transition-opacity ${showComparison ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <select 
                      value={compStartIndex}
                      onChange={(e) => setCompStartIndex(Number(e.target.value))}
                      className="bg-slate-800 text-white text-[10px] font-black p-2 rounded-xl outline-none w-full"
                    >
                      {MOCK_METRICS.map((m, i) => (
                        <option key={m.date} value={i} disabled={i >= compEndIndex}>{m.date}</option>
                      ))}
                    </select>
                    <span className="text-white/20">→</span>
                    <select 
                      value={compEndIndex}
                      onChange={(e) => setCompEndIndex(Number(e.target.value))}
                      className="bg-slate-800 text-white text-[10px] font-black p-2 rounded-xl outline-none w-full"
                    >
                      {MOCK_METRICS.map((m, i) => (
                        <option key={m.date} value={i} disabled={i <= compStartIndex}>{m.date}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[8px] text-white/40 font-bold uppercase text-center">Reference Period for Delta calc</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 italic">Analytical Insights</h4>
            <div className="space-y-4">
               {[
                 { label: 'Observed Duration', value: `${Math.round((new Date(MOCK_METRICS[endIndex].date).getTime() - new Date(MOCK_METRICS[startIndex].date).getTime()) / (1000 * 3600 * 24))} Days`, icon: '⏳' },
                 { label: 'Sample Count', value: `${filteredData.length} Labs`, icon: '🧪' },
                 { label: 'Longitudinal Trend', value: (trendStats as any).change >= 0 ? 'Optimal' : 'Monitoring', icon: '📈' },
                 { label: 'Stability Index', value: 'High', icon: '⚖️' }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-violet-100 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-xs font-black text-slate-500 uppercase">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-slate-800 tracking-tight">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100 relative overflow-hidden group">
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/40 rounded-full blur-2xl"></div>
            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
              Clinical Correlation
            </h5>
            <p className="text-sm font-bold text-indigo-900 leading-relaxed italic relative z-10">
              "Comparative analysis between your current period and the {showComparison ? 'selected comparison range' : 'earliest recorded data'} shows a { (trendStats as any).change >= 0 ? 'positive' : 'stable' } longitudinal progression for {metric.toUpperCase()}."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
