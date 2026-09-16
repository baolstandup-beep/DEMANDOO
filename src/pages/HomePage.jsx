import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { INITIAL_CITIES } from '../lib/mockData';
import InteractiveMap from '../components/common/InteractiveMap';
import { 
  Search,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  MapPin,
  Calendar,
  Users,
  Star,
  Car,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Shield,
  Smartphone,
  Check,
  Zap,
  Handshake,
  Building2
} from 'lucide-react';

import { Reveal } from '../components/common/Reveal';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { TripCard } from '../components/common/TripCard';

// Liste des Partenaires de Confiance (Format Carré avec Défilement)
const PARTNERS_LIST = [
  {
    id: 'wave',
    name: 'Wave Sénégal',
    category: 'Paiement Mobile',
    logo: '/images/partners/wave.png',
    initials: '🌊',
    bgBadge: 'bg-sky-50 text-sky-600 border border-sky-100',
  },
  {
    id: 'orange-money',
    name: 'Orange Money',
    category: 'Mobile Money',
    logo: '/images/partners/orange.png',
    initials: '🍊',
    bgBadge: 'bg-orange-50 text-orange-600 border border-orange-100',
  },
  {
    id: 'free-money',
    name: 'Free Money',
    category: 'Paiement Télécom',
    logo: '/images/partners/freemoney.png',
    initials: '🔴',
    bgBadge: 'bg-red-50 text-red-600 border border-red-100',
  },
  {
    id: 'totalenergies',
    name: 'TotalEnergies',
    category: 'Énergie & Stations',
    logo: '/images/partners/total.png',
    initials: '⛽',
    bgBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  },
  {
    id: 'ola-energy',
    name: 'Ola Energy',
    category: 'Stations & Carburant',
    logo: '/images/partners/ola.png',
    initials: '⚡',
    bgBadge: 'bg-blue-50 text-blue-600 border border-blue-100',
  },
  {
    id: 'axa',
    name: 'AXA Assurances',
    category: 'Protection Trajet',
    logo: '/images/partners/axa.png',
    initials: '🛡️',
    bgBadge: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  },
  {
    id: 'sunu',
    name: 'Sunu Assurances',
    category: 'Sécurité Voyage',
    logo: '/images/partners/sunu.png',
    initials: '☀️',
    bgBadge: 'bg-amber-50 text-amber-600 border border-amber-100',
  },
  {
    id: 'baux-maraichers',
    name: 'Baux Maraîchers',
    category: 'Gare Routière Dakar',
    logo: '/images/partners/baux.png',
    initials: '🚌',
    bgBadge: 'bg-teal-50 text-teal-700 border border-teal-100',
  },
  {
    id: 'aibd',
    name: 'AIBD Express',
    category: 'Liaisons Aéroport',
    logo: '/images/partners/aibd.png',
    initials: '✈️',
    bgBadge: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
  },
  {
    id: 'touba-gare',
    name: 'Gare de Touba',
    category: 'Pôle Régional',
    logo: '/images/partners/touba.png',
    initials: '🕌',
    bgBadge: 'bg-demandoo-50 text-demandoo-700 border border-demandoo-100',
  }
];

const AnimatedBackground = () => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0, triggerOnce: false });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => setIsActive(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div 
      ref={ref}
      className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none mix-blend-overlay"
      style={{ animationPlayState: (isVisible && isActive) ? 'running' : 'paused' }}
    ></div>
  );
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { trips } = useTrips();

  const [departure, setDeparture] = useState('Touba');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);

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
  
  // Real trips only
  const availableTrips = trips.filter(t => t.status === 'scheduled').slice(0, 6);

  const featuredDestinations = [
    { from: "Touba", to: "Dakar", price: "5 000 FCFA", time: "2h 30m", image: "/images/touba-dakar.jpg", tag: "Très populaire" },
    { from: "Dakar", to: "Saint-Louis", price: "7 000 FCFA", time: "3h 45m", image: "/images/saint-louis-faidherbe.jpg", tag: "Côtier" },
    { from: "Touba", to: "Thiès", price: "4 000 FCFA", time: "1h 45m", image: "/images/thies-lat-dior.jpg", tag: "Direct" },
    { from: "Dakar", to: "Mbour (Saly)", price: "4 000 FCFA", time: "1h 15m", image: "/images/mbour-saly.jpg", tag: "Week-end" },
  ];

  return (
    <div className="font-sans bg-[#F8FAFC] text-slate-900 selection:bg-demandoo-500 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Style moderne & épuré avec widget de recherche flottant) */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-[#0F172A] via-[#0D2836] to-[#0A1A24] text-white pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden border-b border-slate-800/80">
        <AnimatedBackground />

        {/* Halos lumineux d'ambiance */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-demandoo-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Colonne Gauche : Titre, Slogan & Badge */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <Reveal delay={100}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs sm:text-sm font-bold text-emerald-300 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Le covoiturage n°1 de confiance au Sénégal</span>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                  Votre prochain voyage <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-demandoo-400 via-emerald-300 to-amber-300">
                    est prêt à partir.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={300}>
                <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Voyagez confortablement entre Dakar, Touba, Saint-Louis, Thiès et toutes les régions avec des conducteurs vérifiés et à des tarifs justes.
                </p>
              </Reveal>

              {/* Puces de confiance rapides */}
              <Reveal delay={400}>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs sm:text-sm font-semibold text-slate-300">
                  <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Large choix de départs</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Réservation directe WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>100% Chauffeurs Contrôlés</span>
                  </div>
                </div>
              </Reveal>

            </div>

            {/* Colonne Droite : Visuel Véhicule avec Badges Flottants */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <Reveal delay={300} className="w-full">
                <div className="relative w-full max-w-[500px] mx-auto">
                  
                  {/* Halo sous le véhicule */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-demandoo-500/20 to-transparent rounded-full blur-2xl transform scale-90 pointer-events-none" />

                  {/* Image Véhicule */}
                  <img 
                    src="/images/UUU.png" 
                    alt="Véhicule Demandoo Covoiturage Sénégal"
                    className="relative z-10 w-full h-auto object-contain transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/hero-banner-800.webp";
                    }}
                  />

                  {/* Floating Badge 1: Note et avis */}
                  <div className="absolute -top-4 -left-4 sm:top-2 sm:left-0 z-20 bg-white/90 backdrop-blur-md text-slate-900 p-3 rounded-2xl shadow-xl border border-white/40 flex items-center gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-black shrink-0">
                      <Star className="w-5 h-5 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">4.9 / 5</p>
                      <p className="text-[10px] font-bold text-slate-500">+1 200 avis vérifiés</p>
                    </div>
                  </div>

                  {/* Floating Badge 2: Conducteurs vérifiés */}
                  <div className="absolute -bottom-4 -right-2 sm:bottom-0 sm:right-2 z-20 bg-white/90 backdrop-blur-md text-slate-900 p-3 rounded-2xl shadow-xl border border-white/40 flex items-center gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-demandoo-100 flex items-center justify-center text-demandoo-600 font-black shrink-0">
                      <ShieldCheck className="w-5 h-5 text-demandoo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">100% Vérifiés</p>
                      <p className="text-[10px] font-bold text-slate-500">CNI & Permis validés</p>
                    </div>
                  </div>

                </div>
              </Reveal>
            </div>

          </div>

          {/* ========================================================= */}
          {/* BARRE DE RECHERCHE FLOTTANTE HORIZONTALE (Modern Widget) */}
          {/* ========================================================= */}
          <Reveal delay={400} className="w-full mt-10 lg:mt-14">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black/25 border border-slate-100 text-slate-900">
              <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                
                {/* 1. Départ */}
                <div className="lg:col-span-3 flex items-center gap-3 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-demandoo-500/20 p-3 rounded-2xl border border-slate-200/80 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="w-full text-left">
                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Départ</span>
                    <input 
                      type="text" 
                      value={departure} 
                      onChange={(e) => setDeparture(e.target.value)} 
                      placeholder="Ex: Touba" 
                      className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none placeholder:text-slate-400" 
                      required
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleSwap} 
                    title="Inverser" 
                    className="p-1 text-slate-400 hover:text-demandoo-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </button>
                </div>

                {/* 2. Destination */}
                <div className="lg:col-span-3 flex items-center gap-3 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-demandoo-500/20 p-3 rounded-2xl border border-slate-200/80 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="w-full text-left">
                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Destination</span>
                    <input 
                      type="text" 
                      list="home-cities-list" 
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)} 
                      placeholder="Ex: Dakar, Saint-Louis..." 
                      className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none placeholder:text-slate-400" 
                    />
                  </div>
                </div>

                {/* 3. Date */}
                <div className="lg:col-span-3 flex items-center gap-3 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-demandoo-500/20 p-3 rounded-2xl border border-slate-200/80 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="w-full text-left">
                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Date du voyage</span>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                      className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none cursor-pointer" 
                    />
                  </div>
                </div>

                {/* 4. Passagers & Bouton Rechercher */}
                <div className="lg:col-span-3 flex items-center gap-2">
                  <div className="w-24 shrink-0 flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <Users className="w-4 h-4 text-demandoo-600 shrink-0" />
                    <input 
                      type="number" 
                      min="1" 
                      max="8" 
                      value={passengers} 
                      onChange={(e) => setPassengers(e.target.value)} 
                      className="w-full bg-transparent font-bold text-slate-900 text-sm focus:outline-none text-center" 
                      title="Nombre de passagers"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="flex-1 min-h-[48px] py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-lg shadow-demandoo-500/30 hover:shadow-demandoo-500/50 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Rechercher</span>
                  </button>
                </div>

              </form>
            </div>
          </Reveal>

          <datalist id="home-cities-list">
            {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
          </datalist>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SERVICES & AVANTAGES DEMANDOO (4 Cards Grid comme sur la référence) */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <Reveal>
              <span className="text-xs font-black uppercase tracking-widest text-demandoo-600">Nos Services & Engagements</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Pourquoi voyager avec Demandoo ?</h2>
              <p className="text-sm sm:text-base text-slate-500 font-medium">Une expérience de covoiturage moderne, humaine et pensée pour le Sénégal.</p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1 */}
            <Reveal delay={100}>
              <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-demandoo-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-100 text-demandoo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Covoiturage Interurbain</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Voyagez directement de ville à ville sans les attentes interminables des gares routières.
                </p>
              </div>
            </Reveal>

            {/* Service 2 */}
            <Reveal delay={200}>
              <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-demandoo-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Contact Direct WhatsApp</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Échangez directement avec le chauffeur par WhatsApp ou appel pour fixer le lieu de départ.
                </p>
              </div>
            </Reveal>

            {/* Service 3 */}
            <Reveal delay={300}>
              <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-demandoo-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Chauffeurs Vérifiés</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Chaque profil est soumis à une vérification rigoureuse du permis et de la pièce d'identité.
                </p>
              </div>
            </Reveal>

            {/* Service 4 */}
            <Reveal delay={400}>
              <div className="p-6 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-demandoo-200 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Paiement Simple & Transparent</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Zéro commission cachée : réglez votre trajet en espèces ou via Wave / Orange Money.
                </p>
              </div>
            </Reveal>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRAJETS POPULAIRES (Featured Routes - Cards Grid) */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <Reveal>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-demandoo-600">Départs fréquents</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trajets & Destinations Populaires</h2>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <Link 
              to="/trajets" 
              className="group px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold text-sm hover:bg-demandoo-50 hover:border-demandoo-200 transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Voir tous les trajets</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-demandoo-600" />
            </Link>
          </Reveal>
        </div>

        {/* Trajets en direct ou cartes phares */}
        {availableTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTrips.map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} index={idx} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((dest, i) => (
              <Reveal key={i} delay={i * 100}>
                <div 
                  onClick={() => setPopularRoute(dest.from, dest.to)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-demandoo-300 transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img 
                      src={dest.image} 
                      alt={`${dest.from} - ${dest.to}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-black">
                      {dest.tag}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-demandoo-600 text-white px-3 py-1 rounded-xl text-xs font-black shadow-md">
                      {dest.price}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                        <span>{dest.from}</span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-demandoo-600 transition-colors" />
                        <span>{dest.to}</span>
                      </h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                        <Clock className="w-3.5 h-3.5" /> Durée estimée : {dest.time}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-demandoo-600">
                      <span>Réserver une place</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 4. COMMENT ÇA MARCHE EN 3 ÉTAPES (Split Layout avec Image & Steps) */}
      {/* ========================================================================= */}
      <section id="comment-ca-marche" className="py-16 lg:py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Image Illustration Gauche */}
            <div className="lg:col-span-6 relative">
              <Reveal delay={150}>
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                  <img 
                    src="/hero-banner.jpg" 
                    alt="Voyagez facilement avec Demandoo" 
                    className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/hero-natural.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Voyagez Confortablement</p>
                    <h3 className="text-2xl font-black mt-1">Plus de 50 000 passagers ont voyagé en toute sérénité.</h3>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* 3 Étapes à droite */}
            <div className="lg:col-span-6 space-y-6">
              
              <Reveal>
                <span className="text-xs font-black uppercase tracking-widest text-demandoo-600">Simplicité & Rapidité</span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                  Le Covoiturage Simple <br />
                  en 3 Étapes Faciles
                </h2>
              </Reveal>

              <div className="space-y-4 pt-2">
                
                {/* Étape 1 */}
                <Reveal delay={100}>
                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-demandoo-200 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-demandoo-600 text-white font-black flex items-center justify-center shrink-0 shadow-md">
                      01
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 mb-1">Recherchez votre trajet</h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Renseignez votre ville de départ, votre destination et la date souhaitée pour découvrir tous les départs.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Étape 2 */}
                <Reveal delay={200}>
                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-demandoo-200 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 shadow-md">
                      02
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 mb-1">Contactez le conducteur</h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Discutez en direct via WhatsApp ou téléphone pour valider l'horaire précis et le point de rendez-vous.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Étape 3 */}
                <Reveal delay={300}>
                  <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-demandoo-200 hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center shrink-0 shadow-md">
                      03
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900 mb-1">Voyagez & Réglez directement</h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Embarquez confortablement et réglez votre place directement avec le chauffeur en espèces ou par Wave.
                      </p>
                    </div>
                  </div>
                </Reveal>

              </div>

              <Reveal delay={400}>
                <Link 
                  to="/trajets" 
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-xl hover:shadow-2xl transition-all"
                >
                  <span>Trouver un trajet maintenant</span>
                  <ArrowRight className="w-4 h-4 text-demandoo-400" />
                </Link>
              </Reveal>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BANNIÈRE CONDUCTEUR (Gagnez plus en partageant vos trajets) */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative rounded-[2.5rem] bg-gradient-to-r from-demandoo-700 via-demandoo-600 to-teal-800 text-white overflow-hidden p-8 sm:p-12 lg:p-16 shadow-2xl">
            
            {/* Texture de fond */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              <div className="lg:col-span-8 space-y-4">
                <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                  Espace Conducteurs
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                  Vous avez une voiture ? <br />
                  Rentabilisez vos trajets au Sénégal.
                </h2>
                <p className="text-sm sm:text-base text-slate-100 max-w-xl font-medium leading-relaxed">
                  Partagez vos frais de carburant et gagnez jusqu'à 300 000 FCFA par mois en publiant vos places libres.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
                <Link 
                  to="/publier" 
                  className="px-8 py-4 rounded-2xl bg-white text-demandoo-700 hover:bg-slate-50 font-black text-sm text-center shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Publier un trajet</span>
                </Link>
                <Link 
                  to="/inscription-chauffeur" 
                  className="px-8 py-4 rounded-2xl bg-demandoo-800/60 hover:bg-demandoo-800/80 border border-white/20 text-white font-black text-sm text-center transition-all flex items-center justify-center gap-2"
                >
                  <span>Devenir Chauffeur</span>
                </Link>
              </div>

            </div>

          </div>
        </Reveal>
      </section>

      {/* ========================================================================= */}
      {/* 5. BIS - FORMULES D'ABONNEMENT CONDUCTEURS (0% Commission) */}
      {/* ========================================================================= */}
      <section id="abonnements" className="py-16 lg:py-24 bg-slate-50 border-t border-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header de section */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-demandoo-100 text-demandoo-700 text-xs font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Formules Chauffeurs Transparentes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Zéro commission sur vos trajets. <br />
                <span className="text-demandoo-600">Vous gardez 100% de vos gains.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto mt-2">
                Choisissez le forfait qui s'adapte à votre fréquence de voyage. Aucun frais caché, aucun prélèvement sur vos passagers.
              </p>
            </Reveal>
          </div>

          {/* Grille des 3 Cartes d'Abonnement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* 1. Plan Découverte (0 FCFA) */}
            <Reveal delay={100}>
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between h-full relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 uppercase tracking-wide">
                      Essai
                    </span>
                    <span className="text-xs font-bold text-slate-400">Sans engagement</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-2">Découverte</h3>
                  <p className="text-xs text-slate-500 font-medium mb-6 min-h-[36px]">
                    Pour tester Demandoo et proposer votre tout premier trajet sans frais.
                  </p>

                  {/* Prix */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900">0</span>
                    <span className="text-lg font-bold text-slate-500">FCFA</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/ gratuit</span>
                  </div>

                  {/* Liste des Avantages */}
                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">1 trajet complet inclus</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">0% de commission sur vos gains</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">Réservation directe WhatsApp</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600">Paiements directs avec les passagers</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/inscription-chauffeur"
                  className="w-full py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-black text-sm text-center transition-all block"
                >
                  Commencer Gratuitement
                </Link>
              </div>
            </Reveal>

            {/* 2. Plan Standard (2 400 FCFA / mois) */}
            <Reveal delay={200}>
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md hover:shadow-xl hover:border-demandoo-300 transition-all duration-300 flex flex-col justify-between h-full relative">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-demandoo-50 text-demandoo-700 uppercase tracking-wide">
                      Occasionnel
                    </span>
                    <span className="text-xs font-bold text-slate-400">Mensuel</span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-2">Standard</h3>
                  <p className="text-xs text-slate-500 font-medium mb-6 min-h-[36px]">
                    Pour proposer quelques trajets par mois et partager ses frais de route.
                  </p>

                  {/* Prix */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900">2 400</span>
                    <span className="text-lg font-bold text-slate-500">FCFA</span>
                    <span className="text-xs text-slate-400 font-medium ml-1">/ mois</span>
                  </div>

                  {/* Liste des Avantages */}
                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">Jusqu'à 4 trajets par mois</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">0% de commission sur vos gains</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-700">Support client prioritaire</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-slate-600">Paiements Wave & Espèces directs</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/abonnement"
                  className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm text-center shadow-lg transition-all block"
                >
                  Choisir Standard
                </Link>
              </div>
            </Reveal>

            {/* 3. Plan Pro (4 900 FCFA / mois) - Highlighted */}
            <Reveal delay={300}>
              <div className="bg-gradient-to-br from-demandoo-700 via-demandoo-600 to-teal-800 text-white rounded-3xl p-8 shadow-2xl shadow-demandoo-600/30 border-2 border-demandoo-400/40 flex flex-col justify-between h-full relative transform lg:-translate-y-2">
                
                {/* Badge Flottant "Recommandé" */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-400 text-slate-950 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-950" />
                  <span>Recommandé • Chauffeurs Réguliers</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white uppercase tracking-wide backdrop-blur-md">
                      Illimité
                    </span>
                    <span className="text-xs font-bold text-emerald-300">Formule Pro</span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                    <span>Pro</span>
                    <Award className="w-6 h-6 text-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-100 font-medium mb-6 min-h-[36px]">
                    Pour les chauffeurs réguliers qui souhaitent maximiser leurs revenus sans limite.
                  </p>

                  {/* Prix */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-white/15">
                    <span className="text-4xl sm:text-5xl font-black text-white">4 900</span>
                    <span className="text-lg font-bold text-slate-200">FCFA</span>
                    <span className="text-xs text-slate-300 font-medium ml-1">/ mois</span>
                  </div>

                  {/* Liste des Avantages */}
                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white text-demandoo-700 flex items-center justify-center shrink-0 mt-0.5 font-black shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-white">Trajets illimités chaque mois</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white text-demandoo-700 flex items-center justify-center shrink-0 mt-0.5 font-black shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-black text-amber-300">Badge exclusif « Chauffeur Pro »</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white text-demandoo-700 flex items-center justify-center shrink-0 mt-0.5 font-black shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-100">Visibilité prioritaire dans la recherche</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white text-demandoo-700 flex items-center justify-center shrink-0 mt-0.5 font-black shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-100">0% de commission sur vos gains</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-white text-demandoo-700 flex items-center justify-center shrink-0 mt-0.5 font-black shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-100">Support VIP dédié 7j/7</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/abonnement"
                  className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm text-center shadow-xl hover:shadow-2xl transition-all block transform active:scale-95"
                >
                  Devenir Chauffeur Pro
                </Link>
              </div>
            </Reveal>

          </div>

          {/* Bandeau Moyen de paiement Wave & Orange Money */}
          <Reveal delay={400} className="mt-12">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-900">Paiement 100% sécurisé au Sénégal</p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-500">Activez votre abonnement en 30 secondes via Wave ou Orange Money.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-black text-xs border border-blue-100">
                  🌊 Wave Sénégal
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 font-black text-xs border border-orange-100">
                  🍊 Orange Money
                </span>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. STATISTIQUES DE CONFIANCE (4 Pill Stats Cards) */}
      {/* ========================================================================= */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            
            <Reveal delay={100}>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-demandoo-600">50K+</p>
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">Passagers transportés</p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600">5K+</p>
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">Trajets partagés</p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-amber-500">14</p>
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">Régions couvertes</p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <p className="text-3xl sm:text-4xl font-black text-blue-600">99%</p>
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1">Taux de satisfaction</p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BIS - NOS PARTENAIRES DE CONFIANCE (Format Carré avec Défilement vers la Gauche) */}
      {/* ========================================================================= */}
      <section id="partenaires" className="py-16 bg-white border-b border-slate-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-demandoo-100 text-demandoo-700 text-xs font-black uppercase tracking-wider mb-2">
              <Handshake className="w-3.5 h-3.5" />
              <span>Écosystème & Réseau Partenaire</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Nos Partenaires de Confiance
            </h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mx-auto mt-1">
              Des acteurs majeurs du paiement, des transports et de la sécurité qui accompagnent vos voyages partout au Sénégal.
            </p>
          </Reveal>
        </div>

        {/* Carousel Marquee Infini (Défilement continu vers la gauche) */}
        <div className="relative w-full overflow-hidden py-4">
          
          {/* Gradient Fades sur les extrémités gauche & droite */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* Track Défilant avec Cartes Carrées */}
          <div className="flex gap-4 sm:gap-6 animate-marquee w-max hover:[animation-play-state:paused] cursor-pointer pl-4">
            {[...PARTNERS_LIST, ...PARTNERS_LIST].map((partner, idx) => (
              <div 
                key={`${partner.id}-${idx}`}
                className="w-36 h-36 sm:w-44 sm:h-44 aspect-square bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-demandoo-400 p-3 sm:p-3.5 flex flex-col items-center justify-between text-center transition-all duration-300 transform group hover:-translate-y-1.5 shrink-0 select-none"
              >
                {/* Emplacement Logo Grand Format occupant tout l'espace supérieur du carré */}
                <div className="w-full flex-1 rounded-2xl bg-slate-50/80 border border-slate-100 group-hover:border-demandoo-200 group-hover:bg-white flex items-center justify-center p-3 transition-all overflow-hidden relative">
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    className="w-full h-full object-contain filter group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div className={`hidden w-full h-full rounded-xl items-center justify-center text-3xl sm:text-4xl font-black ${partner.bgBadge}`}>
                    {partner.initials}
                  </div>
                </div>

                {/* Nom du Partenaire & Catégorie en bas */}
                <div className="w-full pt-1.5 px-0.5">
                  <p className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-demandoo-600 truncate transition-colors">
                    {partner.name}
                  </p>
                  <span className="inline-block text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-full">
                    {partner.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 7. CARTE INTERACTIVE DES DESTINATIONS */}
      {/* ========================================================================= */}
      <InteractiveMap />

      {/* ========================================================================= */}
      {/* 8. AVIS CLIENTS & TÉMOIGNAGES */}
      {/* ========================================================================= */}
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Reveal>
            <span className="text-xs font-black uppercase tracking-widest text-demandoo-600">Avis & Retours</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Ce que disent nos voyageurs</h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Découvrez les retours d'expérience de notre communauté au Sénégal.</p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Fatou D.", city: "Dakar", role: "Passagère régulière", img: "https://images.unsplash.com/photo-1531123897727-8f129e1bf38c?auto=format&fit=crop&q=80&w=150", text: "J'ai trouvé un trajet pour Touba très rapidement. Le chauffeur était ponctuel, courtois et prudent. C'est tellement plus simple que la gare !" },
            { name: "Modou S.", city: "Touba", role: "Conducteur actif", img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=150", text: "Depuis que je publie mes allers-retours sur Demandoo, je remplis ma voiture facilement. Mes frais d'essence sont totalement remboursés." },
            { name: "Aïssatou N.", city: "Saint-Louis", role: "Passagère", img: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&q=80&w=150", text: "La réservation directe sur WhatsApp est géniale. On s'arrange en deux minutes pour le point de départ. Je recommande à 100% !" }
          ].map((item, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-xl hover:border-demandoo-200 transition-all duration-300">
                <div className="space-y-4 mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{item.text}"</p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img src={item.img} alt={item.name} className="w-11 h-11 rounded-full object-cover border-2 border-demandoo-200" />
                  <div>
                    <p className="font-black text-slate-900 text-sm">{item.name}</p>
                    <p className="text-xs font-bold text-demandoo-600">{item.role} • {item.city}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 9. FAQ ACCORDÉON */}
      {/* ========================================================================= */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10 space-y-2">
            <Reveal>
              <h2 className="text-3xl font-black text-slate-900">Questions Fréquemment Posées</h2>
              <p className="text-slate-500 text-sm font-medium">Tout ce que vous devez savoir pour voyager sereinement.</p>
            </Reveal>
          </div>

          <div className="space-y-3">
            {[
              { q: "Faut-il un compte pour chercher et réserver un trajet ?", a: "Non, les passagers peuvent rechercher librement tous les trajets et contacter directement les conducteurs via WhatsApp ou téléphone sans inscription obligatoire." },
              { q: "Comment s'effectue le paiement de la place ?", a: "Le règlement se fait directement avec le chauffeur lors de l'embarquement, soit en espèces, soit par Mobile Money (Wave ou Orange Money) sans commission supplémentaire." },
              { q: "Comment devenir chauffeur et proposer des trajets ?", a: "Cliquez sur 'Devenir chauffeur', remplissez vos informations, validez votre permis de conduire et publiez votre premier trajet en moins de 2 minutes." },
              { q: "Les conducteurs sont-ils fiables et vérifiés ?", a: "Oui, notre équipe vérifie les pièces d'identité et permis de chaque chauffeur pour garantir un voyage sécurisé et convivial." }
            ].map((faq, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-demandoo-300 transition-colors">
                  <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-demandoo-500 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed pl-8 mt-2">
                    {faq.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. APP DOWNLOAD BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Reveal>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-demandoo-100 text-demandoo-600 mb-2">
              <Smartphone className="w-7 h-7" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3">Emportez Demandoo partout avec vous</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium leading-relaxed">
              Téléchargez notre application Android pour recevoir des alertes de départs, discuter en temps réel et réserver en un clic.
            </p>
            <div className="pt-4 flex justify-center">
              <a 
                href="/demandoo.apk" 
                download 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black text-sm hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all active:scale-95"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4111 13.8533 8.1 12 8.1c-1.8533 0-3.5902.3111-5.1367.8497L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/></svg>
                <span>Télécharger l'APK Android (Gratuit)</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};
