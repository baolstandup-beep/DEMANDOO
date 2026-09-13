import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { INITIAL_CITIES } from '../lib/mockData';
import { NationalCoverageSection } from '../components/common/InteractiveMap';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle,
  Quote,
  TrendingUp,
  Map,
  BadgeCheck,
  Star,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { createWaveCheckout } from '../services/afrotoolsService';

export const HomePage = () => {
  const navigate = useNavigate();

  const { trips, partners = [], reviews = [] } = useTrips();
  const { user, subscribeDriver } = useAuth();
  const { addNotification } = useNotifications();

  const [departure, setDeparture] = useState('Touba');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  const handleSubscribe = async (planId, price, tripLimit) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role === 'passenger') {
      addNotification({ title: 'Accès refusé', message: 'Seuls les chauffeurs peuvent souscrire à un abonnement.', type: 'error' });
      return;
    }

    if (user.driver_status !== 'VERIFIED') {
      addNotification({ title: "Vérification requise", message: "Votre profil chauffeur doit être vérifié avant de souscrire.", type: "error" });
      navigate('/verification-chauffeur');
      return;
    }

    setIsProcessing(true);
    setProcessingPlan(planId);

    try {
      if (price > 0) {
        await createWaveCheckout({
          amount: price,
          clientReference: `demandoo_sub_${planId}_${user.id}_${Date.now()}`,
          clientPhone: user.phone || ''
        });
      }

      const result = await subscribeDriver(planId, 'monthly', tripLimit);
      
      if (result.success) {
        addNotification({
          title: "Abonnement activé !",
          message: price === 0 ? "Votre accès Découverte est actif." : `Votre abonnement a été réglé avec succès via Wave et est actif.`,
          type: "success"
        });
        navigate('/espace-chauffeur');
      } else {
        throw new Error("Erreur de souscription");
      }
    } catch (error) {
      addNotification({ title: "Erreur", message: "Une erreur est survenue lors de l'activation.", type: "error" });
    } finally {
      setIsProcessing(false);
      setProcessingPlan(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (departure) query.set('departure', departure);
    if (destination) query.set('destination', destination);
    if (date) query.set('date', date);
    if (passengers > 1) query.set('passengers', passengers.toString());

    navigate(`/trajets?${query.toString()}`);
  };

  const setPopularRoute = (dep, arr) => {
    setDeparture(dep);
    setDestination(arr);
    navigate(`/trajets?departure=${dep}&destination=${arr}`);
  };

  const handleSwap = () => {
    const temp = departure;
    setDeparture(destination);
    setDestination(temp);
  };

  return (
    <div className="font-sans bg-[#F9FAFB]">
      
      {/* ===================================================
          1. HERO SECTION (Abib Digit Style: Massive Dark Hero)
         =================================================== */}
      <section className="relative min-h-[90vh] bg-[#0A0A0A] flex flex-col justify-center items-center overflow-hidden pt-20 pb-24">
        
        {/* Image de fond Demandoo */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/demandoo-hero.png" 
            alt="Demandoo — Yombalna Sa Tukki — Covoiturage Touba Sénégal" 
            className="w-full h-full object-cover object-center opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/50 to-[#F9FAFB]" />
        </div>

        {/* Abstract Dark Glows (conservés pour l'effet SaaS) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-demandoo-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-12">
          
          <div className="text-center space-y-6 max-w-4xl mx-auto mt-10">
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] drop-shadow-md">
              Le covoiturage de confiance de <span className="text-demandoo-400 relative inline-block">Touba<svg className="absolute -bottom-2 left-0 w-full h-3 text-demandoo-500/50" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg></span> vers tout le Sénégal.
            </h1>
            <p className="text-lg sm:text-xl text-slate-100 font-medium max-w-2xl mx-auto drop-shadow-sm">
              Réservez ou proposez des trajets partagés sûrs et abordables vers Dakar, Thiès, Saint-Louis, Mbacké et bien d'autres villes.
            </p>
          </div>

        {/* SEARCH BAR (White Card Style) */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white p-3 sm:p-4 rounded-[2rem] shadow-2xl border border-slate-100 relative">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center">
                
                {/* Départ */}
                <div className="flex-1 w-full relative flex items-center group px-2 sm:px-4 py-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <MapPin className="w-5 h-5 text-slate-400 group-hover:text-demandoo-500 transition-colors" />
                  <input
                    type="text"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    placeholder="Départ"
                    className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-900 font-extrabold placeholder:text-slate-400 focus:outline-none text-lg"
                  />
                </div>

                {/* Swap Button (Absolute center on desktop) */}
                <div className="hidden sm:flex items-center justify-center relative w-0 z-10">
                  <button 
                    type="button" 
                    onClick={handleSwap}
                    className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-demandoo-600 hover:border-demandoo-300 hover:shadow-md hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
                    title="Inverser"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-right"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
                  </button>
                </div>

                <div className="hidden sm:block w-px h-12 bg-slate-200" />

                {/* Destination */}
                <div className="flex-1 w-full relative flex items-center group px-2 sm:px-4 py-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <MapPin className="w-5 h-5 text-slate-400 group-hover:text-demandoo-500 transition-colors" />
                  <input
                    type="text"
                    list="cities-list"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination"
                    className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-900 font-extrabold placeholder:text-slate-400 focus:outline-none text-lg"
                  />
                </div>

                <div className="hidden sm:block w-px h-12 bg-slate-200" />

                {/* Date */}
                <div className="flex-1 w-full relative flex items-center group px-2 sm:px-4 py-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <Calendar className="w-5 h-5 text-slate-400 group-hover:text-demandoo-500 transition-colors" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-3 pr-4 py-3 bg-transparent text-slate-900 font-extrabold focus:outline-none text-lg"
                  />
                </div>

                <div className="hidden sm:block w-px h-12 bg-slate-200" />

                {/* Passagers */}
                <div className="w-full sm:w-32 relative flex items-center group px-2 sm:px-4 py-2 hover:bg-slate-50 rounded-2xl transition-colors">
                  <Users className="w-5 h-5 text-slate-400 group-hover:text-demandoo-500 transition-colors" />
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full pl-3 pr-2 py-3 bg-transparent text-slate-900 font-extrabold focus:outline-none text-lg"
                  />
                </div>

                {/* Search Button */}
                <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:ml-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-5 rounded-2xl text-base font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    Rechercher
                  </button>
                </div>

                <datalist id="cities-list">
                  {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </form>
            </div>
            
            {/* CTA Devenir Chauffeur */}
            <div className="mt-6 flex justify-center">
              <Link
                to="/publier"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold backdrop-blur-md transition-all hover:scale-105"
              >
                Vous êtes conducteur ? Publiez un trajet
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 animate-pulse">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Découvrir</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
        </div>
      </section>

      {/* ===================================================
          2. DERNIERS TRAJETS PUBLIÉS (DYNAMIC)
         =================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Trajets récents</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl">
              Découvrez les derniers trajets ajoutés par notre communauté de chauffeurs vérifiés.
            </p>
          </div>
          <Link to="/trajets" className="shrink-0 px-6 py-3 rounded-xl bg-demandoo-50 text-demandoo-700 font-bold hover:bg-demandoo-100 transition-colors flex items-center gap-2">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.filter(t => t.status === 'scheduled').slice(0, 3).map(trip => (
            <div key={trip.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-all flex flex-col justify-between space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img src={trip.driver?.avatar_url} alt={trip.driver?.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-demandoo-500 shadow-sm" />
                  <div>
                    <h4 className="font-black text-slate-900 text-sm flex items-center gap-1">
                      {trip.driver?.full_name}
                      {trip.driver?.is_identity_verified && <ShieldCheck className="w-3.5 h-3.5 text-demandoo-500" />}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {trip.driver?.rating} • {trip.driver?.total_trips} trajets
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 font-black text-xs">
                  {trip.seats_available} places
                </div>
              </div>

              <div className="relative pl-6 space-y-4 border-l-2 border-slate-100">
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-demandoo-500 border-4 border-white shadow-sm" />
                  <p className="font-black text-slate-900">{trip.departure_city}</p>
                  <p className="text-xs text-slate-500">{new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-800 border-4 border-white shadow-sm" />
                  <p className="font-black text-slate-900">{trip.arrival_city}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-2xl font-black text-demandoo-600">{trip.price_per_seat.toLocaleString('fr-FR')} FCFA</p>
                <Link to={`/trajet/${trip.id}`} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors">
                  Réserver
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================
          3. NOS RÉALISATIONS (POPULAR ROUTES PORTFOLIO)
         =================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 border-t border-slate-100">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Trajets Phares</h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Découvrez nos itinéraires les plus populaires. Des voyages quotidiens connectant tout le pays.
          </p>
        </div>

        {/* Grille : 3 par ligne sur grand écran (2 colonnes/lignes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Project 1 */}
          <div 
            onClick={() => setPopularRoute('Touba', 'Dakar')}
            className="group relative h-[220px] sm:h-[260px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg shadow-slate-200/50 w-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=800" 
              onError={(e) => {e.target.src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}}
              alt="Touba - Dakar (Monument de la Renaissance)" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-5 w-full flex items-end justify-between">
              <div>
                <span className="text-demandoo-400 font-black text-[10px] uppercase tracking-widest block mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                  Ligne Express
                </span>
                <h3 className="text-xl font-black text-white">Touba → Dakar</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500 delay-100 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Project 2 */}
          <div 
            onClick={() => setPopularRoute('Touba', 'Thiès')}
            className="group relative h-[220px] sm:h-[260px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg shadow-slate-200/50 w-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1549429158-b64ec069f257?auto=format&fit=crop&q=80&w=800" 
              onError={(e) => {e.target.src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}}
              alt="Touba - Thiès (Statue Lat Dior)" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              style={{ objectPosition: 'center 22%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-5 w-full flex items-end justify-between">
              <div>
                <span className="text-demandoo-400 font-black text-[10px] uppercase tracking-widest block mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                  Idéal Étudiants
                </span>
                <h3 className="text-xl font-black text-white">Touba → Thiès</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500 delay-100 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Project 3 */}
          <div 
            onClick={() => setPopularRoute('Touba', 'Mbour')}
            className="group relative h-[220px] sm:h-[260px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg shadow-slate-200/50 w-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800" 
              onError={(e) => {e.target.src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}}
              alt="Touba - Mbour (Saly & Plage de Mbour)" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-5 w-full flex items-end justify-between">
              <div>
                <span className="text-demandoo-400 font-black text-[10px] uppercase tracking-widest block mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                  Trajet Côtier
                </span>
                <h3 className="text-xl font-black text-white">Touba → Mbour</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500 delay-100 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Project 4 */}
          <div 
            onClick={() => setPopularRoute('Touba', 'Saint-Louis')}
            className="group relative h-[220px] sm:h-[260px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg shadow-slate-200/50 w-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&q=80&w=800" 
              onError={(e) => {e.target.src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}}
              alt="Touba - Saint-Louis (Pont Faidherbe)" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-5 w-full flex items-end justify-between">
              <div>
                <span className="text-demandoo-400 font-black text-[10px] uppercase tracking-widest block mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                  Le Nord
                </span>
                <h3 className="text-xl font-black text-white">Touba → Saint-Louis</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500 delay-100 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Project 5 */}
          <div 
            onClick={() => setPopularRoute('Touba', 'Kaolack')}
            className="group relative h-[220px] sm:h-[260px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg shadow-slate-200/50 w-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1548050689-d4cc2fbfa3fa?auto=format&fit=crop&q=80&w=800" 
              onError={(e) => {e.target.src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}}
              alt="Touba - Kaolack" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-5 w-full flex items-end justify-between">
              <div>
                <span className="text-demandoo-400 font-black text-[10px] uppercase tracking-widest block mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                  Le Centre
                </span>
                <h3 className="text-xl font-black text-white">Touba → Kaolack</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500 delay-100 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Project 6 */}
          <div 
            onClick={() => setPopularRoute('Touba', 'Ziguinchor')}
            className="group relative h-[220px] sm:h-[260px] rounded-[2rem] overflow-hidden cursor-pointer shadow-lg shadow-slate-200/50 w-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1528277342758-f1d7613953a2?auto=format&fit=crop&q=80&w=800" 
              onError={(e) => {e.target.src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"}}
              alt="Touba - Ziguinchor" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/30 to-transparent transition-opacity group-hover:opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-5 w-full flex items-end justify-between">
              <div>
                <span className="text-demandoo-400 font-black text-[10px] uppercase tracking-widest block mb-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
                  Le Sud
                </span>
                <h3 className="text-xl font-black text-white">Touba → Ziguinchor</h3>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-500 delay-100 shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===================================================
          3.5 CARTE INTERACTIVE (NationalCoverageSection)
         =================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <NationalCoverageSection />
      </div>

      {/* ===================================================
          3. MISSION & ATOUTS (AGENCY BENTO GRID)
         =================================================== */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Mission et Vision</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              En tant que plateforme leader au Sénégal, notre mission est de vous assister pleinement dans vos déplacements quotidiens avec un niveau d'exigence sans compromis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Sécurité */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-10 sm:p-12 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-200 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-64 h-64 bg-demandoo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:bg-demandoo-50 transition-all duration-500">
                  <ShieldCheck className="w-8 h-8 text-demandoo-600" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-demandoo-600 transition-colors duration-300">Sécurité Maximale</h3>
                  <p className="text-slate-500 font-medium max-w-md text-lg leading-relaxed">
                    Chaque chauffeur est rigoureusement vérifié (CNI, Permis). Votre sécurité est la fondation absolue de notre réseau.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Économique */}
            <div className="bg-slate-50 rounded-[2rem] p-10 sm:p-12 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-200 transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-100 group-hover:rotate-12 transition-transform duration-500">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Économique</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    Partagez les frais de route. Le moyen le plus abordable et convivial de voyager.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Couverture */}
            <div className="bg-slate-50 rounded-[2rem] p-10 sm:p-12 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-200 transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-100 group-hover:-rotate-12 transition-transform duration-500">
                  <Map className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Couverture</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    De Saint-Louis à Ziguinchor, trouvez un trajet partout dans le pays.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Support */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-10 sm:p-12 relative overflow-hidden group shadow-sm hover:shadow-xl hover:shadow-slate-200/50 border border-slate-200 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] translate-y-1/3 translate-x-1/3 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                  <BadgeCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="max-w-xl">
                  <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">Support 24/7 & Assistance</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    Notre équipe est disponible à tout moment. Vous n'êtes jamais seul sur la route, Demandoo veille sur votre trajet de A à Z.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================
          3.5. ABONNEMENTS CHAUFFEURS
         =================================================== */}
      <section id="abonnements" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Abonnements Chauffeurs</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Maximisez vos revenus. Gardez 100% de ce que vous gagnez avec nos offres pensées pour vous.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Découverte */}
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Découverte</h3>
              <div className="text-4xl font-black text-slate-900 mb-6">0 FCFA</div>
              <p className="text-slate-500 font-medium mb-8">Testez Demandoo et trouvez vos premiers passagers sans engagement.</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Création de profil gratuite
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  1 trajet au total
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Zéro commission sur vos gains
                </li>
              </ul>
              <button 
                onClick={() => handleSubscribe('trial', 0, 1)}
                disabled={isProcessing}
                className="block w-full py-4 text-center rounded-xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing && processingPlan === 'trial' && <Loader2 className="w-5 h-5 animate-spin" />}
                Essayer gratuitement
              </button>
            </div>

            {/* Standard */}
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-demandoo-50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="inline-block px-4 py-1 bg-demandoo-100 text-demandoo-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">Populaire</div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Standard</h3>
                <div className="text-4xl font-black text-demandoo-600 mb-6">2 500 FCFA<span className="text-lg text-slate-400 font-medium">/mois</span></div>
                <p className="text-slate-500 font-medium mb-8">Idéal pour les conducteurs réguliers qui partagent leurs frais le week-end.</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-demandoo-500" />
                    Jusqu'à 4 trajets par mois
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-demandoo-500" />
                    Support client prioritaire
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-demandoo-500" />
                    Zéro commission
                  </li>
                </ul>
                <button 
                  onClick={() => handleSubscribe('standard', 2500, 4)}
                  disabled={isProcessing}
                  className="block w-full py-4 text-center rounded-xl bg-demandoo-600 text-white font-black hover:bg-demandoo-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing && processingPlan === 'standard' && <Loader2 className="w-5 h-5 animate-spin" />}
                  Passer Standard
                </button>
              </div>
            </div>

            {/* Pass Pro */}
            <div className="bg-slate-900 rounded-[2rem] p-10 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 text-slate-200">Recommandé</div>
                <h3 className="text-2xl font-black mb-2">Pro</h3>
                <div className="text-4xl font-black mb-6">5 000 FCFA<span className="text-lg text-slate-400 font-medium">/mois</span></div>
                <p className="text-slate-400 font-medium mb-8">Pour les professionnels de la route qui veulent maximiser leur rentabilité sans limite.</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Trajets illimités chaque mois
                  </li>
                  <li className="flex items-center gap-3 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Visibilité prioritaire dans les résultats
                  </li>
                  <li className="flex items-center gap-3 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    Badge "Chauffeur Pro"
                  </li>
                </ul>
                <button 
                  onClick={() => handleSubscribe('pro', 5000, 999999)}
                  disabled={isProcessing}
                  className="block w-full py-4 text-center rounded-xl bg-white text-slate-900 font-black hover:bg-slate-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  {isProcessing && processingPlan === 'pro' && <Loader2 className="w-5 h-5 animate-spin" />}
                  Devenir Pro
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================================================
          4. TÉMOIGNAGES (CEO QUOTE STYLE)
         =================================================== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Témoignages</h2>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            Ce que disent nos utilisateurs de leur expérience Demandoo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
            <Quote className="w-8 h-8 text-demandoo-200" />
            <p className="text-sm font-bold text-slate-700 leading-relaxed italic flex-1">
              "Exceptionnel pour sécuriser nos trajets. Compétents et très pros. Un réel plaisir pour mes déplacements."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?u=1" alt="Passager" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs">Mamadou Ndiaye</h4>
                <p className="text-[10px] text-demandoo-600 font-bold uppercase tracking-wider">Passager</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
            <Quote className="w-8 h-8 text-demandoo-200" />
            <p className="text-sm font-bold text-slate-700 leading-relaxed italic flex-1">
              "Profonde gratitude envers l'équipe. Mon véhicule ne voyage plus jamais à vide et l'app est fluide."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?u=2" alt="Chauffeur" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs">Ousmane Diop</h4>
                <p className="text-[10px] text-demandoo-600 font-bold uppercase tracking-wider">Chauffeur</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
            <Quote className="w-8 h-8 text-demandoo-200" />
            <p className="text-sm font-bold text-slate-700 leading-relaxed italic flex-1">
              "Je gagne un temps fou pour trouver un taxi fiable. Les tarifs sont justes et la sécurité est au top."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?u=3" alt="Passager" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs">Awa Sy</h4>
                <p className="text-[10px] text-demandoo-600 font-bold uppercase tracking-wider">Étudiante</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform">
            <Quote className="w-8 h-8 text-demandoo-200" />
            <p className="text-sm font-bold text-slate-700 leading-relaxed italic flex-1">
              "L'application est très intuitive. Le support client est réactif et les passagers toujours ponctuels."
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden shrink-0">
                <img src="https://i.pravatar.cc/150?u=4" alt="Passager" className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-xs">Cheikh Kane</h4>
                <p className="text-[10px] text-demandoo-600 font-bold uppercase tracking-wider">Passager</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA FOOTER PRE-FOOTER */}
      <section className="bg-demandoo-600 py-20 text-center px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Collaborez avec Demandoo</h2>
          <p className="text-demandoo-100 font-medium text-lg">
            Rejoignez-nous dès aujourd'hui. Que vous soyez passager ou chauffeur, faites partie de notre aventure pour façonner la mobilité de demain au Sénégal.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link to="/publier" className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-colors">
              Devenir Chauffeur
            </Link>
            <Link to="/trajets" className="px-8 py-4 rounded-2xl bg-white text-demandoo-600 font-black hover:bg-slate-50 transition-colors">
              Rechercher un trajet
            </Link>
          </div>
        </div>
      </section>

      {/* ===================================================
          5. NOS PARTENAIRES
         =================================================== */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Nos partenaires</h2>
            <div className="w-16 h-1 bg-demandoo-500 mx-auto rounded-full mt-2 mb-6"></div>
            <p className="text-lg text-slate-700 font-bold max-w-2xl mx-auto">
              Ensemble, nous construisons une mobilité plus simple, accessible et fiable au Sénégal.
            </p>
            <p className="text-sm text-slate-500 font-medium max-w-2xl mx-auto">
              Demandoo collabore avec des acteurs de confiance pour améliorer l’expérience de nos passagers et conducteurs.
            </p>
          </div>

          {/* Carrousel de Partenaires (Défilement continu vers la gauche) */}
          <div className="relative overflow-hidden w-full flex">
            {/* Dégradés pour masquer les bords (facultatif mais plus premium) */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            <div className="flex gap-6 animate-marquee min-w-max">
              {[
                "Wave Sénégal", 
                "Orange Money", 
                "LigdiCash", 
                "Bictorys", 
                "Free Money", 
                "TotalEnergies", 
                "Touba Transport"
              ].map((partner, index) => (
                <div 
                  key={index}
                  className="bg-white border border-slate-100 rounded-2xl p-8 flex items-center justify-center w-48 sm:w-64 h-32 shadow-sm hover:shadow-md hover:border-demandoo-300 transition-all duration-300 group shrink-0 cursor-default"
                >
                  <div className="text-center space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <p className="text-lg font-black text-slate-800">{partner}</p>
                    <p className="text-[10px] font-bold text-demandoo-600 uppercase tracking-widest">Partenaire</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
