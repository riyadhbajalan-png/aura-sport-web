
import React, { useState } from 'react';
import { NewsItem, Language } from '../types';

interface NewsCardProps {
  item: NewsItem;
  onSelect: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onSelect }) => {
  const isKurdish = item.language === Language.KURDISH;
  const [imgError, setImgError] = useState(false);
  
  // دالة لتوليد رابط صورة رياضي بحت
  const generateSportsFallback = () => {
    const keywords = (item as any).searchKeywords || "football,soccer,stadium";
    // استخدام محرك Unsplash مع تأكيد التصنيف الرياضي
    return `https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop&sig=${item.id}&football-soccer`;
  };

  const fallbackImg = generateSportsFallback();

  return (
    <article 
      onClick={() => onSelect(item)}
      className={`group premium-glass rounded-[2rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500 flex flex-col h-full hover:translate-y-[-8px] cursor-pointer`}
    >
      {/* قسم الصورة */}
      <div className="relative aspect-video overflow-hidden bg-gray-950">
        <img
          src={imgError ? fallbackImg : item.imageUrl}
          alt={item.title}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110 ${imgError ? 'opacity-80' : 'opacity-95'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-4 right-4">
          <span className="bg-blue-600/20 backdrop-blur-md text-blue-400 text-[8px] font-black tracking-widest px-3 py-1 rounded-lg border border-blue-500/30 uppercase">
            {item.category}
          </span>
        </div>

        {/* مؤشر الصورة الأرشيفية */}
        {imgError && (
          <div className="absolute bottom-4 left-4">
            <span className="bg-blue-600/40 backdrop-blur-sm text-[7px] text-white px-2 py-0.5 rounded border border-blue-400/20 uppercase font-black">
              صورة رياضية أرشيفية
            </span>
          </div>
        )}
      </div>
      
      {/* باقي محتوى الكارت كما هو مع الحفاظ على التصميم */}
      <div className={`px-6 pt-4 flex items-center gap-2 ${isKurdish ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full shadow-inner">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
          <span className="text-blue-400 text-[9px] font-black tracking-widest uppercase">
            {isKurdish ? 'سەرچاوە:' : 'المصدر:'}
          </span>
          <span className="text-white text-[10px] font-black tracking-tighter ml-1">
            {item.source || 'أورا سبورت'}
          </span>
        </div>
      </div>
      
      <div className={`p-6 pt-2 flex-grow flex flex-col ${isKurdish ? 'text-right font-kurdish' : 'text-right'}`}>
        <h2 className="text-lg font-black text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
          {item.title}
        </h2>
        <p className="text-gray-400 text-xs mb-6 line-clamp-2 leading-relaxed font-medium opacity-80">
          {item.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{item.date}</span>
          <div className="flex items-center gap-2 group/btn">
            <span className="text-[10px] font-black text-blue-500 group-hover/btn:text-white transition-colors">
              {isKurdish ? 'زیاتر' : 'التفاصيل'}
            </span>
            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center group-hover/btn:bg-blue-600 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500 group-hover/btn:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
