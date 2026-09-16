import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { supabase } from '../lib/supabase';
import { INITIAL_CITIES } from '../lib/mockData';
import { 
  MapPin, 
  Map,
  Calendar, 
  Clock, 
  Car, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  Navigation,
  Plus,
  Trash2
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'demandoo_publish_trip_draft';

// Extraction et assainissement robuste du nom de ville (évite 'ere' ou coupures)
export const extractCityName = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') return (val.label || val.value || val.name || val.city || '').trim();
  return String(val).trim();
};

export const PublishTripPage = () => {
  const { user, loading: authLoading, incrementTripsUsed } = useAuth();
  const { publishTrip } = useTrips();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Form State centralisé persistant à travers les 8 étapes
  const [tripForm, setTripForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Erreur lecture brouillon:", e);
    }
    return {
      departureCity: '',
      arrivalCity: '',
      waypoints: [],
      date: '',
      time: '08:00',
      departureAddress: '',
      arrivalAddress: '',
      vehicleMake: 'Peugeot',
      vehicleModel: '508',
      vehicleColor: 'Gris',
      vehiclePlate: 'DK-8492-BC',
      seatsTotal: 4,
      pricePerSeat: 3500,
      rulesLuggage: 'Sacs de taille moyenne autorisés',
      rulesPets: false,
      rulesSmoking: false,
      cancellationPolicy: 'Annulation gratuite jusqu\'à 12h avant le départ'
    };
  });

  // Sauvegarder dans sessionStorage à chaque mise à jour du formulaire
  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(tripForm));
    } catch (e) {
      // Ignore quota storage issues
    }
  }, [tripForm]);

  const updateFormField = (field, value) => {
    setTripForm(prev => ({ ...prev, [field]: value }));
  };

  const {
    departureCity,
    arrivalCity,
    waypoints = [],
    date,
    time,
    departureAddress,
    arrivalAddress,
    vehicleMake,
    vehicleModel,
    vehicleColor,
    vehiclePlate,
    seatsTotal,
    pricePerSeat,
    rulesLuggage,
    rulesPets,
    rulesSmoking,
    cancellationPolicy
  } = tripForm;

  const setDepartureCity = (val) => updateFormField('departureCity', extractCityName(val));
  const setArrivalCity = (val) => updateFormField('arrivalCity', extractCityName(val));
  const setDate = (val) => updateFormField('date', val);
  const setTime = (val) => updateFormField('time', val);
  const setDepartureAddress = (val) => updateFormField('departureAddress', val);
  const setArrivalAddress = (val) => updateFormField('arrivalAddress', val);
  const setVehicleMake = (val) => updateFormField('vehicleMake', val);
  const setVehicleModel = (val) => updateFormField('vehicleModel', val);
  const setVehicleColor = (val) => updateFormField('vehicleColor', val);
  const setVehiclePlate = (val) => updateFormField('vehiclePlate', val);
  const setSeatsTotal = (val) => updateFormField('seatsTotal', typeof val === 'function' ? val(tripForm.seatsTotal) : val);
  const setPricePerSeat = (val) => updateFormField('pricePerSeat', typeof val === 'function' ? val(tripForm.pricePerSeat) : val);
  const setRulesLuggage = (val) => updateFormField('rulesLuggage', val);
  const setRulesPets = (val) => updateFormField('rulesPets', typeof val === 'function' ? val(tripForm.rulesPets) : val);
  const setRulesSmoking = (val) => updateFormField('rulesSmoking', typeof val === 'function' ? val(tripForm.rulesSmoking) : val);
  const setCancellationPolicy = (val) => updateFormField('cancellationPolicy', val);

  const [errorMsg, setErrorMsg] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getSuggestedPrice = (dep, arr) => {
    const d = (dep || '').toLowerCase();
    const a = (arr || '').toLowerCase();
    if ((d.includes('dakar') && a.includes('touba')) || (d.includes('touba') && a.includes('dakar'))) return { min: 3500, max: 4500, default: 4000 };
    if ((d.includes('dakar') && a.includes('saint-louis')) || (d.includes('saint-louis') && a.includes('dakar'))) return { min: 5000, max: 6500, default: 5500 };
    if ((d.includes('dakar') && a.includes('thi')) || (d.includes('thi') && a.includes('dakar'))) return { min: 1500, max: 2500, default: 2000 };
    if ((d.includes('dakar') && a.includes('mbour')) || (d.includes('mbour') && a.includes('dakar'))) return { min: 2000, max: 3000, default: 2500 };
    if ((d.includes('dakar') && a.includes('ziguinchor')) || (d.includes('ziguinchor') && a.includes('dakar'))) return { min: 9000, max: 13000, default: 10000 };
    if ((d.includes('dakar') && a.includes('kaolack')) || (d.includes('kaolack') && a.includes('dakar'))) return { min: 3000, max: 4500, default: 3500 };
    return { min: 2500, max: 5000, default: 3500 };
  };

  const addWaypoint = () => {
    if ((tripForm.waypoints || []).length < 3) {
      updateFormField('waypoints', [...(tripForm.waypoints || []), '']);
    }
  };

  const updateWaypoint = (index, value) => {
    const updated = [...(tripForm.waypoints || [])];
    updated[index] = extractCityName(value);
    updateFormField('waypoints', updated);
  };

  const removeWaypoint = (index) => {
    updateFormField('waypoints', (tripForm.waypoints || []).filter((_, i) => i !== index));
  };

  const hasActiveSub = true;
  const limitReached = user?.subscription_trip_limit !== null && user?.subscription_trip_limit !== undefined && (user?.subscription_trips_used || 0) >= user?.subscription_trip_limit;

  // Redirection uniquement si le chargement auth est complètement terminé et aucun user
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (!hasActiveSub || limitReached) {
    const isExpired = user?.subscription_status === 'expired' || (!hasActiveSub && user?.subscription_status !== 'trial');
    const isDiscovery = user?.subscription_plan === 'trial';
    const isStandard = user?.subscription_plan === 'standard';

    return (
      <div className="min-h-[85vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          
          {isExpired ? (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Abonnement expiré</h2>
              <p className="text-slate-500 mb-8">Renouvelez votre abonnement pour publier un nouveau trajet.</p>
              <Link to="/#abonnements" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black mb-3">Renouveler</Link>
            </>
          ) : isDiscovery ? (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Trajet découverte utilisé</h2>
              <p className="text-slate-500 mb-8">Votre trajet découverte a déjà été utilisé. Passez à une formule supérieure pour continuer.</p>
              <Link to="/#abonnements" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black mb-3">Choisir Standard</Link>
              <Link to="/#abonnements" className="block w-full py-4 bg-demandoo-600 text-white rounded-2xl font-black">Passer à Pro</Link>
            </>
          ) : isStandard ? (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Limite atteinte</h2>
              <p className="text-slate-500 mb-8">Vous avez utilisé vos 4 publications disponibles pour cette période. Passez à Pro pour continuer à publier sans limite.</p>
              <Link to="/#abonnements" className="block w-full py-4 bg-demandoo-600 text-white rounded-2xl font-black mb-3">Passer à Pro</Link>
              <Link to="/espace-chauffeur" className="block w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200">Plus tard</Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Abonnement requis</h2>
              <p className="text-slate-500 mb-8">Vous devez avoir un abonnement actif pour publier des trajets.</p>
              <Link to="/#abonnements" className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black mb-3">Voir les offres</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // Soumission finale avec vérification et validation complète
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (isPublishing || isSuccess) return;
    setErrorMsg('');

    // 1. VALIDATION STRICTE DE TOUS LES CHAMPS OBLIGATOIRES
    const depCity = extractCityName(tripForm.departureCity);
    const arrCity = extractCityName(tripForm.arrivalCity);
    const depAddr = (tripForm.departureAddress || '').trim();

    if (!depCity) {
      setErrorMsg("La ville de départ est obligatoire.");
      setStep(1);
      return;
    }
    if (!arrCity) {
      setErrorMsg("La ville d'arrivée est obligatoire.");
      setStep(1);
      return;
    }
    if (!tripForm.date) {
      setErrorMsg("Veuillez sélectionner une date de départ.");
      setStep(2);
      return;
    }
    if (!tripForm.time) {
      setErrorMsg("Veuillez sélectionner une heure de départ.");
      setStep(2);
      return;
    }
    if (!depAddr) {
      setErrorMsg("Le point de départ est obligatoire (ex: Gare Routière de " + depCity + ").");
      setStep(3);
      return;
    }
    if (!tripForm.seatsTotal || tripForm.seatsTotal < 1) {
      setErrorMsg("Le nombre de places doit être supérieur à 0.");
      setStep(5);
      return;
    }
    if (!tripForm.pricePerSeat || tripForm.pricePerSeat < 500) {
      setErrorMsg("Le prix par place doit être d'au moins 500 FCFA.");
      setStep(6);
      return;
    }

    // 2. VÉRIFICATION STRICTE DE LA SESSION AVANT DE DÉCLENCHER LA PUBLICATION
    let activeUser = null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      activeUser = sessionData?.session?.user;
      if (!activeUser) {
        const { data: userData } = await supabase.auth.getUser();
        activeUser = userData?.user;
      }
    } catch (checkErr) {
      console.warn("Vérification session:", checkErr);
    }

    // Si ni Supabase Auth ni user contextuel n'existent : AUTH_USER_MISSING
    if (!activeUser && !user) {
      setErrorMsg("Utilisateur non connecté. Veuillez vous connecter pour publier.");
      return;
    }

    setIsPublishing(true);

    try {
      const payloadToSend = {
        departureCity: depCity,
        arrivalCity: arrCity,
        departureAddress: depAddr,
        arrivalAddress: (tripForm.arrivalAddress || arrCity || 'Centre-ville').trim(),
        waypoints: (tripForm.waypoints || []).filter(Boolean),
        date: tripForm.date,
        time: tripForm.time,
        seatsTotal: tripForm.seatsTotal,
        pricePerSeat: tripForm.pricePerSeat,
        rulesLuggage: tripForm.rulesLuggage,
        rulesPets: tripForm.rulesPets,
        rulesSmoking: tripForm.rulesSmoking,
        cancellationPolicy: tripForm.cancellationPolicy,
        vehicleMake: tripForm.vehicleMake,
        vehicleModel: tripForm.vehicleModel,
        vehicleColor: tripForm.vehicleColor,
        vehiclePlate: tripForm.vehiclePlate
      };

      await publishTrip(payloadToSend, user);

      // Succès ! Nettoyer le brouillon et rediriger
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      incrementTripsUsed();
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/espace-chauffeur');
      }, 1200);

    } catch (err) {
      console.error("[DEMANDOO] Erreur lors de la publication :", err);
      const message = err.message || JSON.stringify(err) || "Erreur lors de la publication du trajet.";
      
      if (message.includes("429")) {
        setErrorMsg("Quota atteint : Vous avez utilisé tous vos trajets. Passez à l'abonnement Pro pour publier en illimité.");
      } else if (message.includes("401") || message.includes("non connecté")) {
        setErrorMsg("Session expirée. Veuillez vous reconnecter.");
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setErrorMsg(message);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsPublishing(false);
    }
  };

  const progressPercentage = ((step - 1) / totalSteps) * 100;

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-4 sm:py-8 lg:py-10 px-3 sm:px-6">
      <div className="w-full max-w-2xl mx-auto space-y-6 sm:space-y-8">
        
        {/* HEADER & PROGRESS BAR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/espace-chauffeur')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm min-h-[40px]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/espace-chauffeur" className="text-xs sm:text-sm font-extrabold text-slate-400 hover:text-slate-700 transition-colors py-2">
              Annuler
            </Link>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-demandoo-600 tracking-widest uppercase">
              <span>Étape {step} sur {totalSteps}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-demandoo-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>



        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-bold shadow-sm">{errorMsg}</div>
        )}

        {/* MAIN CARD CONTAINER */}
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-demandoo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

          {/* STEP 1: DEPARTURE & DESTINATION */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 mb-4">
                  <Navigation className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Quel est votre itinéraire ?
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Indiquez vos villes de départ et d'arrivée pour commencer.
                </p>
              </div>

              <div className="space-y-5 relative">
                {/* Connecting line between inputs */}
                <div className="absolute left-6 top-[3rem] bottom-[3rem] w-0.5 bg-slate-200 z-0" />

                <div className="relative z-10">
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Ville de départ</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-[3px] border-demandoo-500 bg-white z-10 group-focus-within:border-demandoo-600 transition-colors" />
                    <input
                      type="text"
                      list="cities-list-pub"
                      value={departureCity}
                      onChange={(e) => {
                        const clean = extractCityName(e.target.value);
                        setDepartureCity(clean);
                        const sug = getSuggestedPrice(clean, arrivalCity);
                        setPricePerSeat(sug.default);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Ex: Touba"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    />
                  </div>
                  {/* Suggestions rapides départ */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Touba", "Dakar", "Thiès", "Saint-Louis", "Mbour", "Kaolack"].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setDepartureCity(c);
                          const sug = getSuggestedPrice(c, arrivalCity);
                          setPricePerSeat(sug.default);
                          if (errorMsg) setErrorMsg('');
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${departureCity === c ? 'bg-demandoo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-demandoo-50 hover:text-demandoo-700'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ÉTAPES INTERMÉDIAIRES */}
                {waypoints.map((wp, idx) => (
                  <div key={idx} className="relative z-10 pl-6 border-l-2 border-dashed border-demandoo-400">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-demandoo-700 uppercase tracking-wider">
                        Étape {idx + 1} (Arrêt en route)
                      </label>
                      <button
                        type="button"
                        onClick={() => removeWaypoint(idx)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Supprimer
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-demandoo-500 z-10" />
                      <input
                        type="text"
                        list="cities-list-pub"
                        value={wp}
                        onChange={(e) => updateWaypoint(idx, e.target.value)}
                        placeholder="Ex: Thiès"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:border-demandoo-500 outline-none"
                      />
                    </div>
                  </div>
                ))}

                {waypoints.length < 3 && (
                  <div className="relative z-10">
                    <button
                      type="button"
                      onClick={addWaypoint}
                      className="inline-flex items-center gap-2 text-xs font-black text-demandoo-600 hover:text-demandoo-700 bg-demandoo-50 px-4 py-2.5 rounded-xl border border-demandoo-100 hover:bg-demandoo-100/60 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      + Ajouter un arrêt / ville intermédiaire (ex: Thiès, Mbour)
                    </button>
                  </div>
                )}

                <div className="relative z-10">
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Ville d'arrivée</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 z-10" />
                    <input
                      type="text"
                      list="cities-list-pub"
                      value={arrivalCity}
                      onChange={(e) => {
                        const clean = extractCityName(e.target.value);
                        setArrivalCity(clean);
                        const sug = getSuggestedPrice(departureCity, clean);
                        setPricePerSeat(sug.default);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Ex: Dakar"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    />
                  </div>
                  {/* Suggestions rapides arrivée */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Dakar", "Touba", "Thiès", "Saint-Louis", "Mbour", "Kaolack"].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setArrivalCity(c);
                          const sug = getSuggestedPrice(departureCity, c);
                          setPricePerSeat(sug.default);
                          if (errorMsg) setErrorMsg('');
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${arrivalCity === c ? 'bg-demandoo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-demandoo-50 hover:text-demandoo-700'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <datalist id="cities-list-pub">
                  {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!departureCity.trim()) {
                    setErrorMsg("Veuillez renseigner votre ville de départ.");
                    return;
                  }
                  if (!arrivalCity.trim()) {
                    setErrorMsg("Veuillez renseigner votre ville d'arrivée.");
                    return;
                  }
                  setErrorMsg('');
                  setStep(2);
                }}
                disabled={!departureCity || !arrivalCity}
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Quand partez-vous ?
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Précisez la date et l'heure approximative de votre départ.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Date du départ</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Heure prévue</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => { setTime(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!date) {
                    setErrorMsg("Veuillez sélectionner la date du trajet.");
                    return;
                  }
                  if (!time) {
                    setErrorMsg("Veuillez sélectionner l'heure du trajet.");
                    return;
                  }
                  setErrorMsg('');
                  setStep(3);
                }}
                disabled={!date || !time}
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 3: EXACT PICKUP & DROP OFF ADDRESSES */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Précisez vos points de RDV
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Soyez précis pour faciliter la rencontre avec vos passagers.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider ml-1">
                      Point de départ exact à <span className="text-demandoo-600">{departureCity || 'départ'}</span> <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={departureAddress}
                    onChange={(e) => { setDepartureAddress(e.target.value); if (errorMsg) setErrorMsg(''); }}
                    placeholder="Ex: Gare Routière de Touba, Station Total..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    required
                  />
                  {/* Lieux rapides suggérés */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[11px] font-bold text-slate-400 self-center">Suggestions :</span>
                    {["Gare Routière", "Centre-ville", "Station Total", "Grande Mosquée", "Station Shell"].map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          const val = `${loc}${departureCity ? ' de ' + departureCity : ''}`;
                          setDepartureAddress(val);
                          if (errorMsg) setErrorMsg('');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-demandoo-50 hover:text-demandoo-700 text-slate-600 text-xs font-bold transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">
                    Lieu d'arrivée à <span className="text-demandoo-600">{arrivalCity || 'arrivée'}</span>
                  </label>
                  <input
                    type="text"
                    value={arrivalAddress}
                    onChange={(e) => setArrivalAddress(e.target.value)}
                    placeholder="Ex: Gare des Baux Maraîchers, Arrêt Bus..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[11px] font-bold text-slate-400 self-center">Suggestions :</span>
                    {["Gare des Baux Maraîchers", "Rond-point Liberté 6", "Centre-ville", "Gare Routière"].map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setArrivalAddress(loc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-demandoo-50 hover:text-demandoo-700 text-slate-600 text-xs font-bold transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!departureAddress || !departureAddress.trim()) {
                    setErrorMsg(`Le point de départ à ${departureCity || 'votre ville'} est obligatoire.`);
                    return;
                  }
                  setErrorMsg('');
                  setStep(4);
                }}
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 4: VEHICLE INFO */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 mb-4">
                  <Car className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Votre véhicule
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Les passagers aiment savoir dans quelle voiture ils voyageront.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Marque</label>
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Modèle</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Couleur</label>
                  <input
                    type="text"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Immatriculation</label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(5)}
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 5: NUMBER OF SEATS */}
          {step === 5 && (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Combien de passagers ?
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Sélectionnez le nombre de places que vous proposez.
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 py-6">
                <button
                  type="button"
                  onClick={() => seatsTotal > 1 && setSeatsTotal(seatsTotal - 1)}
                  className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center text-2xl font-black text-slate-400 hover:border-demandoo-500 hover:text-demandoo-600 transition-colors disabled:opacity-30"
                  disabled={seatsTotal <= 1}
                >
                  -
                </button>
                <div className="text-center w-32">
                  <span className="text-5xl font-black text-slate-900 block">{seatsTotal}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mt-2">places libres</span>
                </div>
                <button
                  type="button"
                  onClick={() => seatsTotal < 4 && setSeatsTotal(seatsTotal + 1)}
                  className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center text-2xl font-black text-slate-400 hover:border-demandoo-500 hover:text-demandoo-600 transition-colors disabled:opacity-30"
                  disabled={seatsTotal >= 4}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep(6)}
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 6: PRICE PER SEAT */}
          {step === 6 && (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 mb-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Fixez votre prix
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Le juste prix attire plus vite des passagers.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    min={1000}
                    max={25000}
                    step={500}
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(parseInt(e.target.value, 10))}
                    className="w-full text-center py-6 rounded-3xl bg-slate-50 border-2 border-slate-200 text-3xl font-black text-demandoo-600 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">FCFA</span>
                </div>
                <div className="p-4 bg-demandoo-50/50 rounded-2xl border border-demandoo-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-demandoo-100 flex items-center justify-center text-demandoo-600 shrink-0">💡</div>
                  <p className="text-xs text-demandoo-800 font-medium leading-relaxed">
                    Prix conseillé pour le trajet <strong>{departureCity || 'Départ'} ➔ {arrivalCity || 'Arrivée'}</strong> : <strong className="font-black text-demandoo-600">{getSuggestedPrice(departureCity, arrivalCity).min.toLocaleString('fr-FR')} - {getSuggestedPrice(departureCity, arrivalCity).max.toLocaleString('fr-FR')} FCFA</strong>. Cela garantit un remplissage rapide de votre véhicule.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(7)}
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 7: RULES & AMENITIES */}
          {step === 7 && (
            <div className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-demandoo-50 flex items-center justify-center text-demandoo-600 mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Derniers détails
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Quelles sont vos préférences pour ce voyage ?
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Volume des bagages</label>
                  <select
                    value={rulesLuggage}
                    onChange={(e) => setRulesLuggage(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none appearance-none"
                  >
                    <option value="Sacs de taille moyenne autorisés">Moyen (Sacs de voyage)</option>
                    <option value="Grands bagages autorisés">Grand (Valises en soute)</option>
                    <option value="Petits bagages uniquement">Petit (Sacs à dos uniquement)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <label className={`cursor-pointer flex flex-row sm:flex-col items-center justify-start sm:justify-center p-3.5 sm:p-5 rounded-2xl border-2 transition-all gap-3 sm:gap-2 ${rulesSmoking ? 'border-demandoo-500 bg-demandoo-50 text-demandoo-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={rulesSmoking} onChange={(e) => setRulesSmoking(e.target.checked)} className="sr-only" />
                    <span className="text-2xl">🚬</span>
                    <span className="text-xs font-bold text-left sm:text-center">Fumeur autorisé</span>
                  </label>

                  <label className={`cursor-pointer flex flex-row sm:flex-col items-center justify-start sm:justify-center p-3.5 sm:p-5 rounded-2xl border-2 transition-all gap-3 sm:gap-2 ${rulesPets ? 'border-demandoo-500 bg-demandoo-50 text-demandoo-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={rulesPets} onChange={(e) => setRulesPets(e.target.checked)} className="sr-only" />
                    <span className="text-2xl">🐾</span>
                    <span className="text-xs font-bold text-left sm:text-center">Animaux acceptés</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(8)}
                className="w-full min-h-[48px] mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Vérifier le récapitulatif <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 8: RECAP & CONFIRM PUBLISH */}
          {step === 8 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6 sm:space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2 text-center">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <ShieldCheck className="w-7 sm:w-8 h-7 sm:h-8" />
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Prêt à publier !
                </h2>
                <p className="text-slate-500 font-medium text-xs sm:text-sm">
                  Vérifiez une dernière fois vos informations.
                </p>
              </div>

              <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] border border-slate-100 space-y-4 shadow-inner">
                <div className="flex flex-col items-center justify-center text-center space-y-1 pb-4 border-b border-slate-200">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{date} à {time}</span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 flex flex-wrap items-center justify-center gap-2">
                    <span>{departureCity}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                    <span>{arrivalCity}</span>
                  </div>
                  <span className="inline-block mt-2 px-3 py-1 bg-demandoo-100 text-demandoo-700 rounded-full font-black text-xs sm:text-sm">
                    {pricePerSeat.toLocaleString('fr-FR')} FCFA <span className="font-medium text-[11px]">/ place</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block text-slate-400 font-bold uppercase mb-0.5">Véhicule</span>
                    <span className="font-bold text-slate-800">{vehicleMake} {vehicleModel}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase mb-0.5">Places offertes</span>
                    <span className="font-bold text-slate-800">{seatsTotal} passagers max</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-slate-400 font-bold uppercase mb-0.5">Point de départ</span>
                    <span className="font-bold text-slate-800 break-words">{departureAddress}</span>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm font-bold shadow-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isPublishing || isSuccess}
                className="w-full min-h-[48px] mt-6 sm:mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg shadow-demandoo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-300 animate-bounce" />
                    <span>Trajet publié avec succès ! Redirection...</span>
                  </>
                ) : isPublishing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publication en cours...</span>
                  </>
                ) : (
                  <span>Publier le trajet maintenant</span>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
