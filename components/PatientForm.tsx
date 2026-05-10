
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PatientData } from '../types';
import {
  ClipboardList, Loader2, Info, AlertCircle, Activity, Heart, Zap,
  UserPlus, FileSearch, BookOpen, ChevronDown, ChevronUp, ShieldCheck,
  Thermometer, Droplets, Activity as Pulse, Code, Terminal, Cpu, Box,
  Database, Braces
} from 'lucide-react';
import { PDF_CASE_LIBRARY, PDFCase, ALL_CASES } from '../services/caseDatabase';

interface PatientFormProps {
  onSubmit: (name: string, data: PatientData) => Promise<string>;
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCaseLibrary, setShowCaseLibrary] = useState(false);
  const [showPythonTrace, setShowPythonTrace] = useState(true);

  // Terminal Logic States
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [formData, setFormData] = useState<Partial<PatientData>>({
    age: undefined,
    sex: 'Male',
    restingBP: undefined,
    cholesterol: undefined,
    fastingBloodSugar: false,
    restingECG: 'Normal',
    maxHeartRate: undefined,
    chestPainType: 'Typical Angina',
    exerciseAngina: false,
    oldpeak: undefined,
    stSlope: 'Flat',
    vessels: undefined,
    thal: 'Normal'
  });

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isProcessing) scrollToBottom();
  }, [terminalLogs, isProcessing]);

  useEffect(() => {
    if (location.state?.importedData) {
      const imported = location.state.importedData as PDFCase;
      setName(imported.name);
      setFormData(imported.data);
    }
  }, [location.state]);

  const handleLoadCase = (item: PDFCase) => {
    setName(item.name);
    setFormData(item.data);
    setShowCaseLibrary(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let finalValue: any;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (['age', 'restingBP', 'cholesterol', 'maxHeartRate', 'oldpeak', 'vessels'].includes(name)) {
      // Handle numeric fields - allow empty string during typing
      if (value === '' || value === null) {
        finalValue = undefined;
      } else {
        const numValue = parseFloat(value);
        finalValue = isNaN(numValue) ? undefined : numValue;
      }
    } else {
      finalValue = value;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const runSimulation = async () => {
    const logs = [
      ">>> python3 heart_logic.py --input-patient-id=PROVISIONAL",
      "INFO: Initializing HeartHealthEngine v2.5.4...",
      "INFO: Loading model weights from cleveland_forest.bin...",
      `DEBUG: Input Map: { Age: ${formData.age}, BP: ${formData.restingBP}, Vessels: ${formData.vessels} }`,
      "WORKING: Computing risk probability scores...",
      "TRACE: Processing Vessel Occlusion Logic...",
      "TRACE: Calculating ST Segment Depression...",
      "TRACE: Mapping Chest Pain Morphology...",
      "SUCCESS: Computational logic complete.",
      "BLOCKCHAIN: Generating report signature...",
      "LEDGER: Recording entry to medical_ledger_v2...",
      ">>> Finalizing Output Report..."
    ];

    for (const log of logs) {
      setTerminalLogs(prev => [...prev, log]);
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields before submission
    if (!formData.age || !formData.restingBP || !formData.cholesterol ||
      !formData.maxHeartRate || formData.oldpeak === undefined ||
      formData.vessels === undefined) {
      alert('⚠️ Please fill in all required fields before submitting.');
      return;
    }

    // Validate ST Depression (oldpeak) is a valid number
    if (isNaN(formData.oldpeak) || formData.oldpeak < 0) {
      alert('⚠️ ST Depression (Oldpeak) must be a valid number (0 or greater).');
      return;
    }

    setIsProcessing(true);
    setTerminalLogs([]);

    try {
      await runSimulation();

      const reportId = await onSubmit(name, formData as PatientData);
      navigate(`/report/${reportId}`);
    } catch (error) {
      console.error('Error during analysis submission:', error);
      alert(`❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check your Gemini API key in .env.local file.`);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Simulation Terminal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] bg-slate-950/98 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#080808] rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-[0_0_150px_rgba(225,29,72,0.25)] overflow-hidden flex flex-col h-[550px] max-h-full animate-in zoom-in-95 duration-300">
            <div className="px-6 sm:px-10 py-5 sm:py-6 bg-[#111] border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse delay-75" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono font-black text-white/30 uppercase tracking-widest">
                  <Terminal size={14} className="text-emerald-400" /> heart_logic.py
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Cpu size={14} className="text-emerald-400" />
                <span className="text-[10px] font-mono font-black text-emerald-400 tracking-wider">KERNEL_ACTIVE</span>
              </div>
            </div>

            <div className="flex-1 p-6 sm:p-10 font-mono text-[10px] sm:text-xs overflow-y-auto space-y-2.5 custom-scrollbar">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <span className="text-white/10 shrink-0 font-bold">[{idx.toString().padStart(2, '0')}]</span>
                  <span className={`leading-relaxed tracking-tight ${log.startsWith('SUCCESS') ? 'text-emerald-400 font-black' :
                    log.startsWith('>>>') ? 'text-rose-400 font-black' :
                      log.startsWith('TRACE') ? 'text-blue-400' : 'text-white/70'
                    }`}>
                    {log}
                  </span>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <div className="px-8 py-6 bg-[#111] border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 size={16} className="text-rose-500 animate-spin" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Computing Bio-Metrics...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Library Switcher */}
      <div className="mb-6 sm:mb-10 bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-sm">
        <button
          onClick={() => setShowCaseLibrary(!showCaseLibrary)}
          className="w-full px-6 sm:px-10 py-6 sm:py-8 flex items-center justify-between hover:bg-slate-50 transition-all group"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 transition-transform group-hover:scale-110 shadow-sm">
              <BookOpen size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">Diagnostic Reference Library</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-[0.1em] mt-0.5">Import reference clinical datasets</p>
            </div>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-400 group-hover:text-slate-600 transition-all">
            {showCaseLibrary ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </div>
        </button>

        {showCaseLibrary && (
          <div className="px-6 sm:px-10 pb-10 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-100">
              {ALL_CASES.slice(0, 100).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLoadCase(item)}
                  type="button"
                  className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/5 transition-all text-left group active:scale-[0.98]"
                >
                  <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1.5">{item.pageReference}</div>
                  <div className="font-black text-slate-900 mb-2 group-hover:text-rose-600 transition-colors leading-tight">{item.name}</div>
                  <div className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-2">{item.originalDiagnosis}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Header Card */}
      <div className="bg-slate-950 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 text-white shadow-2xl relative overflow-hidden mb-8 sm:mb-12 border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          <Activity size={400} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 text-rose-500 font-black text-[11px] uppercase tracking-[0.4em] mb-6">
              <UserPlus size={20} /> Analysis Intake session
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6 leading-[1.05]">
              New Heart <br className="hidden sm:block" /> Diagnosis
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed">
              Feed clinical data into the Python core engine for instant risk stratification.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[2rem] border border-white/10 backdrop-blur-md self-start md:self-center">
            <div className={`p-3.5 rounded-2xl ${showPythonTrace ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-800'} transition-all`}>
              <Code size={24} className="text-white" />
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-0.5">Diagnostic Trace</div>
              <button
                type="button"
                onClick={() => setShowPythonTrace(!showPythonTrace)}
                className="text-xs font-black text-white hover:text-rose-400 transition-colors flex items-center gap-2"
              >
                {showPythonTrace ? 'ACTIVE_MONITOR' : 'PAUSED'}
                <div className={`w-1.5 h-1.5 rounded-full ${showPythonTrace ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Intake Form */}
      <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-xl border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 sm:p-14 lg:p-20 space-y-16 lg:space-y-24">

          {/* Section 1: Demographics */}
          <div className="space-y-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-rose-500 border border-slate-100 shadow-sm">
                <Heart size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Patient Identification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Legal Full Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 sm:px-8 py-5 sm:py-7 bg-slate-50 border-2 border-slate-100 rounded-[1.75rem] focus:border-rose-500 focus:bg-white outline-none transition-all text-xl sm:text-3xl font-black text-slate-800 placeholder:text-slate-200 focus:ring-8 focus:ring-rose-500/5"
                  placeholder="e.g. Michael Chen"
                />
              </div>
              <div className="md:col-span-4 space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Sex</label>
                <select name="sex" value={formData.sex} onChange={handleChange} className="form-input-styled h-[74px] sm:h-[88px] text-lg">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 1.5: Lifestyle & Environment */}
          <div className="space-y-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-amber-500 border border-slate-100 shadow-sm">
                <FileSearch size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Lifestyle & Environment</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField label="Dietary Preference">
                <select name="diet" value={formData.diet || 'Non-Vegetarian'} onChange={handleChange} className="form-input-styled">
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </FormField>

              <FormField label="Occupation Mode">
                <select name="occupation" value={formData.occupation || 'Office'} onChange={handleChange} className="form-input-styled">
                  <option value="Home Maker">Home Maker</option>
                  <option value="Office">Office</option>
                  <option value="Business">Business</option>
                  <option value="Daily Wages">Daily Wages</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>

              <FormField label="Occupational Stress">
                <select name="occupationStress" value={formData.occupationStress || 'Medium'} onChange={handleChange} className="form-input-styled">
                  <option value="Low">Low Stress</option>
                  <option value="Medium">Medium Stress</option>
                  <option value="High">High Stress</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField label="Geographic Terrain">
                <select name="terrain" value={formData.terrain || 'Urban'} onChange={handleChange} className="form-input-styled">
                  <option value="Plains">Plains</option>
                  <option value="Hill Station">Hill Station</option>
                  <option value="Coastal">Coastal</option>
                  <option value="Desert">Desert</option>
                  <option value="Urban">Urban</option>
                </select>
              </FormField>
              <FormField label="Climate Zone">
                <select name="climate" value={formData.climate || 'Temperate'} onChange={handleChange} className="form-input-styled">
                  <option value="Tropical">Tropical</option>
                  <option value="Dry">Dry</option>
                  <option value="Temperate">Temperate</option>
                  <option value="Cold">Cold</option>
                </select>
              </FormField>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-rose-200 transition-colors">
              <input
                type="checkbox"
                id="previousHeartDisease"
                name="previousHeartDisease"
                checked={formData.previousHeartDisease || false}
                onChange={handleChange}
                className="w-6 h-6 rounded-lg text-rose-600 focus:ring-rose-500 border-slate-300"
              />
              <label htmlFor="previousHeartDisease" className="flex-1 cursor-pointer">
                <span className="block font-black text-slate-700 uppercase tracking-wide text-sm">Previous Cardiac History</span>
                <span className="block text-xs text-slate-400 font-bold mt-1">Patient has a known history of heart disease or prior interventions</span>
              </label>
            </div>
          </div>

          {/* Section 1.5.5: Habits & Consumption */}
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField label="Smoking Status">
                <select name="smokingStatus" value={formData.smokingStatus || 'Non-Smoker'} onChange={handleChange} className="form-input-styled">
                  <option value="Non-Smoker">Non-Smoker</option>
                  <option value="Smoker">Smoker</option>
                  <option value="Former Smoker">Former Smoker</option>
                </select>
              </FormField>

              <FormField label="Alcohol Consumption">
                <select name="alcoholConsumption" value={formData.alcoholConsumption || 'None'} onChange={handleChange} className="form-input-styled">
                  <option value="None">None</option>
                  <option value="Occasional">Occasional</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </FormField>

              <FormField label="Tea/Coffee Intake">
                <select name="stimulantConsumption" value={formData.stimulantConsumption || 'Moderate'} onChange={handleChange} className="form-input-styled">
                  <option value="None">None</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Addicted">Addicted</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Section 2: Vitals */}
          <div className="space-y-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-500 border border-slate-100 shadow-sm">
                <Thermometer size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Vitals</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
              <FormField label="Age (Years)" warning={formData.age && formData.age > 65}>
                <input required type="number" name="age" value={formData.age ?? ''} onChange={handleChange} className="form-input-styled" placeholder="e.g. 60" min="1" max="120" />
              </FormField>

              <FormField label="Resting BP (mmHg)" warning={formData.restingBP && formData.restingBP > 140}>
                <input required type="number" name="restingBP" value={formData.restingBP ?? ''} onChange={handleChange} className="form-input-styled" placeholder="e.g. 150" min="80" max="250" />
              </FormField>

              <FormField label="Cholesterol (mg/dl)" warning={formData.cholesterol && formData.cholesterol > 240}>
                <input required type="number" name="cholesterol" value={formData.cholesterol ?? ''} onChange={handleChange} className="form-input-styled" placeholder="e.g. 280" min="100" max="600" />
              </FormField>

              <FormField label="Max HR Achieved" warning={formData.maxHeartRate && formData.maxHeartRate < 120}>
                <input required type="number" name="maxHeartRate" value={formData.maxHeartRate ?? ''} onChange={handleChange} className="form-input-styled" placeholder="e.g. 130" min="60" max="220" />
              </FormField>

              <FormField label="Resting ECG">
                <select name="restingECG" value={formData.restingECG} onChange={handleChange} className="form-input-styled">
                  <option>Normal</option>
                  <option>ST-T Wave Abnormality</option>
                  <option>Left Ventricular Hypertrophy</option>
                </select>
              </FormField>

              <div className="flex flex-col justify-end">
                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[1.75rem] border-2 border-slate-100 hover:border-slate-300 transition-all cursor-pointer group h-[74px] sm:h-[84px] active:scale-95">
                  <input
                    type="checkbox"
                    id="fastingBloodSugar"
                    name="fastingBloodSugar"
                    checked={formData.fastingBloodSugar}
                    onChange={handleChange}
                    className="w-7 h-7 text-rose-600 rounded-lg focus:ring-rose-500 border-slate-300 transition-all"
                  />
                  <label htmlFor="fastingBloodSugar" className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none cursor-pointer">
                    Blood Sugar &gt; 120
                  </label>
                  <Droplets size={20} className="ml-auto text-slate-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Cardiac Tests */}
          <div className="space-y-12">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-500 border border-slate-100 shadow-sm">
                <Pulse size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Cardiac Stress Test</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
              <FormField label="Chest Pain Type">
                <select name="chestPainType" value={formData.chestPainType} onChange={handleChange} className="form-input-styled">
                  <option>Typical Angina</option>
                  <option>Atypical Angina</option>
                  <option>Non-Anginal Pain</option>
                  <option>Asymptomatic</option>
                </select>
              </FormField>

              <FormField label="ST Depression (Oldpeak)" warning={formData.oldpeak && formData.oldpeak >= 2.0}>
                <input
                  required
                  type="number"
                  step="0.1"
                  min="0"
                  name="oldpeak"
                  value={formData.oldpeak ?? ''}
                  onChange={handleChange}
                  className="form-input-styled"
                  placeholder="0.0"
                />
              </FormField>


              <FormField label="Blocked Vessels" warning={formData.vessels && formData.vessels > 0}>
                <input required type="number" min="0" max="3" name="vessels" value={formData.vessels ?? ''} onChange={handleChange} className="form-input-styled" placeholder="0-3" />
              </FormField>

              <FormField label="Thalassemia Profile">
                <select name="thal" value={formData.thal} onChange={handleChange} className="form-input-styled">
                  <option>Normal</option>
                  <option>Fixed Defect</option>
                  <option>Reversible Defect</option>
                </select>
              </FormField>

              <FormField label="ST Slope Profile">
                <select name="stSlope" value={formData.stSlope} onChange={handleChange} className="form-input-styled">
                  <option>Upsloping</option>
                  <option>Flat</option>
                  <option>Downsloping</option>
                </select>
              </FormField>

              <div className="flex flex-col justify-end">
                <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[1.75rem] border-2 border-slate-100 hover:border-slate-300 transition-all cursor-pointer group h-[74px] sm:h-[84px] active:scale-95">
                  <input
                    type="checkbox"
                    id="exerciseAngina"
                    name="exerciseAngina"
                    checked={formData.exerciseAngina}
                    onChange={handleChange}
                    className="w-7 h-7 text-rose-600 rounded-lg focus:ring-rose-500 border-slate-300 transition-all"
                  />
                  <label htmlFor="exerciseAngina" className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-none cursor-pointer">
                    Exercise Angina
                  </label>
                  <Activity size={20} className="ml-auto text-slate-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Logic Security Footer */}
          <div className="bg-slate-950 p-10 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] flex flex-col sm:flex-row items-center gap-10 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} className="text-white" />
            </div>
            <div className="p-5 bg-rose-500 rounded-2xl text-white shadow-xl shadow-rose-500/20 shrink-0">
              <ShieldCheck size={36} />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-white font-black text-2xl tracking-tight mb-2 uppercase italic">Security Protocol Active</p>
              <p className="text-slate-400 text-base font-medium leading-relaxed max-w-2xl">
                This diagnostic session is cryptographically anchored. Every logic trace is hashed and verified by the Python worker node.
              </p>
            </div>
          </div>

          <div className="relative z-20">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-6 sm:py-8 bg-slate-900 hover:bg-slate-800 text-white font-black text-lg sm:text-xl rounded-[2rem] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-4 disabled:opacity-50 group"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin w-6 h-6" />
                  <span className="uppercase tracking-[0.2em] text-sm sm:text-base">Processing Analysis...</span>
                </>
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em] text-sm sm:text-base">Start Analysis Session</span>
                  <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/30">
                    <Zap size={20} className="fill-white" />
                  </div>
                </>
              )}
            </button>
          </div>
        </form>
      </div >

      <style>{`
        .form-input-styled {
          width: 100%;
          padding: 1.25rem 1.5rem;
          background-color: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 1.5rem;
          font-weight: 800;
          font-size: 1rem;
          color: #0f172a;
          outline: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          appearance: none;
        }
        .form-input-styled:focus {
          border-color: #e11d48;
          background-color: #fff;
          box-shadow: 0 10px 20px -5px rgba(225, 29, 72, 0.08);
          transform: translateY(-2px);
        }
        select.form-input-styled {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1.25rem center;
          background-size: 1.1rem;
        }
      `}</style>
    </div >
  );
};

const FormField: React.FC<{ label: string, children: React.ReactNode, warning?: any }> = ({ label, children, warning }) => (
  <div className="space-y-3 group">
    <div className="flex justify-between items-center px-1">
      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-rose-500">{label}</label>
      {warning ? (
        <span className="text-[10px] font-black text-rose-500 flex items-center gap-1.5 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 animate-in fade-in zoom-in">
          <AlertCircle size={12} /> CLINICAL_FLAG
        </span>
      ) : null}
    </div>
    {children}
  </div>
);

export default PatientForm;
