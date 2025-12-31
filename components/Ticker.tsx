
import React from 'react';
import { MatchScore } from '../types';

interface TickerProps {
  scores: MatchScore[];
}

export const Ticker: React.FC<TickerProps> = ({ scores }) => {
  return (
    <div className="bg-blue-950 text-white overflow-hidden py-2 border-b border-blue-800 hidden sm:block">
      <div className="flex animate-marquee whitespace-nowrap items-center">
        {scores.concat(scores).map((match, idx) => (
          <div key={`${match.id}-${idx}`} className="inline-flex items-center px-6 border-l border-blue-800 last:border-l-0">
            <span className={`w-2 h-2 rounded-full ml-2 ${match.isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>
            <span className="text-xs font-bold text-gray-300 ml-2">{match.time}</span>
            <span className="text-sm font-medium">{match.homeTeam}</span>
            <span className="bg-blue-800 px-2 py-0.5 mx-2 rounded font-mono text-sm">
              {match.homeScore} - {match.awayScore}
            </span>
            <span className="text-sm font-medium">{match.awayTeam}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          display: flex;
          width: fit-content;
        }
      `}</style>
    </div>
  );
};
