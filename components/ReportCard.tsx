
import React, { useState, useEffect } from 'react';
import { MedicalReport, Block } from '../types';
import { Heart, ShieldCheck, FileText, Share2, Printer, AlertTriangle, BarChart3, Clock, ChevronRight, Activity, Zap, Stethoscope, Terminal, Code, Cpu, Layers, Database } from 'lucide-react';
import { resolveConflict } from '../services/geminiService';

interface ReportCardProps {
  report: MedicalReport;
  block?: Block;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, block }) => {
  const [activeTab, setActiveTab] = useState<'Clinical' | 'Python'>('Clinical');
  const [typedLogs, setTypedLogs] = useState<any[]>([]);
  const { prediction, patientName, id } = report;
  const pythonTrace = prediction.pythonTrace;

  const [isResolving, setIsResolving] = useState(false);
  const [resolution, setResolution] = useState(prediction.conflictResolution);

  const displayRisk = resolution?.resolvedRisk || prediction.riskLevel;
  const displayConfidence = resolution?.consensusConfidence || prediction.probability;
  const displayNotes = resolution?.arbitrationNotes || [];

  const handleResolve = async () => {
    setIsResolving(true);
    // In a real app we might update the DB, here we just show local state
    const result = await resolveConflict(report.data, prediction);
    setResolution(result);
    setIsResolving(false);
  };

  useEffect(() => {
    if (prediction.riskLevel !== prediction.aiAnalysis?.riskLevel && !resolution && !isResolving) {
      handleResolve();
    }
  }, [prediction.riskLevel, prediction.aiAnalysis?.riskLevel, resolution]);

  useEffect(() => {
    if (activeTab === 'Python') {
      setTypedLogs([]);
      let i = 0;
      const interval = setInterval(() => {
        if (i < pythonTrace.length) {
          setTypedLogs(prev => [...prev, pythonTrace[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [activeTab, pythonTrace]);

  const riskTheme = {
    High: {
      bg: 'bg-rose-600',
      text: 'text-rose-600',
      lightBg: 'bg-rose-50',
      border: 'border-rose-500',
      accent: 'text-white',
      shadow: 'shadow-rose-500/20'
    },
    Medium: {
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      lightBg: 'bg-amber-50',
      border: 'border-amber-400',
      accent: 'text-white',
      shadow: 'shadow-amber-500/20'
    },
    Low: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-500',
      accent: 'text-white',
      shadow: 'shadow-emerald-500/20'
    }
  };

  const theme = riskTheme[displayRisk];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className={`bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden border shadow-2xl ${theme.border} transition-all`}>
        {/* Certificate Header - Stacked on Mobile */}
        <div className={`px-6 sm:px-14 py-12 sm:py-20 ${theme.bg} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <Heart size={400} className="fill-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 sm:gap-14 text-white">
            <div className="max-w-full md:max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
                  <Activity size={28} className="text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-white/90">Clinical Risk Certificate</span>
              </div>
              <h1 className="text-4xl sm:text-7xl font-black tracking-tighter mb-4 leading-[0.9]">
                {displayRisk} <br /> Severity
              </h1>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-black mt-8">
                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs uppercase tracking-wider backdrop-blur-sm border transition-all ${displayConfidence < 50 ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 animate-pulse' : 'bg-white/15 border-white/10'
                  }`}>
                  {displayConfidence < 50 ? <AlertTriangle size={16} /> : <Zap size={16} className="fill-white" />}
                  {displayConfidence < 50 ? "UNCERTAIN – FURTHER TESTS RECOMMENDED" : `CONFIDENCE: ${displayConfidence}%`}
                </span>
                <span className="text-xs opacity-70 uppercase tracking-widest font-mono">NODE_HASH: {id}</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
                  <Activity size={12} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">v{report.version || 1}.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-white/20 text-left md:text-right shadow-2xl min-w-[260px] w-full md:w-auto self-stretch md:self-center">
              <div className="text-[10px] uppercase font-black text-white/60 tracking-[0.2em] mb-3">Blockchain Verification</div>
              <div className="text-2xl sm:text-3xl font-mono font-black text-white tracking-tight mb-6">0x{id.split('-')[1]}</div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-start md:justify-end gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">LEDGER_SECURE</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 sm:px-14 py-4 sm:py-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex w-full sm:w-auto gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('Clinical')}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${activeTab === 'Clinical' ? 'bg-white text-slate-900 shadow-xl shadow-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Diagnostic Report
            </button>
            <button
              onClick={() => setActiveTab('Python')}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${activeTab === 'Python' ? 'bg-slate-900 text-white shadow-xl shadow-slate-950/20' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Terminal size={14} /> Trace Log
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 border border-slate-200 rounded-2xl transition-all active:scale-90 shadow-sm">
              <Printer size={20} />
            </button>
            <button className="p-3 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 border border-slate-200 rounded-2xl transition-all active:scale-90 shadow-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Layout - Adaptive Columns */}
        {activeTab === 'Clinical' ? (
          <div className="p-6 sm:p-10 xl:p-12 grid grid-cols-1 xl:grid-cols-12 gap-10 xl:gap-16 animate-in fade-in duration-500">
            {/* Left Column: Demographics & Stats */}
            <div className="xl:col-span-5 2xl:col-span-4 space-y-10 xl:space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                  <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">Patient Identity</h3>
                </div>
                <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</div>
                  <div className="text-2xl font-black text-slate-900 mb-8 tracking-tight">{patientName}</div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age Profile</div>
                      <div className="font-black text-slate-800 text-lg">{report.data.age} YRS</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Biological Sex</div>
                      <div className="font-black text-slate-800 text-lg">{report.data.sex}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Systolic BP</div>
                      <div className="font-black text-slate-800 text-lg">{report.data.restingBP} MMHG</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Serum Chol</div>
                      <div className="font-black text-slate-800 text-lg">{report.data.cholesterol} MG/DL</div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">Cardiac Profile</h3>
                </div>
                <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
                  <div className="grid grid-cols-1 gap-y-6">
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Chest Pain Type</div>
                      <div className="font-black text-slate-800 text-lg">{report.data.chestPainType}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Exc. Angina</div>
                        <div className={`font-black text-lg ${report.data.exerciseAngina ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {report.data.exerciseAngina ? 'DETECTED' : 'ABSENT'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ST Oldpeak</div>
                        <div className="font-black text-slate-800 text-lg">{report.data.oldpeak}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resting ECG</div>
                      <div className="font-black text-slate-800 text-base leading-tight">{report.data.restingECG}</div>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                  <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em]">ML Factor Weights</h3>
                </div>
                <div className="space-y-6">
                  {prediction.featureImportance.slice(0, 5).map((feat, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-wider">
                        <span className="truncate max-w-[200px]">{feat.feature}</span>
                        <span className="tabular-nums">{Math.round(feat.impact)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                        <div
                          className={`h-full ${theme.bg} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(225,29,72,0.2)]`}
                          style={{ width: `${feat.impact}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: AI Insights & Guidance */}
            <div className="xl:col-span-7 2xl:col-span-8 space-y-12 xl:space-y-16">

              {/* UNIFIED SCREENING RESULT */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                      <ShieldCheck size={24} className="text-indigo-400" />
                    </div>
                    <h3 className="text-white text-sm font-black uppercase tracking-[0.2em]">Screening Analysis Result</h3>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
                    <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Final Determination</div>
                      <div className={`text-4xl sm:text-5xl font-black ${prediction.riskLevel === 'High' ? 'text-rose-500' : prediction.riskLevel === 'Medium' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {displayRisk} Risk
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Screening Confidence</div>
                      <div className="text-3xl font-mono font-black text-white">{displayConfidence}%</div>
                    </div>
                  </div>

                  {/* Calibration Notes */}
                  {displayNotes && displayNotes.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">System Reasoning</div>
                      <div className="space-y-2">
                        {displayNotes.map((note, i) => (
                          <div key={i} className="flex gap-2 text-xs text-slate-400 font-medium">
                            <span className="text-indigo-400">•</span> {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="mt-8 pt-8 border-t border-white/10 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wide">
                      <strong>DISCLAIMER:</strong> This is a computer-generated screening result based on statistical models and clinical rules. It is <strong>NOT</strong> a medical diagnosis. Please consult a qualified doctor for clinical evaluation.
                    </p>
                  </div>
                </div>
              </div>

              {/* CAUSE - EFFECT MODULE (Indian Context) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Causes */}
                <div className="bg-rose-50/50 p-8 rounded-[2.5rem] border border-rose-100 flex flex-col relative overflow-hidden group hover:border-rose-200 transition-all">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity size={120} className="text-rose-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Primary Drivers
                    </div>
                    <ul className="space-y-4">
                      {(prediction.mainCauses?.length ? prediction.mainCauses : ["Profile complexity requires review."]).map((cause, i) => (
                        <li key={i} className="flex gap-3 text-slate-700 font-bold text-sm leading-snug">
                          <span className="text-rose-400">•</span> {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Possible Effects */}
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 flex flex-col relative overflow-hidden group hover:border-slate-300 transition-all">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertTriangle size={120} className="text-slate-500" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Potential Risks
                    </div>
                    <ul className="space-y-4">
                      {(prediction.possibleEffects?.length ? prediction.possibleEffects : ["Monitoring required."]).map((effect, i) => (
                        <li key={i} className="flex gap-3 text-slate-600 font-bold text-sm leading-snug">
                          <span className="text-amber-500">→</span> {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <section className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 sm:p-14 shadow-sm relative overflow-hidden group hover:border-rose-100 transition-colors">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Stethoscope size={240} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 text-rose-500 font-black text-[11px] uppercase tracking-[0.4em] mb-10">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                      <Zap size={20} className="fill-rose-500" />
                    </div>
                    Screening Observations
                  </div>

                  <div className="space-y-6 mb-12">
                    {prediction.explanation.map((item, i) => (
                      <div key={i} className={`flex gap-6 group/item p-4 rounded-2xl transition-colors ${item.includes("Unavailable") ? "bg-amber-50 border border-amber-200" : "hover:bg-slate-50"}`}>
                        {item.includes("Unavailable") ? (
                          <div className="mt-1 w-8 h-8 rounded-full shrink-0 bg-amber-100 flex items-center justify-center text-amber-500 shadow-sm">
                            <AlertTriangle size={16} />
                          </div>
                        ) : (
                          <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${theme.bg} group-hover/item:scale-150 transition-transform shadow-lg shadow-rose-500/20`} />
                        )}
                        <p className={`font-bold text-lg leading-relaxed transition-colors ${item.includes("Unavailable") ? "text-amber-700" : "text-slate-700 group-hover/item:text-slate-950"}`}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Remedies Section */}
                  {(prediction.homeRemedies?.length || 0) > 0 && (
                    <div className="grid grid-cols-1 gap-6 mb-12">
                      {/* Home Remedies Card */}
                      <div className="bg-emerald-50/50 p-6 sm:p-8 rounded-[2rem] border border-emerald-100/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                          <Heart size={100} className="fill-emerald-500" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                              <Heart size={14} className="fill-current" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Lifestyle Management</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {prediction.homeRemedies?.map((rem, i) => (
                              <div key={i} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                <span className="text-sm font-bold text-slate-700 leading-snug">{rem}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hospital/Clinical Remedies Card */}
                      <div className="bg-blue-50/50 p-6 sm:p-8 rounded-[2rem] border border-blue-100/50 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                          <ShieldCheck size={100} className="fill-blue-500" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                              <ShieldCheck size={14} className="fill-current" />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Clinical Recommendations</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {prediction.hospitalRemedies?.map((rem, i) => (
                              <div key={i} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                <span className="text-sm font-bold text-slate-700 leading-snug">{rem}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12 border-2 ${theme.border} ${theme.lightBg} shadow-xl`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-bl-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                      <div className={`min-w-[80px] h-20 rounded-2xl ${theme.bg} text-white flex items-center justify-center shadow-lg shadow-current/20`}>
                        <Stethoscope size={32} />
                      </div>
                      <div>
                        <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.text} mb-2`}>
                          Initial Care Guidance
                        </div>
                        <p className="text-slate-900 font-black text-xl sm:text-3xl leading-tight tracking-tight">
                          {prediction.guidance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {prediction.isSafetyOverride && (
                <div className="bg-rose-950 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 border border-rose-500/30 shadow-2xl shadow-rose-950/40">
                  <div className="p-4 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/30">
                    <ShieldCheck size={32} />
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="text-white font-black text-lg uppercase tracking-[0.2em] mb-1">Clinical Safety Override</div>
                    <p className="text-rose-200/60 text-sm font-bold leading-relaxed">System triggered automatic escalation based on high-severity vital markers bypassing ML probability thresholds.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Python Trace View - Responsive Terminal */
          <div className="p-6 sm:p-14 lg:p-20 animate-in fade-in duration-500">
            <div className="bg-[#0D0D0D] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col min-h-[500px] h-[700px] max-h-screen">
              <div className="px-8 py-5 bg-[#1A1A1A] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                  </div>
                  <div className="h-4 w-[1px] bg-white/10 mx-2 hidden sm:block" />
                  <div className="flex items-center gap-2 text-[10px] font-mono font-black text-white/40 uppercase tracking-widest">
                    <Code size={14} className="text-emerald-400" /> heart_logic.py
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Cpu size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest">LOG_STREAM</span>
                </div>
              </div>

              <div className="p-8 sm:p-12 flex-1 font-mono text-[10px] sm:text-xs overflow-y-auto space-y-3 custom-scrollbar">
                {typedLogs.map((log, idx) => (
                  <div key={idx} className="flex flex-col xs:flex-row gap-2 xs:gap-6 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-white/20 shrink-0 font-bold tabular-nums">[{log.timestamp}]</span>
                    <div className="flex items-start gap-4">
                      <span className={`font-black uppercase tracking-tighter shrink-0 w-20 ${log.level === 'ERROR' ? 'text-rose-500' :
                        log.level === 'WARNING' ? 'text-amber-400' :
                          log.level === 'DEBUG' ? 'text-blue-400' : 'text-emerald-400'
                        }`}>
                        {log.level}
                      </span>
                      <span className="text-white/80 leading-relaxed font-medium">
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))}
                {typedLogs.length < pythonTrace.length && (
                  <div className="flex gap-4 items-center">
                    <span className="text-white/20">[{new Date().toISOString().split('T')[1].split('Z')[0]}]</span>
                    <span className="text-emerald-400 font-black animate-pulse">| SYSTEM_EXECUTING_TRACE...</span>
                  </div>
                )}
              </div>

              <div className="px-10 py-6 bg-[#1A1A1A]/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data_Ref: Cleveland_v2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Engine: LogicCore_3.11</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-600 font-bold tracking-widest">
                  SECURE_SHELL_TUNNEL_ACTIVE
                </div>
              </div>
            </div>

            <div className="mt-10 p-8 bg-slate-100/50 border border-slate-200 rounded-[2rem] flex items-start gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm shadow-slate-200 shrink-0">
                <Terminal size={24} className="text-slate-400" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-widest mb-2">Process Integrity Audit</h4>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">
                  The Python trace log is a cryptographically verified record of the computational path taken by the heart logic engine.
                  This audit trail ensures clinical transparency and supports medical accountability protocols.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
