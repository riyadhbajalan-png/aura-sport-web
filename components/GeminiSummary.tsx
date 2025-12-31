
import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { callGeminiSafe } from '../services/apiHelper';

interface GeminiSummaryProps {
  news: NewsItem[];
}

export const GeminiSummary: React.FC<GeminiSummaryProps> = ({ news }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const generateSummary = async () => {
      if (news.length === 0) return;
      
      const titles = news.map(n => n.title).join('|');
      const cacheKey = `aura_summary_${btoa(unescape(encodeURIComponent(titles))).slice(0, 32)}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        setSummary(cached);
        return;
      }

      setLoading(true);
      setError(false);
      
      try {
        const response = await callGeminiSafe((ai) => 
          ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `أنت المحلل الرياضي لـ Aura Sport. بناءً على هذه الأخبار: [${titles}]، قدم ملخصاً إخبارياً مكثفاً (في جملتين) يبدأ بـ "رؤية Aura AI اليوم:". استخدم لغة عربية فصحى عصرية.`,
          })
        );
        
        const result = response.text || '';
        if (result) {
          setSummary(result);
          localStorage.setItem(cacheKey, result);
        }
      } catch (err) {
        console.error("AI Summary Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [news]);

  if (!loading && !summary && !error) return null;

  return (
    <div className="bg-gradient-to-l from-[#001f3f] to-[#000d1a] text-white p-6 rounded-[2rem] shadow-2xl mb-12 flex items-start space-x-6 space-x-reverse border border-blue-500/30 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className={`p-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-transform group-hover:rotate-12 ${loading ? 'animate-pulse bg-blue-500/50' : 'bg-gradient-to-br from-blue-600 to-blue-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <div className="relative z-10 flex-grow">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-3 flex items-center">
          <span className="w-8 h-[1px] bg-blue-500/50 ml-2"></span>
          {loading ? 'AI IS PROCESSING...' : error ? 'AURA AI OFFLINE' : 'AURA INTELLIGENCE'}
        </h4>
        
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse"></div>
          </div>
        ) : error ? (
          <p className="text-sm text-gray-500 italic">نعتذر، محرك التحليل مشغول حالياً. سنعود للخدمة خلال دقائق.</p>
        ) : (
          <p className="text-[16px] font-bold leading-relaxed text-blue-50/95 italic">
            {summary}
          </p>
        )}
      </div>
    </div>
  );
};
