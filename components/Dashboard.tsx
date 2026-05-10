
import React from 'react';
import { Activity, ShieldCheck, Users, TrendingUp, AlertCircle, CheckCircle2, Clock, Zap, ArrowUpRight, ShieldAlert, Database, Fingerprint, ChevronRight, Terminal } from 'lucide-react';
import { MedicalReport, Blockchain } from '../types';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  reports: MedicalReport[];
  blockchain: Blockchain;
}

const Dashboard: React.FC<DashboardProps> = ({ reports, blockchain }) => {
  const navigate = useNavigate();
  const highRiskCount = reports.filter(r => r.prediction.riskLevel === 'High').length;
  const recentReports = reports.slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Dynamic Header - Reflows for Mobile */}
      {/* Dynamic Header - Reflows for Mobile */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-end gap-8 bg-transparent p-0 pb-4">
        <button
          onClick={() => navigate('/new-analysis')}
          className="bg-rose-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-rose-600/25 flex items-center justify-center gap-3 group"
        >
          <Zap size={20} className="fill-white group-hover:animate-bounce" /> New Analysis
        </button>
      </div>

      {/* Overview Stats Grid - Adaptive 1/2/4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <StatCard icon={<Users size={26} />} label="Total Records" value={reports.length.toString()} sub="Patient History" color="blue" />
        <StatCard icon={<ShieldAlert size={26} />} label="High Risk Path" value={highRiskCount.toString()} sub="Escalated Cases" color="rose" />

        <StatCard icon={<Fingerprint size={26} />} label="Blockchain Chain" value={blockchain.length.toString()} sub="Verified Blocks" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Analysis Timeline - Dynamic Width */}
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 sm:px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Live Diagnostic Stream</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">Global registry activity</p>
            </div>
            <button onClick={() => navigate('/history')} className="text-[11px] font-black text-rose-600 hover:text-rose-700 flex items-center gap-2 bg-rose-50 px-5 py-2.5 rounded-2xl transition-all active:scale-95">
              History <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="divide-y divide-slate-50 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
            {reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 opacity-20">
                <Activity size={80} className="mb-6 text-slate-400" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">Awaiting first session...</p>
              </div>
            ) : (
              recentReports.map(report => (
                <div key={report.id} className="p-6 sm:p-8 flex items-center justify-between hover:bg-slate-50/80 transition-all group cursor-pointer" onClick={() => navigate(`/report/${report.id}`)}>
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm ${report.prediction.riskLevel === 'High' ? 'bg-rose-50 text-rose-500' :
                      report.prediction.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                      <Activity size={28} />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-lg leading-tight mb-1 group-hover:text-rose-600 transition-colors">{report.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {report.id} • {new Date(report.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-10">
                    <div className="text-right hidden md:block">
                      <div className={`text-[11px] font-black uppercase tracking-[0.1em] mb-1 ${report.prediction.riskLevel === 'High' ? 'text-rose-600' :
                        report.prediction.riskLevel === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                        {report.prediction.riskLevel} PROFILE
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">PRECISION: {report.prediction.probability}%</div>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-950 group-hover:text-white transition-all text-slate-400 shadow-sm active:scale-90">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string, color: 'blue' | 'rose' | 'emerald' | 'amber' }> = ({ icon, label, value, sub, color }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-50 border-blue-100 shadow-blue-500/5',
    rose: 'text-rose-500 bg-rose-50 border-rose-100 shadow-rose-500/5',
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100 shadow-emerald-500/5',
    amber: 'text-amber-500 bg-amber-50 border-amber-100 shadow-amber-500/5',
  };

  return (
    <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-500/5 transition-all group cursor-default">
      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 transition-all group-hover:scale-110 group-hover:rotate-6 shadow-sm ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">{label}</div>
        <div className="flex items-baseline gap-2">
          <div className="text-5xl font-black text-slate-950 tracking-tighter tabular-nums">{value}</div>
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{sub}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
