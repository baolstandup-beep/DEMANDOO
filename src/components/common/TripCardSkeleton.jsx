import React from 'react';

export const TripCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 animate-pulse">
      
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-slate-200"></div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
            <div className="h-3 w-16 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
      </div>

      <div className="relative pl-6 space-y-4 my-2 border-l-2 border-slate-100">
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-200 border-4 border-white" />
          <div className="h-4 w-28 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-12 bg-slate-100 rounded"></div>
        </div>
        <div className="relative">
          <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white" />
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
        <div className="h-6 w-24 bg-slate-200 rounded"></div>
        <div className="h-11 w-28 bg-slate-200 rounded-xl"></div>
      </div>

    </div>
  );
};
