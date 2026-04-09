import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export type SituationType = "Accident" | "Harassment" | "Lost Mobile" | "Suspicious Person" | "Medical Emergency" | "General Safety" | "Safe";

export interface SafetyAnalysis {
  riskLevel: RiskLevel;
  riskScore: number;
  emotion: string;
  situationType: SituationType;
  isNightRisk: boolean;
  reasoning: string;
  context: string;
  escapeDirection: string;
  nearestCrowdedArea: string;
  alertMessagePreview: string;
}

export async function analyzeSafety(message: string, language: string = "English"): Promise<SafetyAnalysis> {
  const lowerMessage = message.toLowerCase();
  const mentionsNight = lowerMessage.includes("night") || lowerMessage.includes("dark") || lowerMessage.includes("alone");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following user message for personal safety risks in ${language}. 
    Classify it into LOW, MEDIUM, or HIGH risk.
    Identify the situation type: Accident, Harassment, Lost Mobile, Suspicious Person, Medical Emergency, or General Safety.
    Detect emotion (Fear, Anxiety, Panic, Calm) and assign a Risk Score (0-100%).
    Provide a specific escape direction (e.g., "Turn left towards the main road") and the nearest crowded area suggestion.
    Generate a preview of an emergency SMS that would be sent to contacts.
    
    User Message: "${message}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          riskScore: { type: Type.NUMBER },
          emotion: { type: Type.STRING, enum: ["Fear", "Anxiety", "Panic", "Calm"] },
          situationType: { type: Type.STRING, enum: ["Accident", "Harassment", "Lost Mobile", "Suspicious Person", "Medical Emergency", "General Safety", "Safe"] },
          reasoning: { type: Type.STRING },
          context: { type: Type.STRING },
          escapeDirection: { type: Type.STRING },
          nearestCrowdedArea: { type: Type.STRING },
          alertMessagePreview: { type: Type.STRING },
        },
        required: ["riskLevel", "riskScore", "emotion", "situationType", "reasoning", "context", "escapeDirection", "nearestCrowdedArea", "alertMessagePreview"],
      },
      systemInstruction: `You are an advanced AI Personal Safety Guardian (SafeSphere). 
      Respond in ${language}. 
      Be extremely serious. 
      If Harassment is detected, prioritize escape directions to public areas. 
      If Accident is detected, prioritize medical help. 
      If Lost Mobile is detected, provide tracking advice.`,
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      isNightRisk: mentionsNight,
    };
  } catch (error) {
    console.error("Failed to parse safety analysis:", error);
    return {
      riskLevel: RiskLevel.LOW,
      riskScore: 0,
      emotion: "Calm",
      situationType: "Safe",
      isNightRisk: mentionsNight,
      reasoning: "Error analyzing message",
      context: "Unknown",
      escapeDirection: "Stay where you are if safe.",
      nearestCrowdedArea: "Look for bright lights or shops.",
      alertMessagePreview: "I am safe.",
    };
  }
}

export async function analyzeVisualDistress(base64Image: string): Promise<SafetyAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      {
        text: "Analyze this person's face and surroundings for signs of extreme distress, danger, or emergency. If they look like they are in a life-threatening situation, set riskLevel to HIGH. Provide reasoning and escape directions.",
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
          riskScore: { type: Type.NUMBER },
          emotion: { type: Type.STRING, enum: ["Fear", "Anxiety", "Panic", "Calm"] },
          situationType: { type: Type.STRING, enum: ["Accident", "Harassment", "Lost Mobile", "Suspicious Person", "Medical Emergency", "General Safety", "Safe"] },
          reasoning: { type: Type.STRING },
          context: { type: Type.STRING },
          escapeDirection: { type: Type.STRING },
          nearestCrowdedArea: { type: Type.STRING },
          alertMessagePreview: { type: Type.STRING },
        },
        required: ["riskLevel", "riskScore", "emotion", "situationType", "reasoning", "context", "escapeDirection", "nearestCrowdedArea", "alertMessagePreview"],
      },
      systemInstruction: "You are a visual safety guardian. Analyze images for signs of danger, fear, or physical harm. Be extremely decisive in high-risk situations.",
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return result as SafetyAnalysis;
  } catch (error) {
    console.error("Failed to parse visual analysis:", error);
    return {
      riskLevel: RiskLevel.LOW,
      riskScore: 0,
      emotion: "Calm",
      situationType: "Safe",
      isNightRisk: false,
      reasoning: "Visual analysis failed",
      context: "Unknown",
      escapeDirection: "Stay alert.",
      nearestCrowdedArea: "Seek help.",
      alertMessagePreview: "I am safe.",
    };
  }
}
