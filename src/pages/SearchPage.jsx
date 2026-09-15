import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { INITIAL_CITIES, INITIAL_TRIPS } from '../lib/mockData';
import { VerifiedDriverBadge } from '../components/common/Badge';
import { TripCard } from '../components/common/TripCard';
import { TripCardSkeleton } from '../components/common/TripCardSkeleton';
import {
  Search, MapPin, Calendar, Users, Filter, ShieldCheck, Car,
  Star, Bell, Check, X, SlidersHorizontal, ChevronDown,
  Clock, ArrowRight, Navigation, Zap
} from 'lucide-react';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchTrips, createSearchAlert } = useTrips();
  const { user } = useAuth();

  const [departure, setDeparture] = useState(searchParams.get('departure') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [passengers, setPassengers] = useState(parseInt(searchParams.get('passengers') || '1', 10));

  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState('price_asc');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(true);

  // Simulation de chargement asynchrone pour afficher le Skeleton
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [departure, destination, date, passengers, verifiedOnly, maxPrice, sortBy]);

  useEffect(() => {
    setDeparture(searchParams.get('departure') || '');
    setDestination(searchParams.get('destination') || '');
    setDate(searchParams.get('date') || '');
    if (searchParams.get('passengers')) {
      setPassengers(parseInt(searchParams.get('passengers'), 10));
    }
  }, [searchParams]);

  const rawResults = searchTrips({ departure, destination, date, passengers, verifiedOnly, maxPrice });

  const filteredTrips = [...rawResults].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price_per_seat - b.price_per_seat;
    if (sortBy === 'date_asc') return new Date(a.departure_datetime) - new Date(b.departure_datetime);
    if (sortBy === 'rating_desc') return (b.driver?.rating || 0) - (a.driver?.rating || 0);
    return 0;
  });

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (user) {
      createSearchAlert({ userId: user.id, departure_city: departure || 'Toutes villes', arrival_city: destination || 'Toutes villes', date: date || null });
      setAlertSuccess(true);
      setTimeout(() => { setAlertSuccess(false); setShowAlertModal(false); }, 2500);
    } else {
      alert('Veuillez vous connecter pour créer une alerte.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (departure) q.set('departure', departure);
    if (destination) q.set('destination', destination);
    if (date) q.set('date', date);
    if (passengers > 1) q.set('passengers', passengers.toString());
    setSearchParams(q);
  };

  const resetFilters = () => {
    setDeparture(''); setDestination(''); setDate('');
    setVerifiedOnly(false); setMaxPrice(15000); setPassengers(1);
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen">

      {/* ─── HERO BARRE DE RECHERCHE ─── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Trouver un trajet
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                <span className="text-emerald-600 font-black">{filteredTrips.length} trajet{filteredTrips.length !== 1 ? 's' : ''}</span> disponible{filteredTrips.length !== 1 ? 's' : ''} pour vos critères
              </p>
            </div>
            <button
              onClick={() => setShowAlertModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all self-start sm:self-auto"
            >
              <Bell className="w-4 h-4" />
              Créer une alerte
            </button>
          </div>

          {/* Formulaire de recherche Responsive (1 col mobile, 48-52px) */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Navigation className="w-3 h-3 text-emerald-600" /> Départ
              </label>
              <div className="relative">
                <input
                  type="text" list="cities-list" value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  placeholder="Touba"
                  className="w-full px-3.5 py-3.5 sm:py-3 min-h-[48px] rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500" /> Destination
              </label>
              <input
                type="text" list="cities-list" value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Dakar, Thiès…"
                className="w-full px-3.5 py-3.5 sm:py-3 min-h-[48px] rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Date
              </label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-3.5 sm:py-3 min-h-[48px] rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" /> Places
              </label>
              <select
                value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-3.5 sm:py-3 min-h-[48px] rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 bg-slate-50 focus:bg-white transition-all"
              >
                <option value={1}>1 personne</option>
                <option value={2}>2 personnes</option>
                <option value={3}>3 personnes</option>
                <option value={4}>4 personnes</option>
              </select>
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <button
                type="submit"
                className="w-full py-3.5 sm:py-3 min-h-[48px] px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </button>
            </div>

            <datalist id="cities-list">
              {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </form>
        </div>
      </div>

      {/* ─── CONTENU PRINCIPAL ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ─── SIDEBAR FILTRES (desktop) ─── */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-5">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                Filtres
              </h3>

              <div className="space-y-3 pt-1 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Conducteurs vérifiés
                  </span>
                  <div
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${verifiedOnly ? 'bg-emerald-500' : 'bg-slate-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Prix maximum</span>
                  <span className="text-xs font-black text-emerald-700">{maxPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <input
                  type="range" min={1000} max={15000} step={500} value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>1 000</span><span>15 000 FCFA</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4">
                <span className="text-xs font-bold text-slate-700 block">Trier par</span>
                {[
                  { value: 'price_asc', label: 'Prix le plus bas' },
                  { value: 'date_asc', label: 'Heure de départ' },
                  { value: 'rating_desc', label: 'Meilleure note' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${sortBy === opt.value ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={resetFilters}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-2 border-t border-slate-100"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          {/* ─── RÉSULTATS ─── */}
          <div className="flex-1 space-y-4">
            
            {/* Barre filtres mobile + tri */}
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm"
              >
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                Filtres
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <select
                value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="price_asc">Prix croissant</option>
                <option value="date_asc">Heure départ</option>
                <option value="rating_desc">Meilleure note</option>
              </select>
            </div>

            {/* Filtres mobile accordion */}
            {showFilters && (
              <div className="lg:hidden bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Conducteurs vérifiés uniquement
                  </span>
                  <input type="checkbox" checked={verifiedOnly} onChange={e => setVerifiedOnly(e.target.checked)} className="w-4 h-4 text-emerald-500 rounded" />
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Prix max</span>
                    <span className="text-emerald-700">{maxPrice.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <input type="range" min={1000} max={15000} step={500} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value, 10))} className="w-full accent-emerald-500" />
                </div>
              </div>
            )}

            {/* Résultats */}
            {isSearching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <TripCardSkeleton key={i} />)}
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-5">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto border border-emerald-100">
                  <Search className="w-9 h-9 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Aucun trajet disponible</h3>
                  <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                    Aucun conducteur ne propose ce trajet pour le moment. Créez une alerte pour être notifié dès qu'un trajet sera publié.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button onClick={resetFilters} className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Réinitialiser
                  </button>
                  <button onClick={() => setShowAlertModal(true)} className="px-5 py-2.5 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all">
                    <Bell className="w-4 h-4 inline mr-2" />Créer une alerte
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTrips.map((trip, idx) => (
                  <TripCard key={trip.id} trip={trip} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL ALERTE ─── */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-[calc(100%-32px)] max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                Créer une alerte trajet
              </h3>
              <button onClick={() => setShowAlertModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {alertSuccess ? (
              <div className="p-5 bg-emerald-50 text-emerald-800 rounded-2xl text-center font-bold text-sm flex flex-col items-center gap-2 border border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                Alerte créée avec succès !<br />
                <span className="text-xs font-medium text-emerald-600">Nous vous notifierons dès qu'un trajet sera disponible.</span>
              </div>
            ) : (
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Ville de départ</label>
                  <input type="text" value={departure} onChange={e => setDeparture(e.target.value)} placeholder="Ex: Touba" required
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Destination</label>
                  <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Ex: Dakar" required
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Date souhaitée <span className="font-normal text-slate-400">(optionnel)</span></label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAlertModal(false)}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Annuler
                  </button>
                  <button type="submit"
                    className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all">
                    Enregistrer
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
