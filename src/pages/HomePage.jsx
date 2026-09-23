import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Star,
  Car,
  Phone
} from 'lucide-react';

import { Reveal } from '../components/common/Reveal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { TripCard } from '../components/common/TripCard';
import { VoiceSearch } from '../components/common/VoiceSearch';

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
      className="absolute inset-0 bg-mesh-pattern opacity-20 pointer-events-none mix-blend-overlay"
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

  return (
    <div className="font-sans bg-[#F9FAFB]">
      {/* 2. PREMIER ÉCRAN (Hero Section Premium) */}
      <section className="relative overflow-x-clip bg-gradient-to-b from-[#073444] to-[#07132E] min-h-[780px] flex items-center pt-24 pb-16 lg:pt-0 lg:pb-0 border-b border-slate-800">
        <AnimatedBackground />
        
        <div className="relative w-[92%] max-w-[1500px] mx-auto z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[52%_48%] items-center justify-center min-h-[780px] gap-12 lg:gap-0">
            
            {/* COLONNE GAUCHE (CONTENU & RECHERCHE) */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-7 order-2 lg:order-1 w-full max-w-[720px] mx-auto lg:mx-0">
              
              {/* Badge */}
              <Reveal delay={100}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs sm:text-sm font-bold text-emerald-300 shadow-sm animate-fade-in">
                  <Star className="w-4 h-4 shrink-0" fill="currentColor" />
                  <span>★ Le covoiturage de confiance au Sénégal</span>
                </div>
              </Reveal>

              {/* Titre Principal */}
              <Reveal delay={200} className="w-full">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4rem] font-black text-white tracking-tight leading-[1.1] break-words">
                  Depuis Touba,<br />
                  trouvez votre trajet <br className="hidden sm:block" />
                  <span className="text-amber-500">partout au Sénégal.</span>
                </h1>
              </Reveal>

              {/* Description */}
              <Reveal delay={300} className="w-full">
                <p className="text-base sm:text-lg lg:text-xl text-slate-300 font-medium leading-relaxed">
                  Demandoo met en relation passagers et chauffeurs. Vous organisez ensemble votre trajet et son règlement, simplement et directement.
                </p>
              </Reveal>
              
              {/* FORMULAIRE DE RECHERCHE */}
              <Reveal delay={400} className="w-full">
                <div className="bg-white/95 backdrop-blur-xl p-4 sm:p-5 lg:p-6 rounded-[24px] w-full shadow-2xl shadow-black/20 border border-white/50 relative z-20 transition-transform duration-300 hover:shadow-demandoo-500/10">
                  <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3">
                    
                    {/* VILLES DEPART ET DESTINATION */}
                    <div className="flex flex-col sm:flex-row gap-3 relative">
                      {/* Départ */}
                      <div className="w-full sm:flex-1 flex items-center gap-3 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-demandoo-500/20 p-3.5 sm:p-4 rounded-2xl transition-all border border-slate-200">
                        <MapPin className="w-5 h-5 text-demandoo-600 shrink-0" />
                        <div className="w-full text-left">
                          <label className="sr-only">Ville de départ</label>
                          <input 
                            type="text" 
                            value={departure} 
                            onChange={(e) => setDeparture(e.target.value)} 
                            placeholder="Départ (ex: Touba)" 
                            className="w-full bg-transparent font-bold text-slate-900 text-sm sm:text-base focus:outline-none placeholder-slate-400" 
                          />
                        </div>
                      </div>
                      
                      {/* Bouton Swap */}
                      <div className="flex justify-center -my-2 sm:my-0 sm:-mx-3 relative z-10 sm:self-center">
                        <button 
                          type="button" 
                          onClick={handleSwap} 
                          title="Inverser départ et destination"
                          aria-label="Inverser départ et destination"
                          className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-transform hover:scale-110 active:scale-95 group shrink-0"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-demandoo-600 sm:rotate-90 group-hover:text-demandoo-500">
                            <path d="M12 3v18"/><path d="m8 7 4-4 4 4"/><path d="m8 17 4 4 4-4"/>
                          </svg>
                        </button>
                      </div>

                      {/* Destination */}
                      <div className="w-full sm:flex-1 flex items-center gap-3 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-demandoo-500/20 p-3.5 sm:p-4 rounded-2xl transition-all border border-slate-200">
                        <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                        <div className="w-full text-left">
                          <label className="sr-only">Destination</label>
                          <input 
                            type="text" 
                            list="cities-list" 
                            value={destination} 
                            onChange={(e) => setDestination(e.target.value)} 
                            placeholder="Destination (ex: Dakar)" 
                            className="w-full bg-transparent font-bold text-slate-900 text-sm sm:text-base focus:outline-none placeholder-slate-400" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* DATE, PASSAGERS ET BOUTON RECHERCHER */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Date */}
                      <div className="w-full sm:flex-[2] md:flex-1 flex items-center gap-3 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-demandoo-500/20 p-3.5 sm:p-4 rounded-2xl transition-all border border-slate-200">
                        <Calendar className="w-5 h-5 text-demandoo-600 shrink-0" />
                        <div className="w-full text-left">
                          <label className="sr-only">Date</label>
                          <input 
                            type="date" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="w-full bg-transparent font-bold text-slate-800 text-sm sm:text-base focus:outline-none" 
                          />
                        </div>
                      </div>

                      {/* Passagers */}
                      <div className="w-full sm:w-32 flex items-center justify-between sm:justify-center gap-2 bg-slate-50 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-demandoo-500/20 p-3.5 sm:p-4 rounded-2xl transition-all border border-slate-200">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-demandoo-600 shrink-0" />
                          <span className="sm:hidden text-sm font-bold text-slate-600">Passagers :</span>
                        </div>
                        <input 
                          type="number" 
                          min="1" 
                          max="7" 
                          value={passengers} 
                          onChange={(e) => setPassengers(e.target.value)} 
                          className="w-12 bg-transparent font-bold text-slate-900 text-sm sm:text-base focus:outline-none text-right sm:text-center" 
                          aria-label="Nombre de passagers"
                        />
                      </div>

                      {/* Bouton Rechercher */}
                      <button 
                        type="submit" 
                        className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-2xl font-black text-white bg-demandoo-500 hover:bg-demandoo-400 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 shrink-0"
                      >
                        <Search className="w-5 h-5 shrink-0" />
                        <span>Rechercher</span>
                      </button>
                    </div>

                  </form>
                  <VoiceSearch />
                </div>
              </Reveal>

              {/* CTA SECONDAIRE */}
              <Reveal delay={500} className="w-full">
                <div className="flex flex-col sm:flex-row items-center lg:justify-start justify-center gap-4 mt-2">
                  <Link 
                    to="/publier" 
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all shadow-sm w-full sm:w-auto"
                  >
                    <Car className="w-4 h-4" />
                    Proposer un trajet
                  </Link>
                  <a 
                    href="#comment-ca-marche" 
                    className="text-sm font-bold text-slate-300 hover:text-white transition-colors underline-offset-4 hover:underline"
                  >
                    Comment ça marche ?
                  </a>
                </div>
              </Reveal>
              
              <datalist id="cities-list">
                {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
              </datalist>

            </div>
            
            {/* COLONNE DROITE (GRANDE IMAGE DEMANDOO) */}
            <div className="relative flex items-center justify-center order-1 lg:order-2 w-full mt-4 lg:mt-0">
              <Reveal delay={400} className="w-full">
                <div className="relative w-full flex justify-center lg:justify-end items-center animate-fade-in" style={{ animationDuration: '1s' }}>
                  
                  {/* Lumière radiale turquoise subtile */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-demandoo-400/20 blur-[100px] rounded-full pointer-events-none"></div>

                  {/* Image Transparente Extra-Large */}
                  <img 
                    src="/images/UUU.png" 
                    alt="Covoiturage Demandoo Sénégal" 
                    className="relative z-10 w-[min(115%,600px)] lg:w-[clamp(650px,52vw,950px)] max-w-none h-auto object-contain animate-float"
                    style={{ 
                      filter: 'drop-shadow(0 25px 25px rgba(0,0,0,0.15))' 
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/hero-banner-800.webp";
                    }}
                  />
                  
                  {/* Ombre au sol (ellipse) */}
                  <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[60%] h-6 bg-black/30 blur-[12px] rounded-[100%] pointer-events-none"></div>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

      {/* PARTENAIRES */}
      <section className="bg-white py-8 border-b border-slate-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">Ils nous font confiance</p>
        </div>
        
        {/* Container pour le défilement (Marquee) */}
        <div className="flex whitespace-nowrap overflow-hidden relative">
          {/* Dégradés sur les bords pour l'effet de fondu */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          
          {/* Le contenu animé qui défile */}
          <div className="flex items-center gap-16 md:gap-24 opacity-60 animate-marquee hover:opacity-100 transition-opacity duration-300 w-max pl-16">
            {/* On duplique la liste plusieurs fois pour l'effet infini */}
            {[...Array(4)].map((_, arrayIndex) => (
              <React.Fragment key={arrayIndex}>
                {['BAOL OFFICES', 'RESTAURANT MBECKTE MII', 'BAOLVISION', 'TOUBA CA KANAM'].map((partner, i) => (
                  <div key={`${arrayIndex}-${i}`} className="text-2xl font-black text-slate-700 tracking-tighter shrink-0 cursor-default">
                    {partner}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRAJETS DISPONIBLES */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <Reveal>
            <h2 className="text-3xl font-black text-slate-900">Trajets disponibles</h2>
          </Reveal>
          <Reveal delay={150}>
            <Link to="/trajets" className="group px-5 py-2.5 rounded-xl bg-demandoo-50 text-demandoo-700 font-bold hover:bg-demandoo-100 transition-colors flex items-center gap-2">
              Voir tout <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {availableTrips.length === 0 ? (
          <div className="bg-white p-8 rounded-[2rem] text-center border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-2">Aucun trajet à venir pour le moment</h3>
            <p className="text-slate-500 mb-4">Soyez le premier à proposer un trajet ou modifiez vos critères de recherche.</p>
            <Link to="/publier" className="inline-block px-6 py-3 rounded-xl bg-demandoo-600 text-white font-bold">Proposer un trajet</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTrips.map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* 4. COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <Reveal>
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900">Comment ça marche ?</h2>
              <p className="text-slate-600 font-medium">Demandoo facilite la mise en relation. L’accord et le paiement se font directement entre le passager et le chauffeur.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={100}>
              <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-demandoo-50 text-demandoo-600 flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">1. Cherchez votre trajet</h3>
              <p className="text-slate-500 text-sm font-medium">Choisissez votre destination et votre date parmi les trajets publiés.</p>
            </div>
            </Reveal>
            <Reveal delay={200}>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-demandoo-50 text-demandoo-600 flex items-center justify-center">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">2. Contactez le chauffeur</h3>
              <p className="text-slate-500 text-sm font-medium">Échangez directement avec le chauffeur par téléphone ou WhatsApp.</p>
            </div>
            </Reveal>
            <Reveal delay={300}>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-demandoo-50 text-demandoo-600 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">3. Convenez du voyage</h3>
              <p className="text-slate-500 text-sm font-medium">Confirmez ensemble la disponibilité, le lieu de rendez-vous et le prix (en espèces).</p>
            </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. CARTE INTERACTIVE */}
      <InteractiveMap />

      {/* 6. INFORMATIONS DE CONFIANCE */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <ShieldCheck className="w-12 h-12 text-demandoo-600 mx-auto" />
          <h2 className="text-3xl font-black text-slate-900">Des profils vérifiés</h2>
          <p className="text-slate-600 font-medium text-lg leading-relaxed">
            Sur Demandoo, la confiance est primordiale. Les chauffeurs possédant un badge de vérification ont fourni une pièce d'identité (CNI) et un permis de conduire valides, contrôlés par notre équipe.
          </p>
        </div>
      </section>

      {/* 7. TÉMOIGNAGES */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Ce qu'en disent nos utilisateurs</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Fatou D.", role: "Passagère", img: "https://images.unsplash.com/photo-1531123897727-8f129e1bf38c?auto=format&fit=crop&q=80&w=150", text: "J'ai trouvé un trajet pour Dakar très rapidement. Le chauffeur était ponctuel et sympathique. C'est vraiment simple de s'arranger directement !" },
            { name: "Modou S.", role: "Chauffeur", img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=150", text: "Depuis que j'utilise Demandoo, je ne fais plus mes trajets vers Saint-Louis à vide. Je suis contacté facilement et je remplis ma voiture à chaque fois." },
            { name: "Aïssatou N.", role: "Passagère", img: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&q=80&w=150", text: "Ce que j'aime, c'est la transparence. Pas de commission, on paye directement en entrant dans le véhicule. Très pratique pour mes déplacements réguliers." },
            { name: "Cheikh T.", role: "Passager", img: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=150", text: "L'application est très intuitive. J'ai pu contacter mon chauffeur via WhatsApp en deux clics. Je recommande vivement pour voyager tranquille." },
            { name: "Ousmane F.", role: "Chauffeur", img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=150", text: "Je publie mes trajets Touba - Dakar chaque semaine. Ça me rembourse le carburant et les passagers sont toujours ponctuels." },
            { name: "Mariama B.", role: "Passagère", img: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=150", text: "Fini les longues attentes à la gare routière ! Je trouve mon trajet à l'avance, on s'arrange sur le point de rendez-vous et on y va." }
          ].map((testimonial, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:-translate-y-1 transition-transform">
                <div className="space-y-4 mb-6">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-slate-600 font-medium italic">"{testimonial.text}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <img src={testimonial.img} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                  <div>
                    <p className="font-black text-slate-900">{testimonial.name}</p>
                    <p className="text-sm font-bold text-demandoo-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 8. FAQ COURTE */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Foire aux questions</h2>
        </Reveal>
        <div className="space-y-4">
          {[
            { q: "Faut-il un compte pour chercher un trajet ?", a: "Non, les passagers peuvent chercher des trajets et contacter les chauffeurs sans avoir de compte." },
            { q: "Comment contacter un chauffeur ?", a: "Vous pouvez cliquer sur 'Contacter via WhatsApp' ou appeler le numéro de téléphone indiqué sur la fiche détaillée d'un trajet." },
            { q: "Est-ce que Demandoo réserve ma place ?", a: "Non, Demandoo est uniquement une plateforme de mise en relation. Vous devez contacter le chauffeur pour confirmer qu'il a bien une place disponible pour vous." },
            { q: "Comment se passe le paiement ?", a: "Il n'y a aucun paiement en ligne sur Demandoo. Vous réglez le prix du voyage directement en espèces avec le chauffeur, selon l'accord convenu avec lui." },
            { q: "Comment proposer un trajet ?", a: "Vous devez créer un compte en cliquant sur 'Devenir chauffeur', vérifier votre profil, puis publier votre trajet." }
          ].map((faq, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-demandoo-200 transition-colors">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-2"><HelpCircle className="w-4 h-4 text-demandoo-500 shrink-0" /> {faq.q}</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed pl-6">{faq.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      {/* 9. TÉLÉCHARGER L'APPLICATION */}
      <section className="py-16 bg-demandoo-50/50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <Reveal>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-demandoo-100 text-demandoo-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Emportez Demandoo partout avec vous</h2>
            <p className="text-slate-600 font-medium text-lg max-w-2xl mx-auto">
              L'application Demandoo est disponible gratuitement. Téléchargez-la dès maintenant sur votre smartphone pour trouver vos trajets encore plus rapidement.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              {/* Bouton App Store */}
              <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform w-full sm:w-auto justify-center">
                <svg viewBox="0 0 384 512" width="24" height="24" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Télécharger dans l'</div>
                  <div className="text-lg font-black leading-none mt-1">App Store</div>
                </div>
              </a>

              {/* Bouton Google Play / APK */}
              <a href="/demandoo.apk" download="demandoo.apk" className="flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform w-full sm:w-auto justify-center">
                <svg viewBox="0 0 512 512" width="24" height="24" fill="currentColor">
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                </svg>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Télécharger pour</div>
                  <div className="text-lg font-black leading-none mt-1">Android (APK)</div>
                </div>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. ABONNEMENTS CHAUFFEURS */}
      <section id="abonnements" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Des offres adaptées à votre rythme</h2>
            <p className="text-slate-600 font-medium">Zéro commission sur vos trajets. Vous payez uniquement l'abonnement qui correspond à vos besoins.</p>
          </div>
        </Reveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Découverte */}
          <Reveal delay={100}>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full hover:border-slate-300 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Découverte</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-black text-slate-900">0</span>
                <span className="text-lg font-bold text-slate-900 pb-1">FCFA</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-6 flex-grow">Pour tester Demandoo et proposer votre premier trajet.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">✅ 1 trajet au total</li>
                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">✅ Zéro commission</li>
              </ul>
              <Link to="/abonnement" className="w-full block text-center py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors">Commencer</Link>
            </div>
          </Reveal>

          {/* Standard */}
          <Reveal delay={200}>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col h-full relative hover:border-slate-300 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Standard</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-black text-slate-900">2 400</span>
                <span className="text-lg font-bold text-slate-900 pb-1">FCFA</span>
                <span className="text-sm text-slate-500 font-medium ml-1">/mois</span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-6 flex-grow">Pour proposer quelques trajets occasionnels chaque mois.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">✅ Jusqu'à 4 trajets / mois</li>
                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium">✅ Zéro commission</li>
              </ul>
              <Link to="/abonnement" className="w-full block text-center py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">Choisir Standard</Link>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={300}>
            <div className="bg-demandoo-600 p-8 rounded-3xl border border-demandoo-500 shadow-xl shadow-demandoo-600/20 flex flex-col h-full relative md:-mt-4 md:mb-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Le plus choisi</div>
              <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-black text-white">4 900</span>
                <span className="text-lg font-bold text-white pb-1">FCFA</span>
                <span className="text-sm text-demandoo-100 font-medium ml-1">/mois</span>
              </div>
              <p className="text-sm font-medium text-demandoo-50 mb-6 flex-grow">Pour les chauffeurs qui roulent régulièrement.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white font-medium">✅ Trajets illimités</li>
                <li className="flex items-center gap-2 text-sm text-white font-medium">✅ Visibilité prioritaire</li>
                <li className="flex items-center gap-2 text-sm text-white font-medium">✅ Badge "Chauffeur Pro"</li>
              </ul>
              <Link to="/abonnement" className="w-full block text-center py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-md transition-colors">Devenir Pro</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11. ESPACE CHAUFFEUR (CTA) */}
      <section className="bg-slate-900 py-16 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-black text-white">Vous partez ? Faites connaître votre trajet.</h2>
          <p className="text-slate-400 font-medium text-lg">
            Publiez votre trajet pour permettre aux passagers intéressés de vous contacter directement.
          </p>
          <div className="pt-4">
            <Link to="/login" className="inline-block px-8 py-4 rounded-xl bg-demandoo-600 text-white font-black hover:bg-demandoo-500 transition-colors">
              Devenir chauffeur
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
