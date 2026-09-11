import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, MoreVertical, Edit2, XCircle } from 'lucide-react';

export const NextTripCard = ({ nextTrip, canPublish, cancelTrip }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est irréversible et vos passagers seront prévenus.")) {
      if (cancelTrip) {
        cancelTrip(nextTrip.id);
        setShowMenu(false);
      }
    }
  };
  if (!nextTrip) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-[0_2px_15px_-3px_rgba(6,81,237,0.1)]">
        <h3 className="text-xl font-black text-slate-900 mb-2">Aucun trajet prévu</h3>
        <p className="text-slate-500 text-sm font-medium mb-8 max-w-sm mx-auto">
          Publiez votre prochain trajet et commencez à recevoir des demandes.
        </p>
        
        {canPublish ? (
          <Link 
            to="/publier" 
            className="inline-flex px-8 py-4 rounded-xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 transition-all items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Publier un trajet
          </Link>
        ) : (
          <Link 
            to="/abonnement" 
            className="inline-flex px-8 py-4 rounded-xl text-sm font-black text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all items-center gap-2"
          >
            Voir les abonnements
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_-5px_rgba(6,81,237,0.15)] border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-demandoo-50 rounded-bl-[100px] pointer-events-none -z-10" />
      
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-black text-demandoo-600 uppercase tracking-widest bg-demandoo-50 px-3 py-1 rounded-full">
            Prochain trajet
          </span>
          <div className="flex items-center gap-2 relative">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
              {nextTrip.status === 'scheduled' ? 'À venir' : nextTrip.status}
            </span>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors focus:outline-none"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute top-10 right-0 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl py-2 z-50 animate-fade-in">
                <button 
                  onClick={() => navigate(`/trajet/${nextTrip.id}`)}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" /> Modifier le trajet
                </button>
                <button 
                  onClick={handleCancel}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Annuler le trajet
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          
          {/* Ligne Visuelle */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center mt-1">
              <div className="w-3 h-3 rounded-full border-[3px] border-demandoo-500 bg-white" />
              <div className="w-0.5 h-12 bg-slate-200 my-1" />
              <div className="w-3 h-3 rounded-full border-[3px] border-slate-900 bg-white" />
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-black text-slate-900 leading-none">{nextTrip.departure_city}</h4>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 leading-none">{nextTrip.arrival_city}</h4>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 md:gap-8 bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Date & Heure</span>
              <div className="text-sm font-black text-slate-900">
                {new Date(nextTrip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                <span className="text-demandoo-600 mx-1">•</span>
                {new Date(nextTrip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Véhicule</span>
              <div className="text-sm font-bold text-slate-700">
                {nextTrip.driver?.vehicle?.make} {nextTrip.driver?.vehicle?.model}
              </div>
              <div className="text-xs font-bold text-emerald-600 mt-0.5">
                {nextTrip.seats_available} places disponibles
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Prix</span>
              <div className="text-lg font-black text-slate-900">
                {nextTrip.price_per_seat.toLocaleString('fr-FR')} <span className="text-xs text-slate-500 font-bold">FCFA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
          <Link 
            to={`/trajet/${nextTrip.id}`} 
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors"
          >
            Voir les demandes
          </Link>
          <Link 
            to={`/trajet/${nextTrip.id}`} 
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>
    </div>
  );
};
