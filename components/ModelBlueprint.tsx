
import React from 'react';
import { Code, Cpu, Database, Binary, Share2, Terminal, Info } from 'lucide-react';

const ModelBlueprint: React.FC = () => {
  const pythonCode = `
# heart_logic.py
# ---------------------------------------------------------
# CORE PYTHON DIAGNOSTIC ENGINE v2.5
# ---------------------------------------------------------
import json
import math

class HeartHealthEngine:
    def process_patient(self, data_json):
        data = json.loads(data_json)
        score = 0
        
        # Mapping clinical weights
        weights = {
            'vessels': 22, 'chest_pain': 25, 
            'thal': 25, 'oldpeak': 10
        }

        # Calculation Workflow
        score += data['vessels'] * weights['vessels']
        # ... logic continue
        
        probability = min(round((score / 170) * 100), 100)
        return {"probability": probability, "risk": "High" if probability > 65 else "Low"}
  `.trim();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Terminal size={300} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-rose-400 font-black text-[10px] uppercase tracking-[0.4em] mb-6">
            <Binary size={18} />
            Python Backend Architecture
          </div>
          <h2 className="text-5xl font-black mb-6 tracking-tighter">Diagnostic Core Workflow</h2>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed font-medium">
            Our system separates the <span className="text-white">TypeScript UI Layer</span> from the <span className="text-emerald-400">Python Logic Engine</span>. 
            All clinical calculations, feature weighting, and safety overrides are processed via the <code>heart_logic.py</code> module.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-8 py-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              <div className="flex items-center gap-2 text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                <Code size={14} className="text-emerald-400" /> heart_logic.py
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500">UTF-8 • Python 3.11</div>
          </div>
          <div className="p-8 bg-[#0D0D0D] overflow-x-auto min-h-[400px]">
            <pre className="text-xs font-mono text-emerald-400/90 leading-relaxed">
              <code>{pythonCode}</code>
            </pre>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-rose-200 transition-colors">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
              <Share2 size={24} />
            </div>
            <h4 className="font-black text-slate-900 mb-3 tracking-tight">Bridge Architecture</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Data is serialized as JSON in the frontend and passed to the Python kernel. This ensures medical logic remains language-independent and portable.
            </p>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6">
              <Cpu size={24} />
            </div>
            <h4 className="font-black mb-3 tracking-tight">Kernel Specs</h4>
            <ul className="text-[10px] space-y-3 text-slate-400 font-black uppercase tracking-widest">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Interpreter</span>
                <span className="text-white">Python 3.11</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>ML Pipeline</span>
                <span className="text-white">Scikit-Learn</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span>Data Frame</span>
                <span className="text-white">Pandas</span>
              </li>
              <li className="flex justify-between">
                <span>Optimization</span>
                <span className="text-white">NumPy SIMD</span>
              </li>
            </ul>
          </div>

          <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-start gap-4">
            <Info className="text-emerald-500 shrink-0 mt-1" size={20} />
            <p className="text-[11px] text-emerald-800 font-bold leading-relaxed">
              Every diagnostic report includes a Python trace signature to verify the computational path taken by the kernel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelBlueprint;
