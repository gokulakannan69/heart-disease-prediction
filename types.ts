
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface User {
  id: string;
  name: string;
  email: string;
  licenseId: string;
  specialization: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface FeatureImportance {
  feature: string;
  impact: number; // 0 to 100
}

export interface PythonTraceEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'DEBUG' | 'ERROR';
  message: string;
}

export interface PatientData {
  age: number;
  sex: 'Male' | 'Female';
  restingBP: number; // trestbps
  cholesterol: number; // chol
  fastingBloodSugar: boolean; // fbs > 120 mg/dl
  restingECG: 'Normal' | 'ST-T Wave Abnormality' | 'Left Ventricular Hypertrophy';
  maxHeartRate: number; // thalach
  chestPainType: 'Typical Angina' | 'Atypical Angina' | 'Non-Anginal Pain' | 'Asymptomatic';
  exerciseAngina: boolean; // exang
  oldpeak: number; // ST depression
  stSlope: 'Upsloping' | 'Flat' | 'Downsloping';
  vessels: number; // Number of major vessels (0-3)
  thal: 'Normal' | 'Fixed Defect' | 'Reversible Defect';

  // New Analysis Fields
  diet?: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Mixed';
  occupation?: 'Home Maker' | 'Office' | 'Business' | 'Daily Wages' | 'Other';
  occupationStress?: 'Low' | 'Medium' | 'High';
  previousHeartDisease?: boolean;
  terrain?: 'Plains' | 'Hill Station' | 'Coastal' | 'Desert' | 'Urban';
  climate?: 'Tropical' | 'Dry' | 'Temperate' | 'Cold';

  // Habits
  smokingStatus?: 'Non-Smoker' | 'Smoker' | 'Former Smoker';
  alcoholConsumption?: 'None' | 'Occasional' | 'Moderate' | 'Heavy';
  stimulantConsumption?: 'None' | 'Moderate' | 'High' | 'Addicted'; // Tea/Coffee etc.
}

export interface PredictionResult {
  riskLevel: RiskLevel;
  probability: number;
  explanation: string[];
  guidance: string;
  isSafetyOverride: boolean;
  featureImportance: FeatureImportance[];
  pythonTrace: PythonTraceEntry[];
  homeRemedies?: string[];
  hospitalRemedies?: string[];
  mainCauses?: string[];
  possibleEffects?: string[];
  aiAnalysis?: {
    riskLevel: RiskLevel;
    confidence: number;
    reasoning: string[];
  };
  conflictResolution?: {
    resolvedRisk: RiskLevel;
    consensusConfidence: number;
    arbitrationNotes: string[];
  };
}

export interface MedicalReport {
  id: string;
  patientName: string;
  timestamp: number;
  data: PatientData;
  prediction: PredictionResult;
  version: number;
}

export interface Block {
  index: number;
  timestamp: number;
  reportId: string;
  reportHash: string;
  previousHash: string;
  hash: string;
  version: number;
}

export type Blockchain = Block[];
