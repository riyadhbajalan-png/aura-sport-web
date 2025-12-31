
import React from 'react';

export const NewsSkeleton: React.FC = () => {
  return (
    <div className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden animate-pulse flex flex-col h-full shadow-2xl">
      <div className="aspect-video bg-white/10 relative">
        <div className="absolute top-4 right-4 flex gap-2">
           <div className="h-6 w-16 bg-white/10 rounded-lg"></div>
           <div className="h-6 w-20 bg-white/10 rounded-lg"></div>
        </div>
      </div>
      <div className="p-6 flex-grow">
        <div className="h-6 bg-white/10 rounded-full w-3/4 mb-4"></div>
        <div className="h-4 bg-white/10 rounded-full w-full mb-2"></div>
        <div className="h-4 bg-white/10 rounded-full w-5/6 mb-6"></div>
        
        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
          <div className="space-y-2">
             <div className="h-2 bg-white/10 rounded-full w-12"></div>
             <div className="h-2 bg-white/10 rounded-full w-20"></div>
          </div>
          <div className="h-4 bg-blue-500/20 rounded-full w-24"></div>
        </div>
      </div>
    </div>
  );
};
