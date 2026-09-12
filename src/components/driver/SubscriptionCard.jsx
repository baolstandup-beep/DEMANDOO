import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check, Clock } from 'lucide-react';

export const SubscriptionCard = ({ user, hasActiveSub }) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Inconnu';
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getPlanName = () => {
    switch (user?.subscription_plan) {
      case 'pro': return 'Pro';
      case 'standard': return 'Standard';
      default: return 'Découverte';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          Mon abonnement
        </h2>
        {user?.subscription_plan === 'pro' && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider rounded-full">
            Badge Pro
          </span>
        )}
      </div>
      
      {hasActiveSub || user?.subscription_plan === 'trial' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Formule actuelle</p>
              <p className="text-base font-black text-slate-900">{getPlanName()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Statut</p>
              <p className="text-base font-black text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                {user?.subscription_status === 'expired' ? (
                  <span className="text-red-500">Expiré</span>
                ) : (
                  'Actif'
                )}
              </p>
            </div>
            
            {user?.subscription_plan !== 'pro' && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Utilisation</p>
                <p className="text-base font-black text-slate-900">
                  {user?.subscription_trips_used || 0} / {user?.subscription_trip_limit || 1} trajets
                </p>
              </div>
            )}
            {user?.subscription_plan === 'pro' && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Trajets</p>
                <p className="text-base font-black text-slate-900">Illimités</p>
              </div>
            )}
            
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Renouvellement</p>
              <p className="text-base font-black text-slate-900 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {user?.next_renewal_at ? formatDate(user.next_renewal_at) : 'Non défini'}
              </p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Link 
              to="/#abonnements" 
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl text-sm font-black transition-colors text-center w-full sm:w-auto"
            >
              Gérer mon abonnement
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">Aucun abonnement actif</h3>
            <p className="text-sm text-slate-500 font-medium max-w-md">
              Votre abonnement a expiré. Renouvelez-le pour continuer à publier des trajets.
            </p>
          </div>
          <Link 
            to="/#abonnements" 
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black transition-colors text-center shadow-sm"
          >
            Renouveler mon abonnement
          </Link>
        </div>
      )}
    </div>
  );
};
