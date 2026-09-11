import React from 'react';
import { Link } from 'react-router-dom';

export const TripQuotaProgress = ({ limit, used, limitReached }) => {
  if (limit === null) return null; // Unlimited plan

  const usedNum = Number(used ?? 0);
  const limitNum = Number(limit ?? 4);

  const percentage = limitNum > 0 
    ? Math.min(100, Math.max(0, (usedNum / limitNum) * 100)) 
    : 0;

  const limitReachedStatus = limitReached || usedNum >= limitNum;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Quota de publication</h2>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-slate-600">
            {usedNum} / {limitNum} trajets publiés ce mois-ci
          </span>
          <span className="text-sm font-black text-slate-900">{Math.round(percentage)} %</span>
        </div>
        
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${limitReachedStatus ? 'bg-rose-500' : 'bg-demandoo-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {limitReachedStatus && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold text-rose-500">
              Quota mensuel atteint.
            </span>
            <Link 
              to="/abonnement" 
              className="px-5 py-2.5 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-xl text-xs font-black transition-all shadow-md hover:shadow-lg text-center uppercase tracking-wider"
            >
              Passer à Pro
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
