
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Fixed: Added missing 'Cpu' import from 'lucide-react'
import { Heart, Lock, Mail, ArrowRight, ShieldCheck, Zap, AlertCircle, Loader2, Cpu } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await onLogin(email, password);
      if (success) {
        navigate('/');
        return;
      }
      setError('Verification Failed: Physician credentials not found or Medical ID mismatch.');
    } catch (error) {
      setError('Unable to reach authentication service. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.15)] border border-slate-200 overflow-hidden">
          
          <div className="bg-slate-950 p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
              <Heart size={200} className="fill-white" />
            </div>
            <div className="relative z-10 flex items-center gap-3 mb-10">
              <div className="p-3 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20">
                <Heart size={24} className="fill-white text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tighter">HeartGuardian</h1>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tighter leading-tight">Clinical Portal <br /> Access</h2>
            <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed max-w-[280px]">
              Secure verification required for all medical personnel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
            {error && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-[1.25rem] text-rose-600 text-[11px] font-black flex items-start gap-3 animate-shake">
                <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                <span className="leading-relaxed uppercase tracking-wide">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Physician Identifier (Email)</label>
                <div className="relative group">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                    placeholder="dr.jenkins@hospital.org"
                  />
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Medical Passkey</label>
                <div className="relative group">
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/5 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-500 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-rose-500/20 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span className="uppercase tracking-[0.2em]">Verifying ID...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em]">Enter Secure Portal</span>
                  <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                New Physician? <Link to="/register" className="text-rose-600 hover:underline hover:text-rose-700">Apply for Credentials</Link>
              </p>
            </div>
          </form>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-6 opacity-30 px-6 text-center">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <ShieldCheck size={14} /> HIPAA COMPLIANT
          </div>
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <Cpu size={14} /> KERNEL v2.5
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.25s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  );
};

export default Login;
