import React from 'react';
import { User, Eye, EyeOff, Lock } from 'lucide-react';

export const StepIdentity = ({ data, updateData, onNext, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, error }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Vos informations</h2>
        <p className="text-slate-500 text-sm">Commençons par les bases pour créer votre compte chauffeur.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Prénom *</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => updateData({ firstName: e.target.value })}
              placeholder="Ex: Ousmane"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Nom *</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => updateData({ lastName: e.target.value })}
              placeholder="Ex: Fall"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Numéro de téléphone *</label>
        <div className="relative flex">
          <div className="shrink-0 pl-4 pr-3 py-3.5 rounded-l-2xl bg-slate-50 border-y border-l border-slate-200 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-500">+221</span>
          </div>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="77 123 45 67"
            className="w-full pl-3 pr-4 py-3.5 rounded-r-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
            required
          />
        </div>
        <p className="text-xs text-slate-400 ml-1">Ce numéro servira à vous contacter et pourra être modifié plus tard.</p>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Mot de passe *</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? "text" : "password"}
            value={data.password}
            onChange={(e) => updateData({ password: e.target.value })}
            placeholder="••••••••"
            className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
            required
            minLength={6}
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Confirmation du mot de passe *</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={data.confirmPassword}
            onChange={(e) => updateData({ confirmPassword: e.target.value })}
            placeholder="••••••••"
            className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
            required
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 rounded-2xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors"
      >
        Étape suivante
      </button>
    </form>
  );
};
