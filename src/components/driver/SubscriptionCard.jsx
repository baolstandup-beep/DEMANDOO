import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check } from 'lucide-react';

export const SubscriptionCard = ({ user, hasActiveSub }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
      <h2 className="text-lg font-black text-slate-900 mb-4 tracking-tight">Votre abonnement</h2>
      
      {hasActiveSub ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-demandoo-600" />
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">
                {user.subscription_plan === 'pro' ? 'CHAUFFEUR PRO' : 'CHAUFFEUR STANDARD'}
              </h3>
            </div>
            <p className="text-sm text-slate-500 font-bold mb-3">
              {user.subscription_plan === 'pro' ? 'Trajets illimités' : '2 500 FCFA / mois'}
            </p>
            <div className="flex flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <Check className="w-3.5 h-3.5" /> Abonnement actif
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Check className="w-3.5 h-3.5 text-slate-400" /> 
                {user.subscription_plan === 'pro' ? 'Trajets illimités' : `${user.subscription_trip_limit || 4} trajets / mois`}
              </span>
            </div>
          </div>
          
          <Link 
            to="/abonnement" 
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold transition-colors text-center border border-slate-200"
          >
            Gérer mon abonnement
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">Aucun abonnement actif</h3>
            <p className="text-sm text-slate-500 font-medium max-w-md">
              Activez votre forfait Chauffeur pour publier vos trajets sur Demandoo.
            </p>
          </div>
          <Link 
            to="/abonnement" 
            className="w-full sm:w-auto px-6 py-2.5 bg-demandoo-600 hover:bg-demandoo-700 text-white rounded-xl text-sm font-bold transition-colors text-center shadow-sm"
          >
            Voir les offres →
          </Link>
        </div>
      )}
    </div>
  );
};
