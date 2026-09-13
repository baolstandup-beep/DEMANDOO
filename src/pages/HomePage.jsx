import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { INITIAL_CITIES } from '../lib/mockData';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowRight, 
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  Phone,
  Car,
  Star
} from 'lucide-react';

const FadeInSection = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      });
    }, { threshold: 0.1 });
    const current = domRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
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
      {/* 2. PREMIER ÉCRAN (Hero Section) */}
      <section className="relative overflow-hidden bg-mesh-pattern pt-20 pb-28 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-[#060f29] via-transparent to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 text-center space-y-8 z-10">
          <FadeInSection delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4 text-sm font-bold text-emerald-300">
              <Star className="w-4 h-4" fill="currentColor" /> N°1 du covoiturage au Sénégal
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
              Depuis Touba,<br/>
              <span className="gradient-text-gold">trouvez votre trajet au Sénégal.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 font-medium pb-8 max-w-2xl mx-auto leading-relaxed">
              Demandoo met en relation passagers et chauffeurs. Les modalités du voyage et le paiement se règlent directement entre vous, en toute simplicité.
            </p>
          </FadeInSection>
          
          <FadeInSection delay={150}>
            <div className="glass-card p-3 sm:p-4 rounded-[2rem] max-w-3xl mx-auto text-left relative z-20 mx-4 sm:mx-auto">
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 bg-white/60 hover:bg-white focus-within:bg-white p-3 sm:p-4 rounded-xl transition-colors border border-slate-200">
                  <MapPin className="w-5 h-5 text-demandoo-600 shrink-0" />
                  <input type="text" value={departure} onChange={(e) => setDeparture(e.target.value)} placeholder="Départ" className="w-full bg-transparent font-bold text-slate-800 focus:outline-none placeholder-slate-400" />
                </div>
                
                <div className="flex justify-center -my-4 md:my-0 md:-mx-4 relative z-10 md:self-center">
                  <button type="button" onClick={handleSwap} className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-all hover:scale-110 group">
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-demandoo-600 md:rotate-90 group-hover:text-demandoo-500"><path d="M12 3v18"/><path d="m8 7 4-4 4 4"/><path d="m8 17 4 4 4-4"/></svg>
                  </button>
                </div>

                <div className="flex-1 flex items-center gap-3 bg-white/60 hover:bg-white focus-within:bg-white p-3 sm:p-4 rounded-xl transition-colors border border-slate-200">
                  <MapPin className="w-5 h-5 text-demandoo-600 shrink-0" />
                  <input type="text" list="cities-list" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" className="w-full bg-transparent font-bold text-slate-800 focus:outline-none placeholder-slate-400" />
                </div>

                <div className="flex gap-3 md:w-auto w-full">
                  <div className="flex-[2] md:w-36 flex items-center gap-2 bg-white/60 hover:bg-white focus-within:bg-white p-3 sm:p-4 rounded-xl transition-colors border border-slate-200">
                    <Calendar className="w-5 h-5 text-demandoo-600 shrink-0" />
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent font-bold text-slate-800 focus:outline-none" />
                  </div>
                  <div className="flex-1 md:w-24 flex items-center justify-center gap-2 bg-white/60 hover:bg-white focus-within:bg-white p-3 sm:p-4 rounded-xl transition-colors border border-slate-200">
                    <Users className="w-5 h-5 text-demandoo-600 shrink-0" />
                    <input type="number" min="1" max="7" value={passengers} onChange={(e) => setPassengers(e.target.value)} className="w-full bg-transparent font-bold text-slate-800 focus:outline-none text-center" />
                  </div>
                </div>

                <button type="submit" className="md:w-auto w-full px-8 py-4 sm:py-0 rounded-xl font-black btn-premium flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  <span className="md:hidden">Rechercher</span>
                </button>
              </form>
            </div>
          </FadeInSection>
          
          <datalist id="cities-list">
             {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
          </datalist>
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
          <FadeInSection>
            <h2 className="text-3xl font-black text-slate-900">Trajets disponibles</h2>
          </FadeInSection>
          <FadeInSection delay={150}>
            <Link to="/trajets" className="px-5 py-2.5 rounded-xl bg-demandoo-50 text-demandoo-700 font-bold hover:bg-demandoo-100 transition-colors flex items-center gap-2">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeInSection>
        </div>

        {availableTrips.length === 0 ? (
          <div className="bg-white p-8 rounded-[2rem] text-center border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-2">Aucun trajet à venir pour le moment</h3>
            <p className="text-slate-500 mb-4">Soyez le premier à proposer un trajet ou modifiez vos critères de recherche.</p>
            <Link to="/publier" className="inline-block px-6 py-3 rounded-xl bg-demandoo-600 text-white font-bold">Proposer un trajet</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableTrips.map((trip, idx) => (
              <FadeInSection key={trip.id} delay={idx * 100}>
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img src={trip.driver?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'} alt={trip.driver?.full_name} className="w-12 h-12 rounded-full object-cover border-2 border-demandoo-50 shadow-sm" />
                    <div>
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-1">
                        {trip.driver?.full_name}
                        {trip.driver?.driver_status === 'VERIFIED' && <ShieldCheck className="w-3.5 h-3.5 text-demandoo-500" title="Profil vérifié" />}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-3 py-1 rounded-full text-slate-600 font-bold text-xs border border-slate-100">
                    {trip.seats_available} places
                  </div>
                </div>

                <div className="relative pl-6 space-y-4 my-2 border-l-2 border-slate-100">
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-demandoo-500 border-4 border-white shadow-sm" />
                    <p className="font-black text-slate-900">{trip.departure_city}</p>
                    <p className="text-xs text-slate-500 font-medium">{new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-slate-800 border-4 border-white shadow-sm" />
                    <p className="font-black text-slate-900">{trip.arrival_city}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xl font-black text-demandoo-600">{trip.price_per_seat.toLocaleString('fr-FR')} FCFA</p>
                  <Link to={`/trajet/${trip.id}`} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors">
                    Voir le trajet
                  </Link>
                </div>
              </div>
              </FadeInSection>
            ))}
          </div>
        )}
      </section>

      {/* 4. COMMENT ÇA MARCHE */}
      <section id="comment-ca-marche" className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <FadeInSection>
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-black text-slate-900">Comment ça marche ?</h2>
              <p className="text-slate-600 font-medium">Demandoo facilite la mise en relation. L’accord et le paiement se font directement entre le passager et le chauffeur.</p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeInSection delay={100}>
              <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-demandoo-50 text-demandoo-600 flex items-center justify-center">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">1. Cherchez votre trajet</h3>
              <p className="text-slate-500 text-sm font-medium">Choisissez votre destination et votre date parmi les trajets publiés.</p>
            </div>
            </FadeInSection>
            <FadeInSection delay={200}>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-demandoo-50 text-demandoo-600 flex items-center justify-center">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">2. Contactez le chauffeur</h3>
              <p className="text-slate-500 text-sm font-medium">Échangez directement avec le chauffeur par téléphone ou WhatsApp.</p>
            </div>
            </FadeInSection>
            <FadeInSection delay={300}>
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-demandoo-50 text-demandoo-600 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">3. Convenez du voyage</h3>
              <p className="text-slate-500 text-sm font-medium">Confirmez ensemble la disponibilité, le lieu de rendez-vous et le prix (en espèces).</p>
            </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 5. DESTINATIONS POPULAIRES */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Destinations populaires</h2>
        </FadeInSection>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { dest: 'Dakar', img: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=400' },
            { dest: 'Thiès', img: 'https://images.unsplash.com/photo-1549429158-b64ec069f257?auto=format&fit=crop&q=80&w=400' },
            { dest: 'Mbour', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400' },
            { dest: 'Saint-Louis', img: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&q=80&w=400' },
            { dest: 'Ziguinchor', img: 'https://images.unsplash.com/photo-1528277342758-f1d7613953a2?auto=format&fit=crop&q=80&w=400' },
            { dest: 'Diourbel', img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=400' },
            { dest: 'Kaolack', img: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&q=80&w=400' },
            { dest: 'Rufisque', img: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?auto=format&fit=crop&q=80&w=400' }
          ].map((d, idx) => (
            <FadeInSection key={d.dest} delay={idx * 50}>
              <div onClick={() => setPopularRoute('Touba', d.dest)} className="relative h-32 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow">
                <img src={d.img} alt={`Touba - ${d.dest}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-lg">Vers {d.dest}</span>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

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
        <FadeInSection>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Ce qu'en disent nos utilisateurs</h2>
        </FadeInSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Fatou D.", role: "Passagère", img: "https://images.unsplash.com/photo-1531123897727-8f129e1bf38c?auto=format&fit=crop&q=80&w=150", text: "J'ai trouvé un trajet pour Dakar très rapidement. Le chauffeur était ponctuel et sympathique. C'est vraiment simple de s'arranger directement !" },
            { name: "Modou S.", role: "Chauffeur", img: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=150", text: "Depuis que j'utilise Demandoo, je ne fais plus mes trajets vers Saint-Louis à vide. Je suis contacté facilement et je remplis ma voiture à chaque fois." },
            { name: "Aïssatou N.", role: "Passagère", img: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&q=80&w=150", text: "Ce que j'aime, c'est la transparence. Pas de commission, on paye directement en entrant dans le véhicule. Très pratique pour mes déplacements réguliers." },
            { name: "Cheikh T.", role: "Passager", img: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=150", text: "L'application est très intuitive. J'ai pu contacter mon chauffeur via WhatsApp en deux clics. Je recommande vivement pour voyager tranquille." },
            { name: "Ousmane F.", role: "Chauffeur", img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=150", text: "Je publie mes trajets Touba - Dakar chaque semaine. Ça me rembourse le carburant et les passagers sont toujours ponctuels." },
            { name: "Mariama B.", role: "Passagère", img: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=150", text: "Fini les longues attentes à la gare routière ! Je trouve mon trajet à l'avance, on s'arrange sur le point de rendez-vous et on y va." }
          ].map((testimonial, i) => (
            <FadeInSection key={i} delay={i * 100}>
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
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* 8. FAQ COURTE */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInSection>
          <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Foire aux questions</h2>
        </FadeInSection>
        <div className="space-y-4">
          {[
            { q: "Faut-il un compte pour chercher un trajet ?", a: "Non, les passagers peuvent chercher des trajets et contacter les chauffeurs sans avoir de compte." },
            { q: "Comment contacter un chauffeur ?", a: "Vous pouvez cliquer sur 'Contacter via WhatsApp' ou appeler le numéro de téléphone indiqué sur la fiche détaillée d'un trajet." },
            { q: "Est-ce que Demandoo réserve ma place ?", a: "Non, Demandoo est uniquement une plateforme de mise en relation. Vous devez contacter le chauffeur pour confirmer qu'il a bien une place disponible pour vous." },
            { q: "Comment se passe le paiement ?", a: "Il n'y a aucun paiement en ligne sur Demandoo. Vous réglez le prix du voyage directement en espèces avec le chauffeur, selon l'accord convenu avec lui." },
            { q: "Comment proposer un trajet ?", a: "Vous devez créer un compte en cliquant sur 'Devenir chauffeur', vérifier votre profil, puis publier votre trajet." }
          ].map((faq, i) => (
            <FadeInSection key={i} delay={i * 100}>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-demandoo-200 transition-colors">
                <h3 className="font-black text-slate-900 flex items-center gap-2 mb-2"><HelpCircle className="w-4 h-4 text-demandoo-500 shrink-0" /> {faq.q}</h3>
                <p className="text-slate-600 text-sm font-medium leading-relaxed pl-6">{faq.a}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* 7. ESPACE CHAUFFEUR (CTA) */}
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
