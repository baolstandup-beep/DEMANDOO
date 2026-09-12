import React from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export const StepSummary = ({ data, updateData, onSubmit, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Résumé</h2>
        <p className="text-slate-500 text-sm">Vérifiez vos informations avant de finaliser.</p>
      </div>

      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-sm font-bold text-slate-500">Informations personnelles</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-sm font-bold text-slate-500">Photo chauffeur</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-sm font-bold text-slate-500">Assurance & Permis</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-sm font-bold text-slate-500">Informations véhicule</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500">Photos véhicule ({(Array.isArray(data.vehiclePhotos) ? data.vehiclePhotos : []).length})</span>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 font-medium leading-relaxed">
          En créant votre compte, vous confirmez l'exactitude de ces informations. Tout faux document entraînera une suspension immédiate.
        </p>
      </div>

      <label className="flex items-start gap-3 p-2 cursor-pointer">
        <input 
          type="checkbox" 
          checked={data.acceptedTerms}
          onChange={(e) => updateData({ acceptedTerms: e.target.checked })}
          className="mt-1 w-5 h-5 rounded border-slate-300 text-demandoo-500 focus:ring-demandoo-500" 
        />
        <span className="text-xs font-medium text-slate-600 leading-snug">
          J'accepte les conditions d'utilisation et la politique de confidentialité de Demandoo. Je confirme avoir l'autorisation légale d'exercer.
        </span>
      </label>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || !data.acceptedTerms}
        className="w-full py-4 rounded-2xl font-black text-sm text-white bg-demandoo-600 hover:bg-demandoo-500 transition-colors shadow-lg shadow-demandoo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Création en cours...</>
        ) : (
          "Créer mon compte chauffeur"
        )}
      </button>
    </div>
  );
};
