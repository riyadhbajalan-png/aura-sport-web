
import React, { useEffect, useState, useRef } from 'react';
import { NewsItem, Language } from '../types';
import { callGeminiSafe } from '../services/apiHelper';

interface NewsDetailProps {
  item: NewsItem;
  onClose: () => void;
}

export const NewsDetail: React.FC<NewsDetailProps> = ({ item, onClose }) => {
  const [fullContent, setFullContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isKurdish = item.language === Language.KURDISH;
  const hasStartedStreaming = useRef(false);

  useEffect(() => {
    const generateFullContent = async () => {
      if (hasStartedStreaming.current) return;
      hasStartedStreaming.current = true;

      try {
        const prompt = `أنت محرر رياضي في Aura Sport. اكتب مقالاً تفصيلياً (150 كلمة) لخبر: "${item.title}". 
        اللغة: ${isKurdish ? 'الكردية السورانية' : 'العربية الفصحى'}.`;

        const response = await callGeminiSafe((ai) => 
          ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
          })
        );

        setFullContent(response.text || '');
      } catch (err) {
        console.error("Content Generation Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    generateFullContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [item, isKurdish]);

  return (
    <div className="fixed inset-0 z-[60] bg-gray-950 overflow-y-auto animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto min-h-screen flex flex-col bg-[#030712]">
        <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-2xl border-b border-white/5 p-4 flex justify-between items-center">
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-[12px] font-black text-white tracking-[0.2em] uppercase italic">AURA SPORT</div>
          <div className="w-10"></div>
        </div>

        <div className="relative h-[400px] shrink-0">
          <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] to-transparent"></div>
          <div className="absolute bottom-0 px-8 pb-12 w-full text-right">
             <h1 className={`text-3xl md:text-5xl font-black text-white ${isKurdish ? 'font-kurdish' : ''}`}>
               {item.title}
             </h1>
          </div>
        </div>

        <div className={`p-8 md:p-16 flex-grow ${isKurdish ? 'text-right font-kurdish' : 'text-right'}`}>
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-white/5 rounded-full w-full animate-pulse"></div>
              <div className="h-4 bg-white/5 rounded-full w-[80%] animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400 text-sm">نعتذر، محرك المحتوى مشغول حالياً بسبب ضغط الطلبات. الخبر الأصلي:</p>
              <p className="mt-4 text-gray-300 italic">{item.description}</p>
            </div>
          ) : (
            <div className="text-xl md:text-2xl text-gray-200 leading-relaxed whitespace-pre-wrap">
              {fullContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
