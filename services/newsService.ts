
import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, Language, MatchScore, LeagueStanding } from '../types';
import { callGeminiSafe } from './apiHelper';

export const MOCK_SCORES: MatchScore[] = [
  { id: 'm1', homeTeam: 'القوة الجوية', awayTeam: 'الشرطة', homeScore: 1, awayScore: 1, time: '60\'', isLive: true },
  { id: 'm2', homeTeam: 'أربيل', awayTeam: 'الزوراء', homeScore: 0, awayScore: 2, time: 'انتهت', isLive: false },
  { id: 'm3', homeTeam: 'دهوك', awayTeam: 'نوروز', homeScore: 2, awayScore: 1, time: 'انتهت', isLive: false },
];

const CACHE_VERSION = 'v11';
const CACHE_KEY_PREFIX = `aura_${CACHE_VERSION}_`;
const CACHE_DURATION = 20 * 60 * 1000; // تم رفعها لـ 20 دقيقة لتقليل استهلاك الكوتا

const safeJsonParse = (text: string) => {
  try {
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (e) {
    return null;
  }
};

export const fetchNews = async (targetLanguage: Language | 'all' = 'all'): Promise<NewsItem[]> => {
  const cacheKey = `${CACHE_KEY_PREFIX}news_${targetLanguage}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) return parsed.data;
  }

  try {
    const langName = targetLanguage === Language.KURDISH ? 'Kurdish Sorani (کوردی سۆرانی)' : 'Arabic (العربية الفصحى)';
    
    const prompt = `أنت رئيس تحرير Aura Sport. جلب 8 أخبار رياضية عاجلة اليوم بالعربية.
    يجب أن تكون الصور رياضية احترافية.
    JSON Output: [{ "title": "العنوان", "summary": "الملخص", "imageUrl": "رابط الصورة", "category": "التصنيف", "source": "المصدر", "searchKeywords": "Specific Sports Search Query" }]`;

    const response = await callGeminiSafe((ai) => 
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { 
          tools: [{ googleSearch: {} }], 
          responseMimeType: "application/json" 
        },
      })
    );

    const newsData = safeJsonParse(response.text) || [];
    const formatted = newsData.map((item: any) => {
      const sportsKeywords = `${item.searchKeywords || 'football'} match photography`;
      return {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        description: item.summary,
        language: targetLanguage === Language.KURDISH ? Language.KURDISH : Language.ARABIC,
        date: targetLanguage === Language.KURDISH ? 'نوێکراوەتەوە' : 'تحديث مباشر',
        imageUrl: (item.imageUrl && item.imageUrl.startsWith('http')) 
          ? item.imageUrl 
          : `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop&keywords=${encodeURIComponent(sportsKeywords)}`
      };
    });
    
    localStorage.setItem(cacheKey, JSON.stringify({ data: formatted, timestamp: Date.now() }));
    return formatted;
  } catch (error) {
    return [];
  }
};

export const fetchLeagueStandings = async (leagueName: 'iraqi' | 'kurdish'): Promise<LeagueStanding[]> => {
  const cacheKey = `${CACHE_KEY_PREFIX}standings_${leagueName}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < 3600000) return data;
  }
  try {
    const response = await callGeminiSafe((ai) => 
      ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Get live football standings for ${leagueName === 'iraqi' ? 'Iraqi Premier League' : 'Kurdistan Premier League'}. Return ONLY raw JSON array: [{rank: number, team: string, played: number, points: number}]`,
        config: { tools: [{ googleSearch: {} }], responseMimeType: "application/json" },
      })
    );
    const data = safeJsonParse(response.text) || [];
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
  } catch (error) { return []; }
};
