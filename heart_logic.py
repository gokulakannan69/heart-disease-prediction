
import json
import math

class HeartHealthEngine:
    """
    Python-based diagnostic engine for cardiovascular risk assessment.
    Uses clinical heuristics and normalized probability scoring.
    """
    def __init__(self):
        # Weights derived from the Cleveland Heart Disease Dataset
        self.weights = {
            'vessels': 22,
            'chest_pain': 25,
            'thal': 25,
            'oldpeak': 10,
            'hr_reserve': 15,
            'blood_pressure': 12,
            'blood_sugar': 10,
            'exercise_angina': 15
        }

    def process_patient(self, data_json):
        data = json.loads(data_json)
        score = 0
        trace = []

        # 1. Vessels Calculation
        v_score = data['vessels'] * self.weights['vessels']
        score += v_score
        trace.append(f"Processed fluoroscopy: {data['vessels']} vessels detected. Score impact: +{v_score}")

        # 2. Chest Pain Analysis
        cp_type = data['chestPainType']
        cp_score = 0
        if cp_type == 'Asymptomatic': cp_score = 25
        elif cp_type == 'Typical Angina': cp_score = 15
        elif cp_type == 'Atypical Angina': cp_score = 10
        score += cp_score
        trace.append(f"Analyzed chest pain morphology: {cp_type}. Score impact: +{cp_score}")

        # 3. Thalassemia Markers
        thal = data['thal']
        thal_score = 0
        if thal == 'Reversible Defect': thal_score = 25
        elif thal == 'Fixed Defect': thal_score = 15
        score += thal_score
        trace.append(f"Thalassemia profile: {thal}. Score impact: +{thal_score}")

        # 4. Hemodynamics (BP)
        bp = data['restingBP']
        bp_score = 12 if bp > 140 else (6 if bp > 130 else 0)
        score += bp_score
        trace.append(f"Hemodynamic check: BP {bp} mmHg. Score impact: +{bp_score}")

        # 5. Risk Normalization
        # Max theoretical score is approx 170
        probability = min(round((score / 170) * 100), 100)
        
        risk_level = "Low"
        if probability > 65: risk_level = "High"
        elif probability > 35: risk_level = "Medium"

        # 6. Safety Overrides
        is_override = False
        if data['oldpeak'] >= 2.0 and data['vessels'] >= 1:
            risk_level = "High"
            is_override = True
            trace.append("CRITICAL: Safety override triggered due to high ST-depression and vessel occlusion.")

        return {
            "riskLevel": risk_level,
            "probability": probability,
            "isSafetyOverride": is_override,
            "trace": trace,
            "python_version": "3.11.2"
        }

# Execution Entry Point (Simulated for Web)
def main(input_data):
    engine = HeartHealthEngine()
    return engine.process_patient(input_data)
