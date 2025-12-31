
import React from 'react';
import { Language } from '../types';

interface FilterBarProps {
  currentFilter: Language | 'all';
  onFilterChange: (filter: Language | 'all') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-[72px] md:top-[80px] z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-start gap-4 space-x-reverse overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            currentFilter === 'all'
              ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
          }`}
        >
          {currentFilter === Language.KURDISH ? 'هەمووی' : 'الكل'}
        </button>
        <button
          onClick={() => onFilterChange(Language.ARABIC)}
          className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            currentFilter === Language.ARABIC
              ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
          }`}
        >
          العربية
        </button>
        <button
          onClick={() => onFilterChange(Language.KURDISH)}
          className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
            currentFilter === Language.KURDISH
              ? 'bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-400/50'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent'
          }`}
        >
          کوردی
        </button>
      </div>
    </div>
  );
};
