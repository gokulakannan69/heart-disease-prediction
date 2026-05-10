
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { Activity, ShieldCheck, History, Search, Heart, LayoutDashboard, Menu, X, CheckCircle, AlertCircle, Cpu, Bell, User, Clock, LogOut } from 'lucide-react';
import { PatientData, MedicalReport, Blockchain, PredictionResult, User as UserType, AuthState } from './types';
import { predictHeartRisk } from './services/mlService';
import { createBlock, verifyReport } from './services/blockchainService';
import { getEnhancedExplanation, resolveConflict } from './services/geminiService';
import { findSimilarCases } from './services/caseDatabase';
import { userDatabase } from './services/userDatabase';

import { databaseService } from './services/databaseService';

// Components
import PatientForm from './components/PatientForm';
import ReportCard from './components/ReportCard';
import VerificationTool from './components/VerificationTool';
import Dashboard from './components/Dashboard';
import ModelBlueprint from './components/ModelBlueprint';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

const App: React.FC = () => {
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [blockchain, setBlockchain] = useState<Blockchain>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Auth State
  const [auth, setAuth] = useState<AuthState>(() => databaseService.getSession());

  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        await databaseService.migrateFromLegacy();
        const [loadedReports, loadedBlockchain] = await Promise.all([
          databaseService.getReports(),
          databaseService.getBlockchain()
        ]);

        if (!isMounted) return;
        setReports(loadedReports);
        setBlockchain(loadedBlockchain);
      } catch (error) {
        console.error('Failed to load MongoDB data:', error);
      } finally {
        if (isMounted) {
          setIsDataLoading(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    }
  }, []);

  const handleRegister = async (userData: UserType): Promise<boolean> => {
    return userDatabase.registerUser(userData);
  };

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const result = await userDatabase.loginUser(email, pass);
    if (result.success && result.user) {
      const newAuth = { user: result.user, isAuthenticated: true };
      setAuth(newAuth);
      databaseService.saveSession(newAuth); // Persist session
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    databaseService.clearSession();
  };

  const handleAddReport = async (patientName: string, data: PatientData) => {
    const basePrediction = predictHeartRisk(data);
    const similarCases = findSimilarCases(data, 3);
    const enhanced = await getEnhancedExplanation(data, basePrediction, similarCases);

    let prediction: PredictionResult = {
      ...basePrediction,
      explanation: enhanced.explanation,
      guidance: enhanced.guidance,
      homeRemedies: enhanced.homeRemedies,
      hospitalRemedies: enhanced.hospitalRemedies,
      mainCauses: enhanced.mainCauses,
      possibleEffects: enhanced.possibleEffects,
      aiAnalysis: enhanced.aiAnalysis
    };

    // PERFORM CALIBRATION / CONFLICT RESOLUTION
    // STRICT MAX RULE: Final Risk = MAX(ML, AI)
    const mlRisk = basePrediction.riskLevel;
    const aiRisk = enhanced.aiAnalysis?.riskLevel || 'Low';

    let finalRisk: import('./types').RiskLevel = 'Low';
    if (mlRisk === 'High' || aiRisk === 'High') finalRisk = 'High';
    else if (mlRisk === 'Medium' || aiRisk === 'Medium') finalRisk = 'Medium';
    else finalRisk = 'Low';

    // Calculate Unified Confidence (Weighted)
    // If High Risk, confidence should be high to prompt action.
    let finalConfidence = basePrediction.probability;
    if (finalRisk === 'High') {
      finalConfidence = Math.max(basePrediction.probability, enhanced.aiAnalysis?.confidence || 0, 75);
    } else {
      finalConfidence = Math.round((basePrediction.probability + (enhanced.aiAnalysis?.confidence || 0)) / 2);
    }

    const calibration = {
      resolvedRisk: finalRisk,
      consensusConfidence: finalConfidence,
      arbitrationNotes: [
        `Screening Protocol Applied: MAX(ML, AI)`,
        `ML Risk: ${mlRisk}, AI Risk: ${aiRisk}`,
        `Final Screening Determination: ${finalRisk}`
      ]
    };

    prediction.conflictResolution = calibration;

    // Versioning Logic
    const patientReports = reports.filter(r => r.patientName.toLowerCase() === patientName.toLowerCase());
    const latestVersion = patientReports.length > 0 ? Math.max(...patientReports.map(r => r.version)) : 0;
    const newVersion = latestVersion + 1;

    const newReport: MedicalReport = {
      id: `REP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      patientName,
      timestamp: Date.now(),
      data,
      prediction,
      version: newVersion
    };

    // Update State
    setReports(prev => [newReport, ...prev]);

    // Update Database (Folder Structure)
    await databaseService.saveReport(newReport);

    const newBlock = await createBlock(newReport, blockchain);
    setBlockchain(prev => [...prev, newBlock]);
    await databaseService.saveBlock(newBlock);

    return newReport.id;
  };

  // Close sidebar when route changes on mobile
  const location = useLocation();
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Routes>
        <Route path="/login" element={!auth.isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />

        <Route path="/*" element={
          auth.isAuthenticated ? (
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar Component */}
              <aside
                className={`fixed inset-y-0 left-0 z-[100] w-72 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                  }`}
              >
                <div className="flex flex-col h-full">
                  <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/20">
                        <Heart className="w-6 h-6 text-white fill-white/20" />
                      </div>
                      <div>
                        <h1 className="text-xl font-black tracking-tight leading-none text-white">HeartGuardian</h1>
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1 block">v2.5 Clinical</span>
                      </div>
                    </div>
                    <button className="lg:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
                      <X size={20} />
                    </button>
                  </div>

                  <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Overview" />
                    <div className="px-4 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Clinical Suite</div>
                    <NavLink to="/new-analysis" icon={<Activity size={18} />} label="New Analysis" />
                    <NavLink to="/history" icon={<History size={18} />} label="Medical Archive" />

                    <div className="px-4 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Engine Logic</div>
                    <NavLink to="/blueprint" icon={<Cpu size={18} />} label="ML Architecture" />
                    <NavLink to="/verify" icon={<ShieldCheck size={18} />} label="Block Verifier" />
                  </nav>

                  <div className="p-6 mt-auto border-t border-white/5">
                    <div className="bg-white/5 p-4 rounded-2xl mb-4">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Authenticated As</div>
                      <div className="text-sm font-bold text-white truncate">{auth.user?.name}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all font-bold text-sm"
                    >
                      <LogOut size={18} /> End Session
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-4 sm:px-10 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
                  <div className="flex items-center gap-4">
                    <button
                      className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                      onClick={() => setIsSidebarOpen(true)}
                    >
                      <Menu size={24} />
                    </button>
                    <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-5 py-2.5 w-64 xl:w-96">
                      <Search size={16} className="text-slate-400 mr-2" />
                      <input type="text" placeholder="Search IDs..." className="bg-transparent text-sm outline-none w-full text-slate-600" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-3 pl-2 group">
                      <div className="text-right hidden xs:block">
                        <div className="text-sm font-black text-slate-900 leading-none">{auth.user?.name.split(' ').pop()}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{auth.user?.specialization}</div>
                      </div>
                      <div className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 group-hover:border-rose-100 transition-all">
                        <User size={22} />
                      </div>
                    </div>
                  </div>
                </header>

                {/* Content Container */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 custom-scrollbar">
                  <div className="max-w-[1920px] mx-auto w-full">
                    {isDataLoading ? (
                      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500 font-semibold">
                        Loading MongoDB records...
                      </div>
                    ) : (
                      <Routes>
                        <Route path="/" element={<Dashboard reports={reports} blockchain={blockchain} />} />
                        <Route path="/new-analysis" element={<PatientForm onSubmit={handleAddReport} />} />
                        <Route path="/history" element={<ReportList reports={reports} />} />
                        <Route path="/blueprint" element={<ModelBlueprint />} />
                        <Route path="/report/:id" element={<ReportDetail reports={reports} blockchain={blockchain} />} />
                        <Route path="/verify" element={<VerificationTool blockchain={blockchain} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    )}
                  </div>
                </main>
              </div>

              {/* Mobile Sidebar Backdrop */}
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
            </div>
          ) : <Navigate to="/login" />
        } />
      </Routes>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${isActive
        ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 font-bold'
        : 'text-slate-400 hover:bg-white/5 hover:text-white font-semibold'
        }`}
    >
      <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-rose-400'} transition-colors`}>
        {icon}
      </span>
      <span className="text-sm tracking-tight">{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
    </Link>
  );
};

const ReportList: React.FC<{ reports: MedicalReport[] }> = ({ reports }) => {
  const navigate = useNavigate();

  if (reports.length === 0) return (
    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-sm animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <History size={32} className="text-slate-300" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Archive is empty</h2>
      <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">Complete a diagnostic analysis to see it recorded here.</p>
      <button
        onClick={() => navigate('/new-analysis')}
        className="mt-8 inline-flex items-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
      >
        <Activity size={18} /> Start Analysis
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medical Archive</h2>
          <p className="text-slate-500 font-medium">Immutable registry of cardiovascular sessions</p>
        </div>
      </div>

      <div className="grid gap-4">
        {reports.map(report => {
          const displayRisk = report.prediction.conflictResolution?.resolvedRisk || report.prediction.riskLevel;
          const displayProb = report.prediction.conflictResolution?.consensusConfidence || report.prediction.probability;

          return (
            <Link key={report.id} to={`/report/${report.id}`} className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-500/5 transition-all active:scale-[0.99]">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 ${displayRisk === 'High' ? 'bg-rose-50 text-rose-500' :
                  displayRisk === 'Medium' ? 'bg-amber-50 text-amber-500' :
                    'bg-emerald-50 text-emerald-500'
                  }`}>
                  <Activity size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg group-hover:text-rose-600 transition-colors leading-tight">{report.patientName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] sm:text-xs text-slate-500 font-black uppercase mt-1 tracking-wider">
                    <span className="font-mono text-rose-500/60 tracking-normal">{report.id}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-300" /> {new Date(report.timestamp).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5 text-emerald-500"><ShieldCheck size={12} /> VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 mt-6 sm:mt-0">
                <div className="text-right hidden md:block">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Logic</div>
                  <div className="text-xl font-black text-slate-900">{displayProb}%</div>
                </div>
                <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${displayRisk === 'High' ? 'bg-rose-500 text-white' :
                  displayRisk === 'Medium' ? 'bg-amber-400 text-white' :
                    'bg-emerald-500 text-white'
                  }`}>
                  {displayRisk} Risk
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const ReportDetail: React.FC<{ reports: MedicalReport[], blockchain: Blockchain }> = ({ reports, blockchain }) => {
  const { id } = useParams<{ id: string }>();
  const report = reports.find(r => r.id === id);
  const block = blockchain.find(b => b.reportId === id);

  if (!report) return (
    <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-200">
      <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
      <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Analysis Not Found</h2>
      <Link to="/history" className="text-rose-500 font-black hover:underline mt-4 inline-block uppercase text-xs tracking-widest">Back to Archive</Link>
    </div>
  );

  return (
    <div className="max-w-full mx-auto">
      <ReportCard report={report} block={block} />
    </div>
  );
};

export default App;
