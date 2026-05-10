---
description: Run a quick heart disease analysis with preset blood pressure
---

# Quick Analysis Workflow

This workflow helps you quickly run a heart disease prediction analysis with specific blood pressure values.

## Steps

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to the New Analysis page**:
   - Click on "New Analysis" in the sidebar, OR
   - Navigate directly to: http://localhost:5173/#/new-analysis

3. **Fill in the patient form** with your desired values:
   
   For a **High Risk** case with BP 150/95:
   - **Patient Name**: Test Patient (or any name)
   - **Age**: 55-65 (higher age = higher risk)
   - **Sex**: Male (males typically have higher risk)
   - **Resting BP**: **150** mmHg
   - **Cholesterol**: 250-300 mg/dL (elevated)
   - **Fasting Blood Sugar**: >120 mg/dL (Yes)
   - **Resting ECG**: ST-T Wave Abnormality or LV Hypertrophy
   - **Max Heart Rate**: 120-140 (lower for age)
   - **Chest Pain Type**: Asymptomatic or Typical Angina
   - **Exercise Angina**: Yes
   - **ST Depression (oldpeak)**: 2.0-3.5
   - **ST Slope**: Flat or Downsloping
   - **Major Vessels**: 2-3
   - **Thalassemia**: Reversible Defect or Fixed Defect

4. **Submit the analysis**:
   - Click "Begin Analysis" button
   - Wait for ML + AI prediction to complete
   - Results will be stored in the blockchain and displayed

5. **View the results**:
   - Check the report card for risk assessment
   - Review ML probability vs AI confidence
   - See calibrated probability (consensus)
   - Review remedies and recommendations

## Blood Pressure Preset Configurations

### 1️⃣ Normal BP: 120/80 (Optimal - Low Risk)
```
Patient Name: Normal BP 120/80
Age: 35 | Sex: Female
Resting BP: 120 (systolic from 120/80)
Cholesterol: 180 | Max HR: 170
Fasting Blood Sugar: No
Resting ECG: Normal
Chest Pain: Non-Anginal Pain
Exercise Angina: No
ST Depression: 0.5 | ST Slope: Upsloping
Blocked Vessels: 0 | Thalassemia: Normal
```

### 2️⃣ Elevated BP: 130/85 (Borderline - Low-Medium Risk)
```
Patient Name: Elevated BP 130/85
Age: 45 | Sex: Male
Resting BP: 130
Cholesterol: 200 | Max HR: 160
Fasting Blood Sugar: No
Resting ECG: Normal
Chest Pain: Non-Anginal Pain
Exercise Angina: No
ST Depression: 1.0 | ST Slope: Upsloping
Blocked Vessels: 0 | Thalassemia: Normal
```

### 3️⃣ Stage 1 Hypertension: 140/90 (Medium Risk)
```
Patient Name: Stage 1 HTN 140/90
Age: 50 | Sex: Male
Resting BP: 140
Cholesterol: 220 | Max HR: 145
Fasting Blood Sugar: No
Resting ECG: ST-T Wave Abnormality
Chest Pain: Atypical Angina
Exercise Angina: No
ST Depression: 1.5 | ST Slope: Flat
Blocked Vessels: 1 | Thalassemia: Normal
```

### 4️⃣ Stage 2 Hypertension: 150/95 (High Risk) ⚠️
```
Patient Name: Stage 2 HTN 150/95
Age: 60 | Sex: Male
Resting BP: 150
Cholesterol: 280 | Max HR: 130
Fasting Blood Sugar: Yes ✓
Resting ECG: Left Ventricular Hypertrophy
Chest Pain: Asymptomatic
Exercise Angina: Yes ✓
ST Depression: 3.0 | ST Slope: Flat
Blocked Vessels: 2 | Thalassemia: Reversible Defect
```

### 5️⃣ Severe Hypertension: 160/100 (Very High Risk) 🚨
```
Patient Name: Severe HTN 160/100
Age: 65 | Sex: Male
Resting BP: 160
Cholesterol: 300 | Max HR: 120
Fasting Blood Sugar: Yes ✓
Resting ECG: Left Ventricular Hypertrophy
Chest Pain: Asymptomatic
Exercise Angina: Yes ✓
ST Depression: 3.5 | ST Slope: Downsloping
Blocked Vessels: 3 | Thalassemia: Fixed Defect
```

### 6️⃣ Hypertensive Crisis: 180/110 (Critical Risk) 🆘
```
Patient Name: Crisis HTN 180/110
Age: 70 | Sex: Male
Resting BP: 180
Cholesterol: 320 | Max HR: 110
Fasting Blood Sugar: Yes ✓
Resting ECG: Left Ventricular Hypertrophy
Chest Pain: Typical Angina
Exercise Angina: Yes ✓
ST Depression: 4.0 | ST Slope: Downsloping
Blocked Vessels: 3 | Thalassemia: Fixed Defect
```

---

## 📋 Quick Reference Table

| BP Reading | Category | Risk Level | Preset # |
|------------|----------|------------|----------|
| **120/80** | Normal | Low ✅ | #1 |
| **130/85** | Elevated | Low-Medium ⚡ | #2 |
| **140/90** | Stage 1 HTN | Medium ⚠️ | #3 |
| **150/95** | Stage 2 HTN | High 🔴 | #4 |
| **160/100** | Severe HTN | Very High 🚨 | #5 |
| **180/110** | Crisis HTN | Critical 🆘 | #6 |

## Notes

- The systolic BP (150 in 150/95) is entered in the "Resting BP" field
- Diastolic BP (95) is not directly used in the model but indicates hypertension
- BP 150/95 is Stage 2 Hypertension according to AHA guidelines
- The AI will provide personalized remedies based on all risk factors
- All analyses are stored immutably in the blockchain
