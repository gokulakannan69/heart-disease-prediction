
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvFilePath = path.join(__dirname, '../csv file/heart.csv');
const outputFilePath = path.join(__dirname, '../src/data/heart_cases.json');

// Ensure output directory exists
const outputDir = path.dirname(outputFilePath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function mapCP(val) {
    // cp: chest pain type
    // Value 0: typical angina
    // Value 1: atypical angina
    // Value 2: non-anginal pain
    // Value 3: asymptomatic
    const v = parseInt(val);
    if (v === 0) return 'Typical Angina';
    if (v === 1) return 'Atypical Angina';
    if (v === 2) return 'Non-Anginal Pain';
    if (v === 3) return 'Asymptomatic';
    return 'Typical Angina';
}

function mapRestECG(val) {
    // restecg: resting electrocardiographic results
    // Value 0: normal
    // Value 1: having ST-T wave abnormality
    // Value 2: showing probable or definitive left ventricular hypertrophy
    const v = parseInt(val);
    if (v === 0) return 'Normal';
    if (v === 1) return 'ST-T Wave Abnormality';
    if (v === 2) return 'Left Ventricular Hypertrophy';
    return 'Normal';
}

function mapSlope(val) {
    // slope: the slope of the peak exercise ST segment
    // Value 0: upsloping
    // Value 1: flat
    // Value 2: downsloping
    const v = parseInt(val);
    if (v === 0) return 'Upsloping';
    if (v === 1) return 'Flat';
    if (v === 2) return 'Downsloping';
    return 'Flat';
}

function mapThal(val) {
    // thal: 1 = fixed defect; 2 = normal; 3 = reversable defect
    // Note: dataset 0 often maps to null or treated as Normal in some cleanups, 
    // but looking at logic often 2 is Normal. 
    // Let's assume:
    // 0, 2 -> Normal
    // 1 -> Fixed Defect
    // 3 -> Reversible Defect
    const v = parseInt(val);
    if (v === 1) return 'Fixed Defect';
    if (v === 3) return 'Reversible Defect';
    return 'Normal';
}

fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading CSV:", err);
        return;
    }

    const lines = data.split('\n').filter(l => l.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());

    // Index map
    const idx = {};
    headers.forEach((h, i) => idx[h] = i);

    const maleNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Rohan', 'Ishaan', 'Rahul', 'Vikram', 'Suresh', 'Ramesh', 'Amit', 'Rajesh', 'Sanjay', 'Manish', 'Deepak'];
    const femaleNames = ['Aadya', 'Diya', 'Saanvi', 'Ananya', 'Priya', 'Neha', 'Sneha', 'Pooja', 'Anjali', 'Meera', 'Sunita', 'Rekha', 'Anita', 'Kavita', 'Geeta'];

    const cases = lines.slice(1).map((line, index) => {
        const cols = line.split(',');
        if (cols.length < headers.length) return null;

        const isMale = parseInt(cols[idx['sex']]) === 1;
        const nameList = isMale ? maleNames : femaleNames;
        const randomName = nameList[Math.floor(Math.random() * nameList.length)] + " " + ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Nair"].sort(() => 0.5 - Math.random())[0];

        const p = {
            age: parseFloat(cols[idx['age']]),
            sex: isMale ? 'Male' : 'Female',
            restingBP: parseFloat(cols[idx['trestbps']]), // trestbps
            cholesterol: parseFloat(cols[idx['chol']]),
            fastingBloodSugar: parseInt(cols[idx['fbs']]) === 1,
            restingECG: mapRestECG(cols[idx['restecg']]),
            maxHeartRate: parseFloat(cols[idx['thalach']]),
            chestPainType: mapCP(cols[idx['cp']]),
            exerciseAngina: parseInt(cols[idx['exang']]) === 1,
            oldpeak: parseFloat(cols[idx['oldpeak']]),
            stSlope: mapSlope(cols[idx['slope']]),
            vessels: parseInt(cols[idx['ca']]),
            thal: mapThal(cols[idx['thal']])
        };

        return {
            id: `CSV-${1000 + index}`,
            name: randomName,
            originalDiagnosis: parseInt(cols[idx['target']]) === 1 ? "Heart Disease Detected" : "No Disease",
            age: p.age,
            pageReference: `Dataset Row ${index + 2}`,
            summary: `Imported clinical data. Target: ${parseInt(cols[idx['target']])}`,
            clinicalFindings: [`Max HR: ${p.maxHeartRate}`, `ST Depression: ${p.oldpeak}`],
            data: {
                ...p,
                diet: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Mixed'][Math.floor(Math.random() * 4)],
                occupation: ['Home Maker', 'Office', 'Business', 'Daily Wages', 'Other'][Math.floor(Math.random() * 5)],
                occupationStress: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                previousHeartDisease: Math.random() < 0.1, // 10% chance
                terrain: ['Plains', 'Hill Station', 'Coastal', 'Desert', 'Urban'][Math.floor(Math.random() * 5)],
                climate: ['Tropical', 'Dry', 'Temperate', 'Cold'][Math.floor(Math.random() * 4)],
                smokingStatus: ['Non-Smoker', 'Smoker', 'Former Smoker'][Math.floor(Math.random() * 3)],
                alcoholConsumption: ['None', 'Occasional', 'Moderate', 'Heavy'][Math.floor(Math.random() * 4)],
                stimulantConsumption: ['None', 'Moderate', 'High', 'Addicted'][Math.floor(Math.random() * 4)]
            }
        };
    }).filter(c => c !== null);

    fs.writeFile(outputFilePath, JSON.stringify(cases, null, 2), (err) => {
        if (err) console.error("Error writing JSON:", err);
        else console.log(`Successfully converted ${cases.length} records to ${outputFilePath}`);
    });
});
