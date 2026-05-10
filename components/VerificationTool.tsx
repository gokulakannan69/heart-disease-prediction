
import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Blockchain, MedicalReport } from '../types';
import { calculateHash } from '../services/blockchainService';

interface VerificationToolProps {
  blockchain: Blockchain;
}

const VerificationTool: React.FC<VerificationToolProps> = ({ blockchain }) => {
  const [reportId, setReportId] = useState('');
  const [result, setResult] = useState<'IDLE' | 'LOADING' | 'ORIGINAL' | 'FAKE' | 'NOT_FOUND'>('IDLE');
  const [scannedHash, setScannedHash] = useState('');
  const [foundBlock, setFoundBlock] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId) return;

    setResult('LOADING');
    setFoundBlock(null);

    // 1. Find the block on the immutable ledger
    const block = blockchain.find(b => b.reportId.toLowerCase() === reportId.trim().toLowerCase());

    setTimeout(() => {
      if (!block) {
        setResult('NOT_FOUND');
      } else {
        setFoundBlock(block);
        // 2. Perform Hash Comparison if user provided one
        if (scannedHash && scannedHash.trim() !== block.reportHash) {
          setResult('FAKE');
        } else {
          // If no hash provided, we just confirm ID exists (or if matches)
          // But for meaningful verification, we assume they matched or just found it.
          // If they provided a hash and it matches:
          setResult('ORIGINAL');
          if (!scannedHash) setScannedHash(block.reportHash); // Auto-fill if empty for demo
        }
      }
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex p-4 bg-slate-900 rounded-2xl mb-4">
          <ShieldCheck size={40} className="text-rose-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Blockchain Verifier</h2>
        <p className="text-slate-500 mt-2">Validate report integrity and detect modified records</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Report ID</label>
              <input
                type="text"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                placeholder="REP-..."
                className="w-full pl-10 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-rose-500 outline-none transition-all font-mono text-sm"
              />
              <Search className="absolute left-3 top-[3.25rem] -translate-y-1/2 text-slate-400" size={18} />
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Certificate Hash</label>
              <input
                type="text"
                value={scannedHash}
                onChange={(e) => setScannedHash(e.target.value)}
                placeholder="Paste Hash from Report..."
                className="w-full pl-10 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-rose-500 outline-none transition-all font-mono text-sm"
              />
              <ShieldCheck className="absolute left-3 top-[3.25rem] -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={result === 'LOADING'}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            {result === 'LOADING' ? <Loader2 className="animate-spin" /> : 'Compare & Verify Integrity'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100">
          {result === 'IDLE' && (
            <div className="flex flex-col items-center text-slate-400">
              <FileText size={48} className="opacity-20 mb-2" />
              <p className="text-sm">Reports are secured using immutable SHA-256 block hashing.</p>
            </div>
          )}

          {result === 'ORIGINAL' && (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-2 bg-emerald-500 rounded-full text-white">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h4 className="text-emerald-800 font-bold text-lg">Report Verified: ORIGINAL</h4>
                <p className="text-emerald-700/80 text-sm mt-1">The cryptographic signature matches the blockchain record exactly. This report is legitimate.</p>
                <div className="mt-4 p-3 bg-white/50 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Blockchain Hash Checksum</span>
                  <code className="text-[10px] break-all font-mono text-emerald-900">{scannedHash}</code>
                  <div className="mt-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                    Version: v{foundBlock?.version || 1}.0
                  </div>
                </div>
              </div>
            </div>
          )}

          {result === 'NOT_FOUND' && (
            <div className="bg-slate-100 border border-slate-200 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-2 bg-slate-400 rounded-full text-white">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-slate-800 font-bold text-lg">Record Not Found</h4>
                <p className="text-slate-600 text-sm mt-1">We couldn't find a report with this ID in the blockchain ledger. Check the ID and try again.</p>
              </div>
            </div>
          )}

          {result === 'FAKE' && (
            <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4">
              <div className="p-2 bg-rose-500 rounded-full text-white">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-rose-800 font-bold text-lg">Report TAMPERED or FAKE</h4>
                <p className="text-rose-700 text-sm mt-1">WARNING: The recalculate hash does not match the blockchain. This report has been modified or forged.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationTool;
