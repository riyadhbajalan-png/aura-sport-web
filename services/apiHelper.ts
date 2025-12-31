
import { GoogleGenAI } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

/**
 * دالة مساعدة لتنفيذ طلبات Gemini مع معالجة خطأ 429 (Resource Exhausted)
 * عبر استراتيجية الانتظار المتزايد (Exponential Backoff).
 */
export const callGeminiSafe = async (fn: (ai: GoogleGenAI) => Promise<any>, retryCount = 0): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    return await fn(ai);
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED');
    
    if (isRateLimit && retryCount < MAX_RETRIES) {
      const delay = INITIAL_DELAY * Math.pow(2, retryCount);
      console.warn(`Quota exceeded. Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiSafe(fn, retryCount + 1);
    }
    
    throw error;
  }
};
