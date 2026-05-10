
import { PatientData, PredictionResult } from '../types';

export interface PythonTrace {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'DEBUG' | 'ERROR';
  message: string;
}

/**
 * SIMULATED PYTHON EXECUTION KERNEL
 * Mimics the internal logic of a Scikit-Learn pipeline processing clinical data.
 */
export function generatePythonTrace(data: PatientData, prediction: PredictionResult): PythonTrace[] {
  const trace: PythonTrace[] = [];
  const ts = () => new Date().toISOString().split('T')[1].split('Z')[0];

  trace.push({ timestamp: ts(), level: 'INFO', message: 'Initializing HeartGuardian Python Environment (v2.5.4)...' });
  trace.push({ timestamp: ts(), level: 'INFO', message: 'Importing clinical_ml_core.models.RandomForestClassifier...' });
  trace.push({ timestamp: ts(), level: 'DEBUG', message: `Raw Input Payload received: ${JSON.stringify(data)}` });
  
  // Simulation of Data Cleaning/Preprocessing
  trace.push({ timestamp: ts(), level: 'INFO', message: 'Pandas: Creating DataFrame from input dictionary...' });
  trace.push({ timestamp: ts(), level: 'INFO', message: 'Preprocessing: Scaling numeric features [age, restbps, chol, thalach, oldpeak]...' });
  
  if (data.cholesterol > 240) {
    trace.push({ timestamp: ts(), level: 'WARNING', message: `Outlier detected: cholesterol (${data.cholesterol}) exceeds standard deviation thresholds.` });
  }

  // Logic Trace
  trace.push({ timestamp: ts(), level: 'DEBUG', message: `Feature mapping complete. Shape: (1, 13)` });
  trace.push({ timestamp: ts(), level: 'INFO', message: 'Executing model.predict_proba(X)...' });
  
  // Weight Analysis
  trace.push({ timestamp: ts(), level: 'DEBUG', message: `Decision Path Trace: Node 4 -> Node 12 (CA=${data.vessels}) -> Leaf 42` });
  
  if (prediction.isSafetyOverride) {
    trace.push({ timestamp: ts(), level: 'WARNING', message: 'CRITICAL: Safety Logic Override triggered. Bypassing ML proba with clinical ground-truth rules.' });
  }

  trace.push({ timestamp: ts(), level: 'INFO', message: `Prediction Success. Probability: ${prediction.probability}%. Class: ${prediction.riskLevel}` });
  trace.push({ timestamp: ts(), level: 'INFO', message: 'Python process terminated with exit code 0.' });

  return trace;
}
