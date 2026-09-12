import React from 'react';
import { Car, Hash, Users, Activity } from 'lucide-react';

export const StepVehicleInfo = ({ data, updateData, onNext }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Votre Véhicule</h2>
        <p className="text-slate-500 text-sm">Les informations pour rassurer vos futurs passagers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Marque *</label>
          <div className="relative">
            <Car className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={data.brand}
              onChange={(e) => updateData({ brand: e.target.value })}
              placeholder="Ex: Peugeot"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Modèle *</label>
          <div className="relative">
            <Car className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={data.model}
              onChange={(e) => updateData({ model: e.target.value })}
              placeholder="Ex: 508"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Année</label>
          <div className="relative">
            <input
              type="number"
              value={data.year}
              onChange={(e) => updateData({ year: e.target.value })}
              placeholder="Ex: 2018"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Couleur *</label>
          <div className="relative">
            <input
              type="text"
              value={data.color}
              onChange={(e) => updateData({ color: e.target.value })}
              placeholder="Ex: Gris"
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Places passagers *</label>
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select
              value={data.seatsCount}
              onChange={(e) => updateData({ seatsCount: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none appearance-none"
              required
            >
              <option value="">Sélectionner</option>
              <option value="1">1 place</option>
              <option value="2">2 places</option>
              <option value="3">3 places</option>
              <option value="4">4 places</option>
              <option value="5">5 places</option>
              <option value="6">6 places</option>
              <option value="7">7 places</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Type *</label>
          <div className="relative">
            <Activity className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <select
              value={data.vehicleType}
              onChange={(e) => updateData({ vehicleType: e.target.value })}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none appearance-none"
              required
            >
              <option value="">Sélectionner</option>
              <option value="Berline">Berline</option>
              <option value="SUV">SUV</option>
              <option value="Citadine">Citadine</option>
              <option value="4x4">4x4 / Pick-up</option>
              <option value="Minibus">Minibus</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block ml-1">Immatriculation *</label>
        <div className="relative">
          <Hash className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={data.licensePlate}
            onChange={(e) => updateData({ licensePlate: e.target.value })}
            placeholder="Ex: DK-1234-AB"
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none uppercase"
            required
          />
        </div>
        <p className="text-xs text-slate-400 ml-1">Restreinte au public (affichée en partie : DK-****-AB).</p>
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
