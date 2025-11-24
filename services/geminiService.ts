import { GoogleGenAI } from "@google/genai";
import { Lesson } from '../types';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const askAIAboutLesson = async (question: string, lesson: Lesson, language: string = 'uz') => {
  try {
    // Use the standard flash model for quick text responses
    const modelId = 'gemini-2.5-flash';
    
    let languageName = "Uzbek (O'zbek tilida)";
    if (language === 'en') {
        languageName = "English";
    } else if (language === 'ru') {
        languageName = "Russian (Русский)";
    }

    const systemInstruction = `You are an expert programming tutor for the video course platform "ML Academy".
    The student is watching a lesson titled: "${lesson.title}".
    Lesson description: "${lesson.description}".
    
    Please provide a concise, helpful, and encouraging answer in ${languageName}.
    Keep the tone professional yet friendly. If the question is unrelated to programming or the course, politely decline.`;

    const response = await ai.models.generateContentStream({
      model: modelId,
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};