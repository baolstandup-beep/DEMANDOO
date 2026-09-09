import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { INITIAL_CITIES } from '../lib/mockData';
import { VerifiedDriverBadge } from '../components/common/Badge';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Filter, 
  ShieldCheck, 
  Car, 
  Star, 
  Bell, 
  Check, 
  X, 
  SlidersHorizontal,
  Info
} from 'lucide-react';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchTrips, createSearchAlert } = useTrips();
  const { user } = useAuth();

  const [departure, setDeparture] = useState(searchParams.get('departure') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [passengers, setPassengers] = useState(parseInt(searchParams.get('passengers') || '1', 10));
  
  // Filter States
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('price_asc'); // price_asc, date_asc, rating_desc
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    setDeparture(searchParams.get('departure') || '');
    setDestination(searchParams.get('destination') || '');
    setDate(searchParams.get('date') || '');
    if (searchParams.get('passengers')) {
      setPassengers(parseInt(searchParams.get('passengers'), 10));
    }
  }, [searchParams]);

  const rawResults = searchTrips({
    departure,
    destination,
    date,
    passengers,
    verifiedOnly,
    maxPrice
  });

  // Sort logic
  const filteredTrips = [...rawResults].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_per_seat - b.price_per_seat;
    if (sortBy === 'date_asc') return new Date(a.departure_datetime) - new Date(b.departure_datetime);
    if (sortBy === 'rating_desc') return (b.driver?.rating || 0) - (a.driver?.rating || 0);
    return 0;
  });

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (user) {
      createSearchAlert({
        userId: user.id,
        departure_city: departure || 'Toutes villes',
        arrival_city: destination || 'Toutes villes',
        date: date || null
      });
      setAlertSuccess(true);
      setTimeout(() => {
        setAlertSuccess(false);
        setShowAlertModal(false);
      }, 2000);
    } else {
      alert("Veuillez vous connecter pour créer une alerte.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* PAGE TITLE & METADATA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-demandoo-dark tracking-tight">
            Trouver un trajet au Sénégal
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {filteredTrips.length} trajet(s) disponible(s) répondant à vos critères
          </p>
        </div>

        <button
          onClick={() => setShowAlertModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-demandoo-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-sm transition-all self-start sm:self-auto"
        >
          <Bell className="w-4 h-4 text-demandoo-600" />
          Créer une alerte pour cette destination
        </button>
      </div>

      {/* SEARCH INPUT BAR */}
      <div className="glass-card p-5 rounded-3xl grid grid-cols-1 sm:grid-cols-4 gap-3.5 border border-slate-200/80 shadow-md">
        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Départ</label>
          <input
            type="text"
            list="cities-list-search"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            placeholder="Ex: Touba"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Destination</label>
          <input
            type="text"
            list="cities-list-search"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Ex: Dakar"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Passagers</label>
          <select
            value={passengers}
            onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 bg-white"
          >
            <option value={1}>1 personne</option>
            <option value={2}>2 personnes</option>
            <option value={3}>3 personnes</option>
            <option value={4}>4 personnes</option>
          </select>
        </div>

        <datalist id="cities-list-search">
          {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>

      {/* FILTERS & SORT BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
        <div className="flex flex-wrap items-center gap-5">
          
          <label className="flex items-center gap-2 cursor-pointer font-extrabold text-slate-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="w-4 h-4 text-demandoo-500 rounded border-slate-300 focus:ring-demandoo-500"
            />
            <ShieldCheck className="w-4 h-4 text-demandoo-600" />
            Conducteurs vérifiés uniquement
          </label>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-600">Prix max :</span>
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              className="accent-demandoo-500 cursor-pointer"
            />
            <span className="font-black text-demandoo-dark">{maxPrice.toLocaleString('fr-FR')} FCFA</span>
          </div>

        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="font-extrabold text-slate-600">Trier par :</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-extrabold text-slate-800 focus:outline-none shadow-sm"
          >
            <option value="price_asc">Prix croissant</option>
            <option value="date_asc">Heure de départ</option>
            <option value="rating_desc">Meilleure note chauffeur</option>
          </select>
        </div>
      </div>

      {/* RESULTS LIST */}
      <div className="space-y-4">
        {filteredTrips.length === 0 ? (
          /* PROFESSIONAL EMPTY STATE */
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-4 max-w-lg mx-auto shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-demandoo-600 flex items-center justify-center mx-auto shadow-inner">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-demandoo-dark">Aucun trajet trouvé pour le moment</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Aucun conducteur ne propose ce trajet aux critères demandés pour l'instant. Vous pouvez modifier vos filtres ou créer une alerte automatique.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  setDeparture('');
                  setDestination('');
                  setDate('');
                  setVerifiedOnly(false);
                  setMaxPrice(15000);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Réinitialiser les filtres
              </button>
              <button
                onClick={() => setShowAlertModal(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-demandoo-500 hover:bg-demandoo-600 shadow-md shadow-demandoo-500/20 transition-all"
              >
                Créer une alerte
              </button>
            </div>
          </div>
        ) : (
          filteredTrips.map(trip => (
            <div key={trip.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft hover-lift transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              
              {/* DRIVER & VEHICLE INFO */}
              <div className="flex items-start gap-4 md:w-1/3">
                <img
                  src={trip.driver?.avatar_url}
                  alt={trip.driver?.full_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-demandoo-500 shrink-0 shadow-sm"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-demandoo-dark text-sm">{trip.driver?.full_name}</h4>
                    <VerifiedDriverBadge />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {trip.driver?.rating}
                    </span>
                    <span>•</span>
                    <span className="font-medium">{trip.driver?.total_trips} trajets réalisés</span>
                  </div>

                  <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-demandoo-500" />
                    {trip.driver?.vehicle?.make} {trip.driver?.vehicle?.model} ({trip.driver?.vehicle?.color})
                  </p>
                </div>
              </div>

              {/* ROUTE & TIMING */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 md:w-5/12 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-demandoo-dark">
                  <span>{trip.departure_city}</span>
                  <span className="text-[11px] font-semibold text-slate-400">Durée est. : {trip.estimated_duration}</span>
                  <span>{trip.arrival_city}</span>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="w-3 h-3 rounded-full bg-demandoo-500 border-2 border-white shadow-sm" />
                  <div className="flex-1 h-0.5 bg-demandoo-200 mx-2" />
                  <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow-sm" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[140px]" title={trip.departure_address}>{trip.departure_address}</span>
                  <span className="font-extrabold text-slate-700">
                    {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="truncate max-w-[140px] text-right" title={trip.arrival_address}>{trip.arrival_address}</span>
                </div>
              </div>

              {/* PRICE & CTA */}
              <div className="flex md:flex-col items-center justify-between md:items-end md:w-1/4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-200 inline-block mb-1">
                    {trip.seats_available} place(s) libre(s)
                  </span>
                  <p className="text-xl font-black text-demandoo-600">
                    {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>

                <Link
                  to={`/trajet/${trip.id}`}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-md shadow-demandoo-500/20 active:scale-95 transition-all"
                >
                  Détails & Réserver
                </Link>
              </div>

            </div>
          ))
        )}
      </div>

      {/* CREATE ALERT MODAL */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-elevated border border-slate-100 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-demandoo-dark text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-demandoo-600" />
                Créer une alerte de trajet
              </h3>
              <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {alertSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200">
                <Check className="w-5 h-5 text-emerald-600" />
                Alerte créée avec succès ! Vous serez notifié dès qu'un trajet sera disponible.
              </div>
            ) : (
              <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ville de départ</label>
                  <input
                    type="text"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    placeholder="Ex: Touba"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:border-demandoo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Ex: Dakar"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:border-demandoo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date souhaitée (optionnel)</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:border-demandoo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-extrabold text-white bg-demandoo-500 hover:bg-demandoo-600 shadow-sm"
                  >
                    Enregistrer l'alerte
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
