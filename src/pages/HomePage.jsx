import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Star,
  Car,
  Phone,
  BadgePercent,
  Wallet,
  Clock,
  Check,
  ChevronDown,
  Smartphone,
  ArrowLeftRight,
} from 'lucide-react';
import { useTrips } from '../context/TripContext';
import { INITIAL_CITIES } from '../lib/mockData';
import { SENEGAL_DESTINATIONS, SENEGAL_REGIONS } from '../data/destinationsData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Reveal } from '../components/common/Reveal';
import { TripCard } from '../components/common/TripCard';
import { VoiceSearch } from '../components/common/VoiceSearch';

// ─── Contenu ─────────────────────────────────────────────────────────────────

const CONTACT_PHONE = '+221785324040';
const CONTACT_PHONE_LABEL = '+221 78 532 40 40';

const POPULAR_LINES = [
  { city: 'Dakar', image: '/images/touba-dakar.jpg', alt: 'Monument de la Renaissance africaine à Dakar' },
  { city: 'Thiès', image: '/images/touba-thies.jpg', alt: 'Statue de Lat Dior à Thiès' },
  { city: 'Saint-Louis', image: '/images/touba-saint-louis.jpg', alt: 'Pont Faidherbe à Saint-Louis' },
  { city: 'Mbour', image: '/images/touba-mbour.jpg', alt: 'Littoral de Mbour et Saly' },
];

const REASONS = [
  { icon: ShieldCheck, title: 'Chauffeurs vérifiés', text: 'Pièce d’identité et permis contrôlés avant le badge.' },
  { icon: BadgePercent, title: 'Zéro commission', text: 'Le prix convenu revient entièrement au chauffeur.' },
  { icon: MessageCircle, title: 'Contact direct', text: 'Appel ou WhatsApp, sans intermédiaire.' },
  { icon: Wallet, title: 'Paiement simple', text: 'Espèces, Wave ou Orange Money, selon votre accord.' },
];

const STEPS = [
  { icon: Search, title: 'Cherchez', text: 'Indiquez votre destination et votre date de départ.' },
  { icon: MessageCircle, title: 'Contactez', text: 'Échangez avec le chauffeur par téléphone ou WhatsApp.' },
  { icon: Car, title: 'Voyagez', text: 'Convenez du rendez-vous et du prix, puis prenez la route.' },
];

const DEFAULT_PLANS = { trial: 0, standard: 2400, pro: 4900 };
const PLANS = [
  { slug: 'trial', name: 'Découverte', tagline: 'Pour tester avec un premier trajet', features: ['1 trajet offert', 'Profil chauffeur', 'Zéro commission'], cta: 'Commencer' },
  { slug: 'standard', name: 'Standard', tagline: 'Pour quelques trajets par mois', features: ['4 trajets par mois', 'Support prioritaire', 'Zéro commission'], cta: 'Choisir Standard', featured: true },
  { slug: 'pro', name: 'Pro', tagline: 'Pour les chauffeurs réguliers', features: ['Trajets illimités', 'Visibilité prioritaire', 'Badge « Chauffeur Pro »'], cta: 'Devenir Pro' },
];

export const HOME_FAQS = [
  { q: 'Faut-il un compte pour chercher un trajet ?', a: 'Non. Les passagers cherchent un trajet et contactent le chauffeur sans créer de compte.' },
  { q: 'Comment contacter un chauffeur ?', a: 'Depuis la fiche du trajet, appelez le chauffeur ou écrivez-lui sur WhatsApp en un clic.' },
  { q: 'Demandoo réserve-t-il ma place ?', a: 'Non. Demandoo met en relation : confirmez directement avec le chauffeur qu’une place est disponible.' },
  { q: 'Comment se passe le paiement ?', a: 'Aucun paiement en ligne pour les passagers. Vous réglez le chauffeur selon votre accord : espèces, Wave ou Orange Money.' },
  { q: 'Comment proposer un trajet ?', a: 'Cliquez sur « Devenir chauffeur », faites vérifier votre profil, puis publiez votre trajet en quelques minutes.' },
];

// « Fatou Diop » → « Fatou D. » (respect de la vie privée)
const formatReviewerName = (fullName) => {
  const parts = (fullName || 'Passager').trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1].charAt(0)}.` : parts[0];
};

// « 2h 45m » → « 2 h 45 »
const formatDuration = (d) => d.replace(/h\s*/, ' h ').replace(/m$/, '').replace(/ h 00$/, ' h').trim();

// ─── Primitives visuelles ────────────────────────────────────────────────────

const SectionHeading = ({ id, eyebrow, title, text, align = 'center', tone = 'light' }) => (
  <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
    {eyebrow && (
      <p className={`text-xs font-extrabold uppercase tracking-[0.18em] mb-3 ${tone === 'dark' ? 'text-brand-lime' : 'text-demandoo-600'}`}>
        {eyebrow}
      </p>
    )}
    <h2 id={id} className={`text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight ${tone === 'dark' ? 'text-white' : 'text-brand-dark'}`}>
      {title}
    </h2>
    {text && (
      <p className={`mt-4 text-base sm:text-lg leading-relaxed ${tone === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
        {text}
      </p>
    )}
  </div>
);

const LimeButton = ({ as: Component = Link, className = '', children, ...props }) => (
  <Component
    className={`inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full bg-brand-lime text-brand-dark font-extrabold text-sm shadow-[0_8px_24px_-8px_rgba(198,242,78,0.7)] hover:bg-brand-lime-dark active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-lime/50 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

const inputClass = 'w-full min-h-[52px] rounded-2xl border border-slate-200 bg-brand-mist pl-11 pr-4 font-semibold text-brand-dark placeholder:text-slate-400 focus:outline-none focus:border-demandoo-500 focus:ring-4 focus:ring-demandoo-500/15 transition';

const Field = ({ id, label, icon: Icon, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={id} className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
      {children}
    </div>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export const HomePage = () => {
  const navigate = useNavigate();
  const { trips } = useTrips();

  const [departure, setDeparture] = useState('Touba');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const destinationRef = useRef(null);

  const [reviews, setReviews] = useState([]);
  const [planPrices, setPlanPrices] = useState(DEFAULT_PLANS);
  const [openFaq, setOpenFaq] = useState(0);

  // Liens « /#faq », « /#comment-ca-marche » depuis une autre page : défiler une fois la page rendue
  useEffect(() => {
    if (!window.location.hash) return;
    const target = document.querySelector(window.location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    // Vrais avis laissés après un trajet (aucun avis fictif)
    supabase
      .from('reviews')
      .select('id, rating, comment, passenger:profiles!reviews_passenger_id_fkey(full_name)')
      .gte('rating', 4)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setReviews(data.filter(r => (r.comment || '').trim().length >= 20));
      });

    // Prix réellement facturés (table subscription_plans)
    supabase
      .from('subscription_plans')
      .select('slug, monthly_price')
      .eq('active', true)
      .then(({ data, error }) => {
        if (cancelled || error || !data?.length) return;
        setPlanPrices(prev => data.reduce((acc, p) => ({ ...acc, [p.slug]: p.monthly_price }), { ...prev }));
      });

    return () => { cancelled = true; };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (departure) query.set('departure', departure);
    if (destination) query.set('destination', destination);
    if (date) query.set('date', date);
    if (Number(passengers) > 1) query.set('passengers', String(passengers));
    navigate(`/trajets?${query.toString()}`);
  };

  const searchLine = (city) => navigate(`/trajets?departure=Touba&destination=${encodeURIComponent(city)}`);

  const handleSwap = () => {
    setDeparture(destination);
    setDestination(departure);
  };

  // Uniquement les départs à venir, du plus proche au plus lointain
  const now = Date.now();
  const availableTrips = trips
    .filter(t => t.status === 'scheduled' && new Date(t.departure_datetime).getTime() > now)
    .sort((a, b) => new Date(a.departure_datetime) - new Date(b.departure_datetime))
    .slice(0, 6);
  const lines = POPULAR_LINES.map(line => ({
    ...line,
    info: SENEGAL_DESTINATIONS.find(d => d.city === line.city),
  }));
  const popularCount = SENEGAL_DESTINATIONS.filter(d => d.popular).length;
  const regionCount = SENEGAL_REGIONS.filter(r => r !== 'Toutes').length;

  return (
    <div className="bg-white text-brand-dark font-sans">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="relative bg-brand-dark text-white overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-15%] w-[680px] h-[680px] rounded-full bg-brand-lime/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:28px_28px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-36 sm:pb-40 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] items-center gap-8 lg:gap-10">
          <div className="text-center lg:text-left animate-fade-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs sm:text-sm font-bold text-brand-lime">
              <Star className="w-4 h-4" fill="currentColor" aria-hidden="true" />
              Le covoiturage de confiance au Sénégal
            </p>
            <h1 id="hero-title" className="mt-6 text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold tracking-tight leading-[1.05]">
              Depuis Touba,<br />
              voyagez <span className="text-brand-lime">partout</span><br className="hidden sm:block" /> au Sénégal.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Trouvez un chauffeur vérifié, contactez-le directement et partagez la route. Simple, local, sans commission.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <LimeButton as="a" href="#recherche" className="w-full sm:w-auto">
                <Search className="w-4 h-4" aria-hidden="true" /> Trouver un trajet
              </LimeButton>
              <Link
                to="/inscription-chauffeur"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full border border-white/25 font-bold text-sm hover:bg-white/10 transition w-full sm:w-auto"
              >
                <Car className="w-4 h-4" aria-hidden="true" /> Devenir chauffeur
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div aria-hidden="true" className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-10 rounded-[100%] bg-black/40 blur-2xl" />
            <img
              src="/images/demandoo-car-app.png"
              alt="Voiture aux couleurs de Demandoo devant l’application mobile affichant une fiche de trajet"
              width="622"
              height="506"
              fetchpriority="high"
              className="relative w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[580px] h-auto motion-safe:animate-float"
            />
          </div>
        </div>
      </section>

      {/* ── 2. RECHERCHE (carte en chevauchement) ────────────────────────── */}
      <section id="recherche" aria-labelledby="search-title" className="relative z-10 -mt-24 sm:-mt-28 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-[0_24px_60px_-20px_rgba(10,30,74,0.35)] ring-1 ring-slate-200/70 p-5 sm:p-8">
          <h2 id="search-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">Où allez-vous ?</h2>
          <form onSubmit={handleSearchSubmit} className="mt-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:items-end">
              <Field id="home-departure" label="Départ" icon={MapPin}>
                <input id="home-departure" type="text" list="cities-list" autoComplete="off" value={departure}
                  onChange={(e) => setDeparture(e.target.value)} placeholder="Ex. Touba" className={inputClass} />
              </Field>
              <button type="button" onClick={handleSwap} aria-label="Inverser départ et destination"
                className="mx-auto md:mb-1 w-11 h-11 rounded-full border border-slate-200 bg-white text-brand-dark flex items-center justify-center hover:bg-brand-mist transition rotate-90 md:rotate-0">
                <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <Field id="home-destination" label="Destination" icon={MapPin}>
                <input id="home-destination" ref={destinationRef} type="text" list="cities-list" autoComplete="off" value={destination}
                  onChange={(e) => setDestination(e.target.value)} placeholder="Ex. Dakar" className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_1.2fr] gap-3 items-end">
              <Field id="home-date" label="Date" icon={Calendar}>
                <input id="home-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
              </Field>
              <Field id="home-passengers" label="Passagers" icon={Users}>
                <select id="home-passengers" value={passengers} onChange={(e) => setPassengers(e.target.value)} className={`${inputClass} appearance-none`}>
                  {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} {n > 1 ? 'places' : 'place'}</option>)}
                </select>
              </Field>
              <LimeButton as="button" type="submit" className="col-span-2 md:col-span-1 w-full rounded-2xl min-h-[52px]">
                <Search className="w-4 h-4" aria-hidden="true" /> Rechercher
              </LimeButton>
            </div>
          </form>
          <datalist id="cities-list">
            {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
          </datalist>
          <VoiceSearch onManualSearch={() => destinationRef.current?.focus()} />
        </div>
      </section>

      {/* ── 3. POURQUOI DEMANDOO ─────────────────────────────────────────── */}
      <section aria-labelledby="why-title" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionHeading id="why-title" eyebrow="Pourquoi Demandoo" title="Le trajet partagé, en toute confiance" text="Pensé à Touba pour les voyageurs et les chauffeurs du Sénégal." />
          </Reveal>
          <ul className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {REASONS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 80} className="h-full">
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70 transition">
                    <span className="mx-auto mb-4 flex w-12 h-12 items-center justify-center rounded-xl bg-brand-lime/30 text-demandoo-700">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </span>
                    <h3 className="font-extrabold text-brand-dark">{title}</h3>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 4. CONFIANCE (texte + photo) ─────────────────────────────────── */}
      <section aria-labelledby="trust-title" className="bg-brand-mist py-20 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-[minmax(0,1fr)] lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <SectionHeading id="trust-title" align="left" eyebrow="Votre route, notre engagement" title="Arrivez à destination l’esprit tranquille" text="Le badge « Vérifié » signifie que le chauffeur a fourni une pièce d’identité et un permis valides, contrôlés par notre équipe. Vous savez qui vous conduit avant de partir." />
            <ul className="mt-6 space-y-3">
              {['Profils et véhicules présentés en détail', 'Avis laissés par de vrais passagers', 'Échange direct avant le départ'].map(item => (
                <li key={item} className="flex items-center gap-3 font-semibold text-slate-700">
                  <span className="flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-brand-lime text-brand-dark"><Check className="w-3.5 h-3.5" aria-hidden="true" /></span>
                  {item}
                </li>
              ))}
            </ul>
            <LimeButton to="/trajets" className="mt-8">
              Voir les trajets <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </LimeButton>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative mr-3 mb-3 sm:mr-5 sm:mb-5">
              <div aria-hidden="true" className="absolute -right-3 -bottom-3 sm:-right-5 sm:-bottom-5 w-full h-full rounded-[2rem] bg-brand-lime" />
              <img
                src="/hero-natural.jpg"
                alt="Voyageuse souriante avec ses bagages devant un véhicule, prête à partir"
                width="1200"
                height="896"
                loading="lazy"
                decoding="async"
                className="relative w-full h-auto rounded-[2rem] object-cover shadow-xl"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5. LIGNES POPULAIRES ─────────────────────────────────────────── */}
      <section aria-labelledby="lines-title" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionHeading id="lines-title" eyebrow="Au départ de Touba" title="Les lignes les plus demandées" text="Durées et prix indicatifs : le tarif final se convient avec le chauffeur." />
          </Reveal>
          <ul className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {lines.map(({ city, image, alt, info }, i) => {
              const featured = i === 0;
              return (
                <li key={city}>
                  <Reveal delay={i * 80} className="h-full">
                    <button
                      type="button"
                      onClick={() => searchLine(city)}
                      aria-label={`Voir les trajets Touba → ${city}`}
                      className={`group h-full w-full text-left rounded-3xl p-3 transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-lime/60 ${featured ? 'bg-brand-lime shadow-lg shadow-brand-lime/30' : 'bg-white border border-slate-200 hover:shadow-lg hover:shadow-slate-200/70'}`}
                    >
                      <div className="relative overflow-hidden rounded-2xl aspect-[16/9] sm:aspect-[4/3]">
                        <img src={image} alt={alt} loading="lazy" decoding="async" className="w-full h-full object-cover transition duration-500 motion-safe:group-hover:scale-105" />
                        {featured && (
                          <span className="absolute top-3 right-3 rounded-full bg-brand-dark px-3 py-1 text-xs font-bold text-brand-lime">La plus demandée</span>
                        )}
                      </div>
                      <div className="px-2 pt-4 pb-2">
                        <p className={`text-xs font-bold uppercase tracking-wider ${featured ? 'text-brand-dark/70' : 'text-slate-500'}`}>Touba →</p>
                        <h3 className="text-lg font-extrabold">{city}</h3>
                        {info && (
                          <div className={`mt-3 flex items-center justify-between text-sm font-semibold ${featured ? 'text-brand-dark' : 'text-slate-600'}`}>
                            <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" aria-hidden="true" />{formatDuration(info.duration)}</span>
                            <span className="font-extrabold">≈ {info.priceEstimate}</span>
                          </div>
                        )}
                      </div>
                    </button>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 6. TRAJETS DISPONIBLES (affichés seulement s'il y en a) ──────── */}
      {availableTrips.length > 0 && (
        <section aria-labelledby="trips-title" className="bg-brand-dark py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <SectionHeading id="trips-title" align="left" tone="dark" eyebrow="En direct" title="Prochains départs" />
              <LimeButton to="/trajets" className="self-start sm:self-auto">
                Tous les trajets <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </LimeButton>
            </div>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTrips.map((trip, idx) => <TripCard key={trip.id} trip={trip} index={idx} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. APPLICATION ───────────────────────────────────────────────── */}
      <section aria-labelledby="app-title" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[2rem] bg-brand-dark text-white grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1.3fr_1fr]">
            <div className="relative z-10 p-8 sm:p-12">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-lime">Application mobile</p>
              <h2 id="app-title" className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Demandoo dans votre poche</h2>
              <p className="mt-4 text-white/70 text-base sm:text-lg max-w-md">Retrouvez vos trajets, vos chauffeurs et vos notifications, même avec une connexion faible.</p>
              <div className="mt-8">
                <LimeButton as="a" href="/demandoo.apk" download="demandoo.apk">
                  <Smartphone className="w-4 h-4" aria-hidden="true" /> Télécharger pour Android
                </LimeButton>
              </div>
              <p className="mt-3 text-xs text-white/55">Fichier APK · version iPhone bientôt disponible</p>
            </div>
            <div className="relative min-h-[260px] md:min-h-0 bg-brand-lime md:rounded-l-[3rem] flex items-end justify-center overflow-hidden">
              <img src="/images/demandoo-app-phone.png" alt="Écran de l’application Demandoo affichant une fiche de trajet" width="250" height="300" loading="lazy" decoding="async"
                className="relative w-[220px] sm:w-[250px] h-auto translate-y-6 drop-shadow-2xl" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 8. CHIFFRES (tirés des données du site, aucun chiffre inventé) ── */}
      <section aria-labelledby="numbers-title" className="pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 id="numbers-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">Touba relié à tout le Sénégal</h2>
          <dl className="mt-10 grid grid-cols-3 divide-x divide-slate-200">
            {[
              { value: regionCount, label: 'régions desservies' },
              { value: popularCount, label: 'lignes populaires' },
              { value: '0 %', label: 'de commission' },
            ].map(({ value, label }) => (
              <div key={label} className="px-2 flex flex-col-reverse">
                <dt className="mt-2 text-xs sm:text-sm font-semibold text-slate-500">{label}</dt>
                <dd className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-dark">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 9. FORMULES CHAUFFEURS ───────────────────────────────────────── */}
      <section id="abonnements" aria-labelledby="plans-title" className="bg-brand-mist py-20 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <SectionHeading id="plans-title" eyebrow="Pour les chauffeurs" title="Des formules à votre rythme" text="Publiez vos trajets sans commission sur vos gains. Sans engagement." />
          </Reveal>
          <ul className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 items-stretch">
            {PLANS.map((plan, i) => {
              const price = planPrices[plan.slug] ?? DEFAULT_PLANS[plan.slug];
              return (
                <li key={plan.slug}>
                  <Reveal delay={i * 80} className="h-full">
                    <div className={`relative h-full flex flex-col rounded-3xl p-7 ${plan.featured ? 'bg-brand-lime text-brand-dark shadow-xl shadow-brand-lime/30 md:-translate-y-3' : 'bg-white border border-slate-200'}`}>
                      {plan.featured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-dark px-4 py-1 text-xs font-bold text-brand-lime">Recommandé</span>
                      )}
                      <h3 className="text-lg font-extrabold">{plan.name}</h3>
                      <p className={`mt-1 text-sm ${plan.featured ? 'text-brand-dark/75' : 'text-slate-500'}`}>{plan.tagline}</p>
                      <p className="mt-6 flex items-baseline gap-1.5">
                        <span className="text-4xl font-extrabold tracking-tight">{price === 0 ? 'Gratuit' : Number(price).toLocaleString('fr-FR')}</span>
                        {price > 0 && <span className={`text-sm font-semibold ${plan.featured ? 'text-brand-dark/70' : 'text-slate-500'}`}>FCFA / mois</span>}
                      </p>
                      <ul className="mt-6 space-y-3 flex-1">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2.5 text-sm font-semibold">
                            <Check className={`w-4 h-4 shrink-0 ${plan.featured ? 'text-brand-dark' : 'text-demandoo-600'}`} aria-hidden="true" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/abonnement"
                        className={`mt-8 inline-flex items-center justify-center min-h-12 rounded-full font-extrabold text-sm transition ${plan.featured ? 'bg-brand-dark text-white hover:bg-brand-blue' : 'border border-slate-300 hover:border-brand-dark hover:bg-brand-mist'}`}
                      >
                        {plan.cta}<span className="sr-only"> — formule {plan.name}</span>
                      </Link>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── 10. AVIS (uniquement de vrais avis, masqué s'il y en a moins de 3) ── */}
      {reviews.length >= 3 && (
        <section aria-labelledby="reviews-title" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionHeading id="reviews-title" eyebrow="Avis vérifiés" title="Ce qu’en disent nos passagers" />
            </Reveal>
            <ul className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
              {reviews.slice(0, 3).map((review, i) => (
                <li key={review.id}>
                  <Reveal delay={i * 80} className="h-full">
                    <figure className="h-full flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div>
                        <div className="flex gap-1" role="img" aria-label={`${review.rating} étoiles sur 5`}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} aria-hidden="true" className={`w-4 h-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          ))}
                        </div>
                        <blockquote className="mt-4 text-slate-700 leading-relaxed">« {review.comment} »</blockquote>
                      </div>
                      <figcaption className="mt-6 flex items-center gap-3">
                        <span aria-hidden="true" className="flex w-10 h-10 items-center justify-center rounded-full bg-brand-lime font-extrabold">
                          {(review.passenger?.full_name || 'P').charAt(0).toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-extrabold">{formatReviewerName(review.passenger?.full_name)}</span>
                          <span className="block text-sm text-slate-500">Passager · trajet effectué</span>
                        </span>
                      </figcaption>
                    </figure>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── 11. COMMENT ÇA MARCHE ────────────────────────────────────────── */}
      <section id="comment-ca-marche" aria-labelledby="how-title" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <SectionHeading id="how-title" eyebrow="Comment ça marche" title="Trois étapes, et c’est parti" text="Demandoo met en relation : l’accord et le paiement se font directement entre passager et chauffeur." />
          </Reveal>
          <ol className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 100} className="h-full">
                  <div className="h-full rounded-3xl border border-slate-200 bg-white p-7">
                    <div className="flex items-center justify-between">
                      <span className="flex w-12 h-12 items-center justify-center rounded-xl bg-brand-dark text-brand-lime">
                        <Icon className="w-6 h-6" aria-hidden="true" />
                      </span>
                      <span aria-hidden="true" className="text-5xl font-extrabold text-slate-100">0{i + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-extrabold"><span className="sr-only">Étape {i + 1} : </span>{title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <LimeButton as="a" href="#recherche">Commencer ma recherche <ArrowRight className="w-4 h-4" aria-hidden="true" /></LimeButton>
          </div>
        </div>
      </section>

      {/* ── 12. DEVENIR CHAUFFEUR ────────────────────────────────────────── */}
      <section aria-labelledby="driver-title" className="bg-brand-mist py-20 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-[minmax(0,1fr)] lg:grid-cols-2 gap-12 items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="relative mt-3 sm:mt-5 max-w-[440px] mx-auto lg:mr-0 lg:ml-5">
              <div aria-hidden="true" className="absolute -left-3 -top-3 sm:-left-5 sm:-top-5 w-full h-full rounded-[2rem] bg-brand-dark" />
              <img
                src="/images/demandoo-driver.jpg"
                alt="Voyageuse ravie montrant une fiche de trajet Demandoo, devant une voiture aux couleurs de la marque"
                width="404"
                height="426"
                loading="lazy"
                decoding="async"
                className="relative w-full h-auto rounded-[2rem] object-cover shadow-xl"
              />
            </div>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <SectionHeading id="driver-title" align="left" eyebrow="Chauffeurs" title="Vous partez ? Rentabilisez la route" text="Publiez votre trajet en quelques minutes : les passagers vous contactent directement, et vous gardez 100 % du prix convenu." />
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <LimeButton to="/inscription-chauffeur">Devenir chauffeur <ArrowRight className="w-4 h-4" aria-hidden="true" /></LimeButton>
              <Link to="/login" className="inline-flex items-center justify-center min-h-12 px-6 rounded-full border border-slate-300 font-bold text-sm hover:border-brand-dark transition">
                J’ai déjà un compte
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 13. FAQ ──────────────────────────────────────────────────────── */}
      <section id="faq" aria-labelledby="faq-title" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <SectionHeading id="faq-title" eyebrow="Questions fréquentes" title="Tout savoir avant de partir" />
          <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
            {HOME_FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={open}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      className="w-full flex items-center justify-between gap-4 py-5 text-left font-extrabold hover:text-demandoo-700 transition"
                    >
                      {faq.q}
                      <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                  </h3>
                  <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!open} className="pb-5 text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 14. CONTACT ──────────────────────────────────────────────────── */}
      <section aria-labelledby="contact-title" className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        <div className="relative max-w-6xl mx-auto overflow-hidden rounded-[2rem] bg-brand-dark text-white grid grid-cols-[minmax(0,1fr)] md:grid-cols-[1.2fr_1fr] items-stretch">
          <div className="relative z-10 p-8 sm:p-12">
            <h2 id="contact-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight">Une question ? Parlons-en.</h2>
            <p className="mt-4 text-white/70 max-w-md">Notre équipe à Touba vous répond par téléphone ou sur WhatsApp.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <LimeButton as="a" href={`tel:${CONTACT_PHONE}`}>
                <Phone className="w-4 h-4" aria-hidden="true" /> {CONTACT_PHONE_LABEL}
              </LimeButton>
              <a
                href={`https://wa.me/${CONTACT_PHONE.replace('+', '')}?text=${encodeURIComponent('Bonjour Demandoo, j’ai une question.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full border border-white/25 font-bold text-sm hover:bg-white/10 transition"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" /> Écrire sur WhatsApp
              </a>
            </div>
          </div>
          <div className="relative min-h-[220px] bg-brand-lime md:rounded-l-[3rem] flex items-center justify-center p-6">
            <img src="/images/demandoo-car-app.png" alt="" width="622" height="506" loading="lazy" decoding="async" className="w-full max-w-[340px] h-auto drop-shadow-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
};
