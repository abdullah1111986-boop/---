import { GoogleGenAI, Type } from "@google/genai";
import { TraineeProfile, GeminiAnalysis } from "../types";

const processEnvApiKey = process.env.API_KEY;

export const analyzeTranscript = async (trainee: TraineeProfile): Promise<GeminiAnalysis> => {
  if (!processEnvApiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: processEnvApiKey });

  // Prepare a simplified version of the transcript for the model to save tokens
  const transcriptText = trainee.courses.map(c => 
    `- Course: ${c.courseName}, Grade: ${c.grade}${c.semester ? `, Semester: ${c.semester}` : ''}`
  ).join('\n');

  const prompt = `
    You are an academic advisor in a training institute. Analyze the following academic record for a trainee named "${trainee.name}".
    
    Transcript Data:
    ${transcriptText}

    Please provide a response in valid JSON format ONLY, without markdown code blocks. The response must follow this schema:
    {
      "summary": "A brief 2-sentence summary of performance in Arabic.",
      "estimatedGPA": "Calculate an estimated GPA out of 5.0 based on the grades provided (assume A=5, B=4, C=3, D=2, F=1 if grades are letters, or convert percentage). Return as a string like '4.2/5.0'.",
      "strengths": ["Array of 2-3 subjects or skills they excel at based on high grades in Arabic"],
      "recommendation": "One constructive, encouraging paragraph in Arabic advising them on how to improve or maintain their level."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            estimatedGPA: { type: Type.STRING },
            strengths: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendation: { type: Type.STRING }
          },
          required: ["summary", "estimatedGPA", "strengths", "recommendation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiAnalysis;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback if AI fails
    return {
      summary: "تعذر تحليل البيانات حالياً.",
      estimatedGPA: "غير متاح",
      strengths: [],
      recommendation: "يرجى مراجعة المرشد الأكاديمي للحصول على تفاصيل دقيقة."
    };
  }
};
