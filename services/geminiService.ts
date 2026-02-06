import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ValuationResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for the valuation calculator
const valuationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    estimatedValue: {
      type: Type.NUMBER,
      description: "Estimated market value in USD based on the item description.",
    },
    suggestedLoan: {
      type: Type.NUMBER,
      description: "Suggested loan amount (typically 40-60% of market value).",
    },
    riskAssessment: {
      type: Type.STRING,
      description: "Short assessment of volatility or resale ease (Low, Medium, High).",
    },
    category: {
      type: Type.STRING,
      description: "Best fitting category (Electronics, Jewelry, Tools, etc).",
    }
  },
  required: ["estimatedValue", "suggestedLoan", "riskAssessment", "category"],
};

export const appraiseItem = async (description: string, condition: number): Promise<ValuationResult> => {
  try {
    const prompt = `
      Act as an expert pawn shop appraiser. 
      Analyze the following item for a loan.
      Item Description: "${description}"
      Condition (1-10, 10 is new): ${condition}
      
      Provide a conservative market value estimation and a safe loan amount.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: valuationSchema,
        temperature: 0.2, // Low temperature for consistent valuations
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ValuationResult;
  } catch (error) {
    console.error("Valuation error:", error);
    // Fallback mock for demo if API fails or key is missing
    return {
      estimatedValue: 0,
      suggestedLoan: 0,
      riskAssessment: "Error en valoración automática",
      category: "Desconocido"
    };
  }
};

export const generateMarketingCopy = async (itemName: string, details: string): Promise<string> => {
  try {
    const prompt = `
      Write a catchy, short sales description for a second-hand item in a pawn shop marketplace.
      Item: ${itemName}
      Details: ${details}
      Target: Bargain hunters.
      Language: Spanish.
      Max length: 2 sentences.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Gran oportunidad a excelente precio.";
  } catch (error) {
    console.error("Copywriting error:", error);
    return "Excelente artículo disponible por tiempo limitado.";
  }
};