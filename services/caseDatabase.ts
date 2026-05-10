
import { PatientData } from '../types';
import heartCases from '../src/data/heart_cases.json';

export interface PDFCase {
  id: string;
  name: string;
  age: number;
  originalDiagnosis: string;
  pageReference: string;
  data: PatientData;
  summary: string;
  clinicalFindings: string[];
}

export const PDF_CASE_LIBRARY: PDFCase[] = [
  {
    id: "CASE-124",
    name: "Suresh",
    age: 50,
    originalDiagnosis: "Myocardial Infarction",
    pageReference: "Pg 124",
    summary: "Acute retrosternal radiating chest pain with ST elevation.",
    clinicalFindings: ["ECG: Anteroseptal ST elevation", "Symptoms: Sudden excessive sweating, vomiting", "Risk: Acute Coronary Syndrome"],
    data: {
      age: 50,
      sex: 'Male',
      restingBP: 145,
      cholesterol: 260,
      fastingBloodSugar: false,
      restingECG: 'ST-T Wave Abnormality',
      maxHeartRate: 140,
      chestPainType: 'Typical Angina',
      exerciseAngina: true,
      oldpeak: 3.5,
      stSlope: 'Downsloping',
      vessels: 1,
      thal: 'Reversible Defect'
    }
  },
  {
    id: "CASE-130",
    name: "Samarth",
    age: 60,
    originalDiagnosis: "Valvular Heart Disease",
    pageReference: "Pg 130",
    summary: "Progressive breathlessness over 1 year, raised JVP.",
    clinicalFindings: ["Echo: Aortic valve calcification", "S4 Heart Sound present", "BP: 150/92 mmHg"],
    data: {
      age: 60,
      sex: 'Male',
      restingBP: 152,
      cholesterol: 210,
      fastingBloodSugar: true,
      restingECG: 'Left Ventricular Hypertrophy',
      maxHeartRate: 110,
      chestPainType: 'Asymptomatic',
      exerciseAngina: false,
      oldpeak: 1.2,
      stSlope: 'Flat',
      vessels: 2,
      thal: 'Fixed Defect'
    }
  },
  {
    id: "CASE-86",
    name: "Ramesh Verma",
    age: 70,
    originalDiagnosis: "Chronic Bronchitis",
    pageReference: "Pg 86",
    summary: "Long-term difficulty in breathing, chronic productive cough.",
    clinicalFindings: ["BP: 138/89 mmHg", "Respiratory Rate: 26 (Tachypnea)", "Auscultation: Cracked rhonchi"],
    data: {
      age: 70,
      sex: 'Male',
      restingBP: 138,
      cholesterol: 235,
      fastingBloodSugar: false,
      restingECG: 'Normal',
      maxHeartRate: 125,
      chestPainType: 'Non-Anginal Pain',
      exerciseAngina: false,
      oldpeak: 0.8,
      stSlope: 'Flat',
      vessels: 0,
      thal: 'Normal'
    }
  },
  {
    id: "CASE-140",
    name: "Sultaan Sheth",
    age: 66,
    originalDiagnosis: "Peripheral Arterial Disease",
    pageReference: "Pg 140",
    summary: "Calf pain and ulceration. Smoker (2 packs/day) for 40 years.",
    clinicalFindings: ["Doppler: Popliteal artery obstruction", "Peripheral Pulses: Absent in right leg", "BP: 130/80 mmHg"],
    data: {
      age: 66,
      sex: 'Male',
      restingBP: 130,
      cholesterol: 285,
      fastingBloodSugar: true,
      restingECG: 'ST-T Wave Abnormality',
      maxHeartRate: 130,
      chestPainType: 'Atypical Angina',
      exerciseAngina: true,
      oldpeak: 1.5,
      stSlope: 'Flat',
      vessels: 3,
      thal: 'Reversible Defect'
    }
  }
];

// Merge manual cases with imported CSV cases
// We cast the imported data to ensures types match, though our script should have handled it.
export const ALL_CASES = [...PDF_CASE_LIBRARY, ...(heartCases as unknown as PDFCase[])];

export function findSimilarCases(input: PatientData, limit: number = 3): PDFCase[] {
  // Simple Euclidean distance on normalized key features
  // Features: Age (0-100), BP (90-200), Cholesterol (100-600), MaxHR (60-220)

  const normalize = (val: number, min: number, max: number) => Math.min(Math.max((val - min) / (max - min), 0), 1);

  return ALL_CASES
    .map(c => {
      const p = c.data;

      // Calculate individual feature distances
      const dAge = Math.abs(normalize(p.age, 30, 90) - normalize(input.age, 30, 90));
      const dBP = Math.abs(normalize(p.restingBP, 90, 200) - normalize(input.restingBP, 90, 200));
      const dChol = Math.abs(normalize(p.cholesterol, 120, 560) - normalize(input.cholesterol, 120, 560));
      const dHR = Math.abs(normalize(p.maxHeartRate, 70, 210) - normalize(input.maxHeartRate, 70, 210));

      // Categorical matches (Binary distance)
      const dSex = p.sex === input.sex ? 0 : 1;
      const dCP = p.chestPainType === input.chestPainType ? 0 : 1;
      const dExAng = p.exerciseAngina === input.exerciseAngina ? 0 : 1;

      // Weighted Total Distance
      // High weight on basic demographics and chest pain type
      const totalDist =
        (dAge * 1.5) +
        (dBP * 1.0) +
        (dChol * 0.8) +
        (dHR * 1.0) +
        (dSex * 2.0) +
        (dCP * 3.0) +
        (dExAng * 1.5);

      return { case: c, dist: totalDist };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map(match => match.case);
}
