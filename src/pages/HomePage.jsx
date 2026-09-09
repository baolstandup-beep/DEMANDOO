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
  BadgeCheck
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

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

  return (
    <div className="font-sans bg-[#F9FAFB]">
      
      {/* ===================================================
          1. HERO SECTION (Abib Digit Style: Massive Dark Hero)
         =================================================== */}
      <section className="relative min-h-[90vh] bg-[#0A0A0A] flex flex-col justify-center items-center overflow-hidden pt-20 pb-24">
        
        {/* Image de fond premium */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000" 
            alt="Route Sénégal" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/70 to-[#0A0A0A]" />
        </div>

        {/* Abstract Dark Glows (conservés pour l'effet SaaS) */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-demandoo-600/20 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full space-y-16">
          
          <div className="text-center space-y-6 max-w-4xl mx-auto mt-10">
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
              Le covoiturage de confiance de <span className="text-demandoo-500">Touba</span> vers tout le Sénégal.
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 font-medium max-w-2xl mx-auto">
              Réservez ou proposez des trajets partagés sûrs et abordables vers Dakar, Thiès, Saint-Louis, Mbacké et bien d'autres villes.
            </p>
          </div>

          {/* SEARCH BAR (Glassmorphism) */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-2xl p-4 sm:p-6 rounded-[2rem] border border-white/10 shadow-2xl">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-4">
                
                <div className="flex-1 w-full relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={departure}
                    readOnly
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold cursor-not-allowed opacity-80 focus:outline-none"
                  />
                </div>

                <div className="hidden sm:flex shrink-0 w-8 h-8 rounded-full bg-white/5 items-center justify-center border border-white/10 text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className="flex-1 w-full relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-demandoo-400" />
                  <input
                    type="text"
                    list="cities-list"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Destination"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold placeholder:text-slate-400 focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 outline-none transition-all"
                  />
                </div>

                <div className="flex-1 w-full relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:bg-white/10 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/50 outline-none transition-all [color-scheme:dark]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-lg shadow-demandoo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Rechercher
                </button>

                <datalist id="cities-list">
                  {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </form>
            </div>
          </div>

          {/* Image d'illustration du covoiturage */}
          <div className="relative w-full max-w-5xl mx-auto rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl shadow-demandoo-500/10 border border-white/10 group mt-12">
            <img 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200" 
              alt="Covoiturage au Sénégal" 
              className="w-full h-[250px] sm:h-[350px] lg:h-[450px] object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent" />
            <div className="absolute bottom-6 left-8 bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-demandoo-500 animate-pulse"></span>
              +150 trajets aujourd'hui
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
          2. NOS RÉALISATIONS (POPULAR ROUTES PORTFOLIO)
         =================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
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
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800" 
              alt="Touba - Dakar" 
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
              src="https://images.unsplash.com/photo-1494522358652-f30e61a60313?auto=format&fit=crop&q=80&w=800" 
              alt="Touba - Thiès" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=800" 
              alt="Touba - Mbour" 
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
              src="https://images.unsplash.com/photo-1580828369019-18ba4c7604fb?auto=format&fit=crop&q=80&w=800" 
              alt="Touba - Saint-Louis" 
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
            <div className="md:col-span-2 bg-black rounded-[2rem] p-10 sm:p-12 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/5">
              <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck className="w-8 h-8 text-demandoo-400" />
                </div>
                <div>
                  <h3 className="text-3xl font-black mb-4 group-hover:text-demandoo-400 transition-colors duration-300">Sécurité Maximale</h3>
                  <p className="text-slate-300 font-medium max-w-md text-lg leading-relaxed">
                    Chaque chauffeur est rigoureusement vérifié (CNI, Permis). Votre sécurité est la fondation absolue de notre réseau.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Économique */}
            <div className="bg-gradient-to-br from-demandoo-500 to-demandoo-700 rounded-[2rem] p-10 sm:p-12 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-demandoo-500/30 hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-4">Économique</h3>
                  <p className="text-demandoo-100 font-medium text-lg leading-relaxed">
                    Partagez les frais de route. Le moyen le plus abordable et convivial de voyager au Sénégal.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Couverture */}
            <div className="bg-white rounded-[2rem] p-10 sm:p-12 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 border border-slate-100">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-[80px] translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:-rotate-12 transition-transform duration-500">
                  <Map className="w-8 h-8 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">Couverture Nationale</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed">
                    De Saint-Louis à Ziguinchor, trouvez ou proposez un trajet partout dans le pays en un clic.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 4: Support */}
            <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-teal-100/50 rounded-[2rem] p-10 sm:p-12 border border-emerald-100/50 relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 transition-all duration-500">
              <div className="absolute top-1/2 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] -translate-y-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <BadgeCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="max-w-xl">
                  <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">Support 24/7 & Assistance</h3>
                  <p className="text-slate-600 font-medium text-lg leading-relaxed">
                    Notre équipe est disponible à tout moment pour vous assister. Vous n'êtes jamais seul sur la route, Demandoo veille sur votre trajet de A à Z.
                  </p>
                </div>
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
      <section className="py-24 bg-white">
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i, index) => (
                <div 
                  key={index}
                  className="bg-white border border-slate-100 rounded-2xl p-8 flex items-center justify-center w-48 sm:w-64 h-32 shadow-sm hover:shadow-md hover:border-demandoo-200 transition-all duration-300 group shrink-0 cursor-default"
                >
                  <div className="text-center space-y-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-slate-100 rounded-full mx-auto flex items-center justify-center">
                      <span className="text-slate-400 font-black text-sm">#</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Partenaire</p>
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
