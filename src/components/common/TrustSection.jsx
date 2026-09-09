import React from 'react';
import { ShieldCheck, Lock, Star, Headset, AlertTriangle } from 'lucide-react';

export const TrustSection = () => {
  return (
    <section className="py-12 bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 my-10 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-demandoo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-3xl mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-800/80 text-emerald-300 border border-emerald-700/50 mb-3">
          <ShieldCheck className="w-4 h-4 text-demandoo-400" />
          Sécurité & Transparence
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Voyagez en toute confiance avec Demandoo
        </h2>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Chaque trajet est encadré par nos normes de sécurité strictes et nos mécanismes de vérification pour vous garantir un voyage serein au Sénégal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-emerald-900/40 p-5 rounded-2xl border border-emerald-800/60 backdrop-blur-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-demandoo-500/20 text-demandoo-400 flex items-center justify-center font-bold mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Conducteurs vérifiés</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Contrôle rigoureux des pièces d'identité (CNI), permis de conduire valide et documents du véhicule.
          </p>
        </div>

        <div className="bg-emerald-900/40 p-5 rounded-2xl border border-emerald-800/60 backdrop-blur-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-demandoo-500/20 text-demandoo-400 flex items-center justify-center font-bold mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Paiement 100% sécurisé</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Wave, Orange Money et LigdiCash. Confirmation backend et protection contre les fraudes.
          </p>
        </div>

        <div className="bg-emerald-900/40 p-5 rounded-2xl border border-emerald-800/60 backdrop-blur-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-demandoo-500/20 text-demandoo-400 flex items-center justify-center font-bold mb-2">
            <Star className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Avis certifiés post-trajet</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Seuls les passagers et chauffeurs ayant effectué un trajet validé peuvent laisser une note authentique.
          </p>
        </div>

        <div className="bg-emerald-900/40 p-5 rounded-2xl border border-emerald-800/60 backdrop-blur-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-demandoo-500/20 text-demandoo-400 flex items-center justify-center font-bold mb-2">
            <Headset className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Assistance 24/7 & Signalement</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Une équipe dédiée et un bouton de signalement rapide disponible à tout moment.
          </p>
        </div>

      </div>
    </section>
  );
};
