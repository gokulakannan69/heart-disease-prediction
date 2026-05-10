
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, ShieldCheck, Stethoscope, BriefcaseMedical } from 'lucide-react';

interface RegisterProps {
  onRegister: (data: any) => Promise<boolean>;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseId: '',
    specialization: 'Cardiologist',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const success = await onRegister(formData);
      if (!success) {
        setError('Registration failed. Email may already be in use.');
        return;
      }
      navigate('/login');
    } catch (submitError) {
      console.error('Registration error:', submitError);
      setError('Unable to create account right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl w-full animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left Panel */}
            <div className="md:w-2/5 bg-slate-950 p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between min-h-[300px] md:min-h-[600px]">
              <div>
                <div className="flex items-center gap-3 mb-10">
                  <Heart size={32} className="text-rose-500 fill-rose-500" />
                  <h1 className="text-xl font-black tracking-tighter">HeartGuardian</h1>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-4 leading-tight tracking-tight">Credential Verification</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Join our network of cardiovascular experts. Registration requires a valid medical license and institutional email.
                </p>
              </div>
              <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                  <ShieldCheck size={14} /> Security Note
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  All accounts are audited against the National Physician Database.
                </p>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="md:w-3/5 p-8 sm:p-10 lg:p-12 xl:p-14">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Professional Name</label>
                    <div className="relative">
                      <input required name="name" value={formData.name} onChange={handleChange} className="form-input-auth" placeholder="Dr. Sarah Jenkins" />
                      <User className="input-icon" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Institutional Email</label>
                    <div className="relative">
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="form-input-auth" placeholder="s.jenkins@heart.org" />
                      <Mail className="input-icon" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Medical License ID</label>
                    <div className="relative">
                      <input required name="licenseId" value={formData.licenseId} onChange={handleChange} className="form-input-auth" placeholder="MD-8829-X" />
                      <BriefcaseMedical className="input-icon" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Specialization</label>
                    <div className="relative">
                      <select name="specialization" value={formData.specialization} onChange={handleChange} className="form-input-auth appearance-none">
                        <option>Cardiologist</option>
                        <option>Heart Surgeon</option>
                        <option>General Physician</option>
                        <option>Research Scientist</option>
                      </select>
                      <Stethoscope className="input-icon" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Secure Password</label>
                  <div className="relative">
                    <input required type="password" name="password" value={formData.password} onChange={handleChange} className="form-input-auth" placeholder="••••••••" />
                    <Lock className="input-icon" size={16} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 mt-8"
                >
                  {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE PHYSICIAN ACCOUNT'}
                </button>

                <div className="text-center pt-2">
                  <p className="text-slate-400 text-xs font-bold">
                    Already registered? <Link to="/login" className="text-rose-600 hover:underline">Enter Portal</Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .form-input-auth {
          width: 100%;
          padding: 1rem 1rem 1rem 2.75rem;
          background-color: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 1rem;
          font-weight: 700;
          font-size: 0.875rem;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .form-input-auth:focus {
          border-color: #e11d48;
          background-color: #fff;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default Register;
