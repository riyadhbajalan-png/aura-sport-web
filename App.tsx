import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Ticker } from './components/Ticker';
import { NewsCard } from './components/NewsCard';
import { NewsSkeleton } from './components/Skeleton';
import { MOCK_SCORES } from './services/newsService';
import { AppView, NewsItem, Language } from './types';


// --- Configuration ---
const CACHE_KEY = 'aura_news_cache_v4';
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || "AIzaSyB1ExbPbpx1O7ZlxvG071tjKvUqdjQK_p4").trim();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const GENERAL_FEEDS = [
  { name: 'Elsport', url: 'https://rss.app/feeds/v1.1/hyVqQr96Mj0Gg0tV.json' },
  { name: 'beIN SPORTS', url: 'https://rss.app/feeds/v1.1/WwAYVDkJVKNaM9lP.json' }
];
const TRANSFER_FEED = { name: 'Transfers', url: 'https://rss.app/feeds/v1.1/8ehrfK9x3bTsIFn5.json' };

// بيانات احتياطية تظهر في حال فشل المصادر الخارجية لضمان عدم فراغ الصفحات
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: 'gen-fb-1',
    title: 'ريال مدريد يواصل الاستعداد للكلاسيكو',
    description: 'الملكي يجري تدريباته الأخيرة وسط معنويات عالية، وأنشيلوتي يلمح لتغييرات في التشكيلة الأساسية.',
    imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80',
    language: Language.ARABIC,
    category: 'Aura Sport',
    date: new Date().toISOString(),
    sourceUrl: '#'
  },
  {
    id: 'gen-fb-2',
    title: 'مانشستر سيتي يستعيد الصدارة',
    description: 'فوز عريض للسيتيزنز يضعهم في المقدمة، وهالاند يواصل تحطيم الأرقام القياسية في الدوري الإنجليزي.',
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80',
    language: Language.ARABIC,
    category: 'Aura Sport',
    date: new Date(Date.now() - 3600000).toISOString(),
    sourceUrl: '#'
  },
  {
    id: 'trans-fb-1',
    title: 'صفقة مدوية في الميركاتو الشتوي',
    description: 'أندية الدوري السعودي تستهدف نجوم الصف الأول في أوروبا بعروض خيالية لضمهم هذا الموسم.',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80',
    language: Language.ARABIC,
    category: 'Aura Sport',
    date: new Date(Date.now() - 7200000).toISOString(),
    sourceUrl: '#'
  }
];

const TRANSLATIONS = {
  ar: {
    retry: 'إعادة المحاولة',
    latestUpdates: 'آخر التحديثات',
    leagueNewsTitle: 'أخبار الدوريات',
    leagueDesc: 'تغطية شاملة لأخبار الدوريات المحلية والعالمية.',
    transferTitle: 'سوق الانتقالات',
    transferDesc: 'أحدث صفقات وانتقالات اللاعبين',
    footerRights: '© 2025 مجموعة إيليت ميديا لكرة القدم',
    footerPowered: 'مشغل بواسطة محرك أورا سبورت',
    footerDisclaimer: 'محتوى مولد بالذكاء الاصطناعي. تحقق من التفاصيل بشكل مستقل.',
    footerAggregator: 'أورا سبورت يجمع ويعرض الأخبار الرياضية من مصادر متعددة.',
    aiHub: 'مركز الذكاء الاصطناعي'
  },
  ku: {
    retry: 'هەوڵبدەرەوە',
    latestUpdates: 'نوێترین گۆڕانکارییەکان',
    leagueNewsTitle: 'هەواڵی خولەکان',
    leagueDesc: 'رووماڵی گشتگیر بۆ هەواڵی خولە ناوخۆیی و جیهانییەکان.',
    transferTitle: 'بازاڕی گواستنەوە',
    transferDesc: 'نوێترین گرێبەست و گواستنەوەی یاریزانان',
    footerRights: '© 2025 گروپی میدیایی ئیلیت بۆ تۆپی پێ',
    footerPowered: 'بەهێزکراوە لەلایەن بزوێنەری ئۆرا سپۆرت',
    footerDisclaimer: 'ناوەڕۆکی دروستکراو بە زیرەکی دەستکرد. وردەکارییەکان بە سەربەخۆیی پشتڕاست بکەرەوە.',
    footerAggregator: 'ئۆرا سپۆرت هەواڵی وەرزشی لە چەندین سەرچاوەوە کۆدەکاتەوە و پیشانی دەدات.',
    aiHub: 'سەنتەری زیرەکی دەستکرد'
  }
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('home');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lang, setLang] = useState<'ar' | 'ku'>('ar');
  const t = TRANSLATIONS[lang];

  // --- Data Fetching & Normalization ---
  const fetchCombinedNews = async () => {
    try {
      setLoading(true);
      
      // 1. Check Cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setNews(data);
          setLoading(false);
          return;
        }
      }

      // 2. Fetch from RSS Feeds (Direct JSON)
      const sources = [
        ...GENERAL_FEEDS.map((f, i) => ({ ...f, idPrefix: `gen-${i}` })),
        { ...TRANSFER_FEED, idPrefix: 'trans' }
      ];

      // استخدام معالجة الأخطاء لكل مصدر على حدة لضمان عدم توقف التطبيق بالكامل إذا فشل مصدر واحد
      const promises = sources.map(s => 
        fetch(s.url)
          .then(r => { if (!r.ok) throw new Error('Network error'); return r.json(); })
          .catch(err => { console.warn(`Failed to fetch ${s.name}`, err); return { items: [] }; })
      );

      const results = await Promise.all(promises);

      // 4. Normalize Data
      let combinedNews: NewsItem[] = [];

      results.forEach((feed: any, index) => {
        const source = sources[index];
        if (feed.items) {
          const rssNews = feed.items
            .filter((item: any) => {
              // Filter to ensure football content and exclude other sports
              const text = (item.title + ' ' + (item.description || '')).toLowerCase();
              const excluded = ['كرة سلة', 'السلة', 'nba', 'كرة يد', 'تنس', 'فورمولا', 'سباحة', 'basket', 'tennis', 'nfl', 'rugby', 'american football', 'cricket', 'volleyball', 'handball', 'hockey', 'boxing', 'ufc', 'mma', 'wrestling', 'golf', 'cycling', 'athletics', 'f1', 'moto', 'racing', 'horse', 'equestrian', 'ping pong', 'table tennis', 'badminton', 'squash', 'طائرة', 'كرة الطائرة', 'يد', 'كرة اليد', 'ملاكمة', 'مصارعة', 'سباق', 'خيول', 'فروسية', 'سيارات', 'دراجات', 'ألعاب قوى', 'جولف', 'هوكي'];
              return !excluded.some(term => text.includes(term));
            })
            .map((item: any, itemIndex: number) => ({
            id: `${source.idPrefix}-${itemIndex}`,
            title: item.title,
            description: (item.content_text || item.description || '').replace(/<[^>]*>?/gm, '').slice(0, 150) + '...',
            imageUrl: item.image || item.enclosure?.link || item.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80',
            language: Language.ARABIC,
            category: 'Aura Sport',
            date: item.date_published || item.pubDate,
            sourceUrl: item.url || item.link,
            isBreaking: false
          }));
          combinedNews = [...combinedNews, ...rssNews];
        }
      });

      // 5. Sort by Date (Newest First)
      combinedNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // إذا لم يتم جلب أي أخبار (بسبب مشاكل في المصدر)، نستخدم البيانات الاحتياطية
      if (combinedNews.length === 0) {
        combinedNews = FALLBACK_NEWS;
      }

      // 6. Update State & Cache
      setNews(combinedNews);
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: combinedNews,
        timestamp: Date.now()
      }));

    } catch (err) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombinedNews();
  }, []);

  // --- Translation Service ---
  const translateNewsWithGemini = async (items: NewsItem[]) => {
    if (!GEMINI_API_KEY) {
      alert("يرجى إضافة مفتاح Gemini API في الكود لتفعيل الترجمة.");
      return items;
    }

    setIsTranslating(true);
    try {
      // نترجم فقط أول 10 أخبار لتوفير الموارد وتسريع العملية في هذا المثال
      const itemsToTranslate = items.slice(0, 10);
      
      const prompt = `
        You are a professional sports news translator. 
        Translate the following news titles and descriptions from Arabic/English to Kurdish (Sorani).
        Keep the tone exciting and sports-oriented.
        Return ONLY a valid JSON array of objects with keys: "id", "title", "description".
        Do not include markdown formatting like \`\`\`json.
        
        News Items:
        ${JSON.stringify(itemsToTranslate.map(n => ({ id: n.id, title: n.title, description: n.description })))}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const errorMessage = data.error?.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      // استخراج JSON بشكل أكثر دقة لتجنب النصوص الإضافية
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : "[]";
      
      const translatedData = JSON.parse(jsonString);

      const newNews = items.map(item => {
        const translated = translatedData.find((t: any) => t.id === item.id);
        return translated ? { ...item, title: translated.title, description: translated.description, language: 'ku' } : item;
      });

      setNews(newNews);
    } catch (err) {
      console.error("Translation Error:", err);
      alert(`عذراً، حدث خطأ أثناء الترجمة.\n\nالتفاصيل: ${err}\n\nيرجى التأكد من أن مفتاح API صالح ومفعل.`);
      setLang('ar'); // العودة للعربية في حال الفشل
    } finally {
      setIsTranslating(false);
    }
  };

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    const newLang = lang === 'ar' ? 'ku' : 'ar';
    setLang(newLang);
    
    if (newLang === 'ku') {
      translateNewsWithGemini(news);
    } else {
      // عند العودة للعربية، نعيد جلب الأخبار الأصلية (أو يمكن استخدام نسخة مخبأة للأصل)
      fetchCombinedNews();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-white">
      <Ticker scores={MOCK_SCORES} />
      <Header activeView={activeView} onViewChange={handleViewChange} />
      
      {/* Language Toggle Button */}
      <button 
        onClick={!isTranslating ? toggleLanguage : undefined}
        className={`fixed bottom-6 right-6 z-50 ${isTranslating ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-full shadow-lg font-bold transition-all border border-white/10 flex items-center gap-2`}
      >
        {isTranslating ? 'جاري الترجمة...' : (lang === 'ar' ? 'کوردی' : 'عربي')}
      </button>

      <main className="flex-grow flex flex-col">
        {activeView === 'home' ? (
          <div className="flex-grow flex flex-col h-full min-h-[800px]">
            <div className="container mx-auto px-4 py-10 max-w-6xl">
              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {loading || isTranslating ? (
                  Array(6).fill(0).map((_, i) => <NewsSkeleton key={i} />)
                ) : error ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={fetchCombinedNews} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20">{t.retry}</button>
                  </div>
                ) : (
                  news.filter(item => item.id.startsWith('gen-')).map(item => (
                    <NewsCard key={item.id} item={item} onSelect={() => window.open(item.sourceUrl, '_blank')} />
                  ))
                )}
              </div>
            </div>
          </div>
        ) : activeView === 'leagues' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="mb-24 text-center">
                <span className="text-blue-500 font-black text-[10px] tracking-[0.5em] uppercase mb-4 block">{t.latestUpdates}</span>
                <h1 className="text-6xl md:text-8xl font-black mb-8 italic tracking-tighter uppercase leading-none">{lang === 'ar' ? 'أخبار' : 'هەواڵی'} <span className="text-blue-400">{lang === 'ar' ? 'الدوريات' : 'خولەکان'}</span></h1>
                <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">{t.leagueDesc}</p>
             </div>
             
             <div className="container mx-auto px-4 py-10 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {news.filter(item => item.id.startsWith('gen-')).filter(item => {
                    const text = (item.title + ' ' + (item.description || '')).toLowerCase();
                    return ['دوري', 'الدوري', 'بطولة', 'كأس', 'league', 'premier league', 'la liga', 'serie a', 'championship', 'cup'].some(k => text.includes(k));
                  }).map(item => (
                    <NewsCard key={item.id} item={item} onSelect={() => window.open(item.sourceUrl, '_blank')} />
                  ))}
                </div>
             </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col h-full min-h-[800px] animate-in fade-in duration-500">
             <div className="container mx-auto px-4 py-10 max-w-6xl">
                <div className="mb-12 text-center">
                  <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white">{lang === 'ar' ? 'سوق' : 'بازاڕی'} <span className="text-blue-500">{lang === 'ar' ? 'الانتقالات' : 'گواستنەوە'}</span></h1>
                  <p className="text-gray-400 mt-4">{t.transferDesc}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {news.filter(item => item.id.startsWith('trans-')).map(item => (
                    <NewsCard key={item.id} item={item} onSelect={() => window.open(item.sourceUrl, '_blank')} />
                  ))}
                </div>
             </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-950 py-32 mt-40 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full"></div>
        <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center">
          
          <p className="text-xs text-gray-700 uppercase tracking-[1em] font-black mb-8 opacity-40">{t.aiHub}</p>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-800 font-bold uppercase tracking-widest">{t.footerRights}</p>
            <p className="text-xs text-blue-500/40 font-black uppercase tracking-[0.5em]">{t.footerPowered}</p>
            <p className="text-[10px] text-gray-600 mt-2 font-medium opacity-50">{t.footerDisclaimer}</p>
            <p className="text-[10px] text-gray-600 font-medium opacity-50">{t.footerAggregator}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
