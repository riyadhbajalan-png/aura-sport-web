
import React, { useState, useEffect } from 'react';
import { fetchLeagueStandings } from '../services/newsService';
import { LeagueStanding } from '../types';

export const LeagueSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'iraqi' | 'kurdish'>('iraqi');
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStandings = async () => {
      setLoading(true);
      const data = await fetchLeagueStandings(activeTab);
      setStandings(data);
      setLoading(false);
    };
    loadStandings();
  }, [activeTab]);

  return (
    <div className="mb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-2xl font-black text-white">ترتيب الدوريات</h2>
        </div>
        
        <div className="flex bg-gray-900 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('iraqi')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'iraqi' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            العراق
          </button>
          <button 
            onClick={() => setActiveTab('kurdish')}
            className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${activeTab === 'kurdish' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            كوردستان
          </button>
        </div>
      </div>

      <div className="premium-glass rounded-[2rem] overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-sm z-10 flex items-center justify-center">
             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/5 text-gray-500 text-[9px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-4">#</th>
                <th className="px-8 py-4">النادي</th>
                <th className="px-8 py-4 text-center">لعب</th>
                <th className="px-8 py-4 text-center">نقاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {standings.length > 0 ? standings.map((row) => (
                <tr key={row.rank} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5 font-black text-blue-500 text-lg">
                    {row.rank}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-[8px] font-black text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {row.team.substring(0, 1)}
                      </div>
                      <span className="font-bold text-gray-200 group-hover:text-white">{row.team}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center font-bold text-gray-400">{row.played}</td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-blue-400 font-black text-lg">
                      {row.points}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-600 font-bold italic">
                    جاري جلب البيانات الحية...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
