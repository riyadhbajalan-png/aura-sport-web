
import React, { useEffect, useState } from 'react';
import { NewsItem, Language } from '../types';
import { NewsCard } from './NewsCard';
import { NewsSkeleton } from './Skeleton';
import { callGeminiSafe } from '../services/apiHelper';

export const MercatoView: React.FC<{ onSelect: (item: NewsItem) => void }> = ({ onSelect }) => {
  const [mercatoNews, setMercatoNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMercato = async () => {
      try {
        const response = await callGeminiSafe((ai) => 
          ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `أنت خبير انتقالات (Mercato Insider). جلب آخر 8 أخبار انتقالات عالمية بالعربية فقط.
            الصور: ابحث عن صورة حقيقية رياضية للاعب.
            JSON Format: [{ "title": "العنوان", "summary": "الملخص", "source": "المصدر", "imageUrl": "رابط الصورة", "searchKeywords": "Player Transfer Action" }]`,
            config: { 
              tools: [{ googleSearch: {} }],
              responseMimeType: "application/json" 
            },
          })
        );

        const text = response.text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(text);
        
        setMercatoNews(data.map((item: any) => {
          const sportsKeywords = `${item.searchKeywords || 'football player'} soccer pitch`;
          return {
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            language: Language.ARABIC,
            category: 'انتقالات',
            description: item.summary,
            date: 'سوق الانتقالات',
            imageUrl: (item.imageUrl && item.imageUrl.includes('http')) 
              ? item.imageUrl 
              : `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop&keywords=${encodeURIComponent(sportsKeywords)}`
          };
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMercato();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-16 relative py-16 px-8 rounded-[3.5rem] overflow-hidden border border-blue-500/20 bg-gray-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[150px]"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
           <div className="flex items-center gap-3 mb-6 bg-blue-600/10 px-6 py-2 rounded-full border border-blue-500/20">
             <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
             <span className="text-blue-400 text-[10px] font-black tracking-widest uppercase">رادار الانتقالات الموثق</span>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter italic uppercase">سوق الانتقالات</h1>
           <p className="text-gray-400 text-base max-w-xl font-medium">تغطية ذكية مدعومة بصور رياضية احترافية لكل تحركات اللاعبين.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => <NewsSkeleton key={i} />)
        ) : (
          mercatoNews.map(item => (
            <NewsCard key={item.id} item={item} onSelect={onSelect} />
          ))
        )}
      </div>
    </div>
  );
};
