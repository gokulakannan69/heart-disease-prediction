import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { PatientData, PredictionResult } from "../types";
import { PDFCase } from "./caseDatabase";

// Initialize the client using the API key from Vite env
// @ts-ignore
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
console.log("Gemini Service Initialized. API Key present:", !!apiKey, "Length:", apiKey.length, "First char:", apiKey ? apiKey[0] : 'N/A');
const genAI = new GoogleGenerativeAI(apiKey);

export async function getEnhancedExplanation(
  data: PatientData,
  prediction: PredictionResult,
  similarCases: PDFCase[] = []
): Promise<{
  explanation: string[];
  guidance: string;
  homeRemedies?: string[];
  hospitalRemedies?: string[];
  mainCauses?: string[];
  possibleEffects?: string[];
  aiAnalysis?: { riskLevel: import("../types").RiskLevel; confidence: number; reasoning: string[] }
}> {
  try {
    if (!apiKey) {
      console.warn("Missing VITE_GEMINI_API_KEY");
      throw new Error("Missing API Key");
    }

    // Configure the model
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest", // Confirmed working model for this key
      generationConfig: {
        temperature: 0.0, // Force deterministic output
        topP: 0.1,
        topK: 1,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            explanation: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Bullet points explaining the specific clinical risks."
            },
            home_remedies: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Lifestyle and home interventions."
            },
            hospital_remedies: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Clinical and hospital interventions."
            },
            main_causes: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "List of main causes for the predicted risk (simple language)."
            },
            possible_effects: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Possible health effects if untreated (simple language)."
            },
            guidance: {
              type: SchemaType.STRING,
              description: "One prioritized clinical action for the doctor."
            },
            ai_risk_level: {
              type: SchemaType.STRING,
              format: "enum",
              enum: ["Low", "Medium", "High"],
              description: "Your independent assessment of the risk level."
            },
            ai_confidence: {
              type: SchemaType.NUMBER,
              description: "Confidence in your assessment (0-100)."
            },
            ai_reasoning: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Why you chose this risk level (independent of ML)."
            }
          },
          required: ["explanation", "guidance", "home_remedies", "hospital_remedies", "main_causes", "possible_effects", "ai_risk_level", "ai_confidence", "ai_reasoning"]
        }
      }
    });

    console.log("Calling Gemini API with model: gemini-flash-latest");


    const prompt = `
      Analyze this cardiovascular clinical profile for an INDIAN HEALTHCARE SCREENING CONTEXT.
      
      Patient Metrics: ${JSON.stringify(data)}
      ML Screening Risk: ${prediction.riskLevel} (${prediction.probability}% confidence).

      CONTEXT FROM SIMILAR HISTORICAL CASES:
      ${similarCases.map(c => `- Patient Age ${c.age}, ${c.data.chestPainType}, BP ${c.data.restingBP}. Diagnosis: ${c.originalDiagnosis}.`).join('\n')}

      INDIAN HEALTHCARE FACTORS (Consider deeply):
      - Diet High in Carbs/Oils: Common in Indian diets (e.g., fried snacks, sweets). Adjust advice to "Reduce oil/ghee/sugar".
      - Late Diagnosis: Patients often ignore early symptoms (gastric confusion). Emphasize "Early checkup".
      - Stress: Urban Indian work culture (Long hours).
      - Diabetes: India is the diabetes capital - consider this implicit risk.
      - Habits:
          - Smoking/Tobacco: Beedi/Cigarettes - Strong cessation advice.
          - Alcohol: "Limit intake" advice.

      CARE GUIDANCE RULES (STRICTLY FOLLOW THIS):
      - Low Risk -> "Home care & lifestyle monitoring. Diet control (Less Oil/Salt)."
      - Medium Risk -> "Consult General Physician or Cardiologist for a checkup."
      - High Risk -> "IMMEDIATE Hospital/Specialist Evaluation required."

      OUTPUT REQUIREMENTS:
      - "explanation": 4-5 "Screening Observations" (Not Diagnosis). Use simple language.
      - "main_causes": 3-4 bullet points on MAIN CAUSES. Use SIMPLE, NON-TECHNICAL language (e.g., "High BP", "Cholesterol", "Stress", "Lifestyle").
      - "possible_effects": 3-4 bullet points on POSSIBLE EFFECTS IF UNTREATED (e.g., "Heart strain", "Attack risk").
      - "home_remedies": 3-4 specific Indian lifestyle/home remedies (e.g., "Yoga", "Walk 30 mins", "Low oil diet", "Stress reduction").
      - "hospital_remedies": 3-4 clinical/pharmaceutical interventions (Screening specific).
      - "guidance": One clear Action Suggestion based on the CARE GUIDANCE RULES above.
      - "ai_risk_level": Your independent assessment (Low/Medium/High).
      - "ai_confidence": Your confidence (Capture around ~70-80% typical for screening).
      - "ai_reasoning": Reasons for your assessment.
      - DISCLAIMER: Explicitly mention "This is a computer screening, not a doctor's diagnosis."
      - Do NOT mention "AI" or "ML" in the explanation text itself. Use "The System" or "Screening Analysis".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check if response is blocked or empty
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error("Gemini API Error: No candidates returned. Safety block?", response.promptFeedback);
      throw new Error("AI Analysis Blocked or Empty");
    }

    const jsonStr = response.text();
    console.log("Gemini Raw Response:", jsonStr.substring(0, 200) + "..."); // Log first 200 chars for debug

    // Parse the JSON response
    let parsed;
    try {
      // Sanitize: sometimes models wrap JSON in markdown blocks like ```json ... ```
      const cleanJson = jsonStr.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Gemini API returned invalid JSON:", jsonStr);
      throw new Error(`Invalid JSON from AI. Raw: ${jsonStr.substring(0, 50)}...`);
    }

    // Validate required fields
    if (!parsed.ai_risk_level) {
      console.warn("Missing ai_risk_level in response");
    }

    return {
      explanation: parsed.explanation,
      guidance: parsed.guidance,
      homeRemedies: parsed.home_remedies || [],
      hospitalRemedies: parsed.hospital_remedies || [],
      mainCauses: parsed.main_causes || [],
      possibleEffects: parsed.possible_effects || [],
      aiAnalysis: {
        riskLevel: parsed.ai_risk_level as import("../types").RiskLevel,
        confidence: parsed.ai_confidence,
        reasoning: parsed.ai_reasoning || []
      }
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback
    return {
      explanation: prediction.explanation && prediction.explanation.length > 0
        ? prediction.explanation
        : ["AI Assessment Unavailable", "Using Standard Clinical Protocols"],
      guidance: prediction.guidance || "Proceed with standard diagnostic workup.",
      homeRemedies: ["Standard Lifestyle Guidelines"],
      hospitalRemedies: ["Standard Clinical Protocols"],
      aiAnalysis: {
        riskLevel: prediction.riskLevel,
        confidence: prediction.probability,
        reasoning: ["AI Unreachable", "Fallback to ML Model"]
      }
    };
  }
}

export async function resolveConflict(
  data: PatientData,
  prediction: PredictionResult
): Promise<{ resolvedRisk: import("../types").RiskLevel; consensusConfidence: number; arbitrationNotes: string[] }> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.0, // Force deterministic output
        topP: 0.1,
        topK: 1,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            final_risk: { type: SchemaType.STRING, format: "enum", enum: ["Low", "Medium", "High"] },
            confidence: { type: SchemaType.NUMBER },
            arbitration_notes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
          },
          required: ["final_risk", "confidence", "arbitration_notes"]
        }
      }
    });

    const prompt = `
      ACT AS A SCREENING CALIBRATION ENGINE FOR INDIAN HEALTHCARE.
      COMBINE THESE TWO INPUTS INTO ONE FINAL "SCREENING RESULT".

      Patient Data: ${JSON.stringify(data)}

      Logic Engine (ML): Risk ${prediction.riskLevel} (Probability: ${prediction.probability}%)
      Clinical Reasoner (AI): Risk ${prediction.aiAnalysis?.riskLevel} (Confidence: ${prediction.aiAnalysis?.confidence}%)

      CALIBRATION RULE (STRICT):
      - Final Risk = MAX(Logic Engine Risk, Clinical Reasoner Risk).
      - i.e., If ML is High and AI is Medium -> Final is HIGH.
      - i.e., If ML is Low and AI is High -> Final is HIGH.
      - Safest approach for screening is to not miss cases (High Sensitivity).

      OUTPUT JSON:
      - final_risk: The definitive risk level (Low / Medium / High).
      - confidence: A single "Screening Confidence" (0-100). typically average of both, but if High risk, lean towards higher confidence.
      - arbitration_notes: 3 bullet points explaining the decision (e.g., "ML detected physiological markers", "AI identified lifestyle risks").
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text();

    console.log("Gemini Conflict Resolution Raw:", jsonStr.substring(0, 100) + "...");

    let parsed;
    try {
      const cleanJson = jsonStr.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Gemini Conflict Resolution Error:", jsonStr);
      throw new Error("Invalid JSON from AI Conflict Resolution");
    }

    return {
      resolvedRisk: parsed.final_risk as import("../types").RiskLevel,
      consensusConfidence: parsed.confidence,
      arbitrationNotes: parsed.arbitration_notes
    };
  } catch (err) {
    console.error("Arbitration failed", err);
    return {
      resolvedRisk: prediction.riskLevel,
      consensusConfidence: prediction.probability,
      arbitrationNotes: ["Arbitration Failed", "Defaulting to Standard ML"]
    };
  }
}

