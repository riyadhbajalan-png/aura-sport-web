
import React from 'react';
import { AppView } from '../types';
import logo from '@/AUS.svg';

interface HeaderProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  return (
    <header className="bg-gray-950/95 backdrop-blur-3xl text-white sticky top-0 z-50 border-b border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto px-6 h-28 flex justify-between items-center">
        <div onClick={() => onViewChange('home')} className="flex items-center gap-3 cursor-pointer group">
          <img src={logo} alt="Aura Sport" className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-transform duration-300 group-hover:scale-105" />
          <h1 className="text-3xl font-black italic tracking-tighter text-white">AURA <span className="text-blue-500">SPORT</span></h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-10">
          <button 
            onClick={() => onViewChange('home')}
            className={`text-[11px] font-black tracking-widest transition-all uppercase ${activeView === 'home' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-500 hover:text-white'}`}
          >
            الرئيسية
          </button>
          <button 
            onClick={() => onViewChange('leagues')}
            className={`text-[11px] font-black tracking-widest transition-all uppercase ${activeView === 'leagues' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-500 hover:text-white'}`}
          >
            الدوريات
          </button>
          <button 
            onClick={() => onViewChange('mercato')}
            className={`text-[11px] font-black tracking-widest transition-all uppercase ${activeView === 'mercato' ? 'text-blue-400 border-b-2 border-blue-400 pb-1' : 'text-gray-500 hover:text-white'}`}
          >
            الميركاتو
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3 bg-blue-500/10 px-5 py-2 rounded-xl border border-blue-400/20 shadow-lg">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
            </span>
            <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">Aura AI Pulse</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
