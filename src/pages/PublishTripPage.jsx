import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
import { supabase } from '../lib/supabase';
import { INITIAL_CITIES } from '../lib/mockData';
import { TripCreationLayout, StepHeader, PrimaryButton, FormField } from '../components/PublishTrip/Layout';
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
    <TripCreationLayout 
      step={step} 
      totalSteps={totalSteps} 
      onBack={() => step > 1 ? setStep(step - 1) : navigate('/espace-chauffeur')}
      errorMsg={errorMsg}
    >
      
      {/* STEP 1: ITINÉRAIRE */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Navigation} 
            title="Quel est votre itinéraire ?" 
            description="Indiquez votre ville de départ et votre destination." 
          />

          <div className="space-y-5 relative mt-8">
            <div className="absolute left-[23px] top-[40px] bottom-[40px] w-[2px] bg-[#E4EBE8] z-0" />

            <div className="relative z-10">
              <FormField label="Ville de départ" required>
                <div className="relative group">
                  <div className="absolute left-[19px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-[2.5px] border-[#101828] bg-white z-10 group-focus-within:border-demandoo-600 transition-colors" />
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
                    className="w-full h-[60px] pl-[48px] pr-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                  />
                </div>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-2 ml-[48px]">
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
                      className={`px-3 py-1.5 rounded-[8px] text-[13px] font-bold transition-all ${departureCity === c ? 'bg-[#101828] text-white' : 'bg-[#F7FAF9] text-[#667085] hover:bg-[#EFF9F6] hover:text-demandoo-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            {/* WAYPOINTS */}
            {waypoints.map((wp, idx) => (
              <div key={idx} className="relative z-10 ml-[48px]">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="publish-field-1" className="text-[12px] font-bold text-[#667085] uppercase">
                    Arrêt {idx + 1}
                  </label>
                  <button
                    type="button"
                    onClick={() => removeWaypoint(idx)}
                    className="text-[12px] font-bold text-[#F04438] hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute -left-[29.5px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[#667085] z-10 border-2 border-white" />
                  <input id="publish-field-1"
                    type="text"
                    list="cities-list-pub"
                    value={wp}
                    onChange={(e) => updateWaypoint(idx, e.target.value)}
                    placeholder="Ex: Thiès"
                    className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>
              </div>
            ))}

            {waypoints.length < 3 && (
              <div className="relative z-10 ml-[48px]">
                <button
                  type="button"
                  onClick={addWaypoint}
                  className="inline-flex items-center gap-2 text-[13px] font-bold text-[#667085] hover:text-[#101828] py-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un arrêt
                </button>
              </div>
            )}

            <div className="relative z-10">
              <FormField label="Ville d'arrivée" required>
                <div className="relative group">
                  <MapPin className="absolute left-[16px] top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 z-10" />
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
                    className="w-full h-[60px] pl-[48px] pr-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                  />
                </div>
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mt-2 ml-[48px]">
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
                      className={`px-3 py-1.5 rounded-[8px] text-[13px] font-bold transition-all ${arrivalCity === c ? 'bg-[#101828] text-white' : 'bg-[#F7FAF9] text-[#667085] hover:bg-[#EFF9F6] hover:text-demandoo-700'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <datalist id="cities-list-pub">
              {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!departureCity.trim()) { setErrorMsg("Veuillez renseigner votre ville de départ."); return; }
              if (!arrivalCity.trim()) { setErrorMsg("Veuillez renseigner votre ville d'arrivée."); return; }
              if (departureCity.trim().toLowerCase() === arrivalCity.trim().toLowerCase()) { setErrorMsg("La ville de départ et d'arrivée ne peuvent pas être identiques."); return; }
              setErrorMsg(''); setStep(2);
            }}
            disabled={!departureCity || !arrivalCity}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 2: DATE & TIME */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Calendar} 
            title="Quand partez-vous ?" 
            description="Indiquez la date et l'heure prévues de votre départ." 
          />

          <div className="space-y-6 mt-8">
            <FormField label="Date du départ" required>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setDate(e.target.value); if (errorMsg) setErrorMsg(''); }}
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                required
              />
            </FormField>

            <FormField label="Heure de départ" required>
              <input
                type="time"
                value={time}
                onChange={(e) => { setTime(e.target.value); if (errorMsg) setErrorMsg(''); }}
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                required
              />
            </FormField>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!date) { setErrorMsg("Veuillez sélectionner la date du trajet."); return; }
              if (!time) { setErrorMsg("Veuillez sélectionner l'heure du trajet."); return; }
              setErrorMsg(''); setStep(3);
            }}
            disabled={!date || !time}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 3: EXACT PICKUP & DROP OFF ADDRESSES */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={MapPin} 
            title="Où retrouver vos passagers ?" 
            description="Soyez précis pour faciliter la rencontre." 
          />

          <div className="space-y-6 mt-8">
            <FormField label={`Point de départ à ${departureCity || 'départ'}`} required>
              <input
                type="text"
                value={departureAddress}
                onChange={(e) => { setDepartureAddress(e.target.value); if (errorMsg) setErrorMsg(''); }}
                placeholder="Ex: Gare Routière de Touba"
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                required
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[12px] font-bold text-[#667085] self-center">Suggestions:</span>
                {["Gare Routière", "Centre-ville", "Station Total", "Grande Mosquée"].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => { setDepartureAddress(`${loc}${departureCity ? ' de ' + departureCity : ''}`); if (errorMsg) setErrorMsg(''); }}
                    className="px-3 py-1.5 rounded-[8px] bg-[#F7FAF9] hover:bg-[#EFF9F6] text-[#667085] hover:text-demandoo-700 text-[12px] font-bold transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label={`Point d'arrivée à ${arrivalCity || 'arrivée'}`}>
              <input
                type="text"
                value={arrivalAddress}
                onChange={(e) => setArrivalAddress(e.target.value)}
                placeholder="Ex: Gare des Baux Maraîchers"
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[12px] font-bold text-[#667085] self-center">Suggestions:</span>
                {["Gare des Baux Maraîchers", "Rond-point Liberté 6", "Centre-ville", "Gare Routière"].map(loc => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setArrivalAddress(loc)}
                    className="px-3 py-1.5 rounded-[8px] bg-[#F7FAF9] hover:bg-[#EFF9F6] text-[#667085] hover:text-demandoo-700 text-[12px] font-bold transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!departureAddress || !departureAddress.trim()) { setErrorMsg(`Le point de départ à ${departureCity} est obligatoire.`); return; }
              setErrorMsg(''); setStep(4);
            }}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 4: VEHICLE INFO */}
      {step === 4 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Car} 
            title="Votre véhicule" 
            description="Les passagers aiment savoir dans quelle voiture ils voyageront." 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
            <FormField label="Marque">
              <input
                type="text"
                value={vehicleMake}
                onChange={(e) => setVehicleMake(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
            <FormField label="Modèle">
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
            <FormField label="Couleur">
              <input
                type="text"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
            <FormField label="Immatriculation">
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full h-[56px] px-4 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-sm font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none"
              />
            </FormField>
          </div>

          <PrimaryButton onClick={() => setStep(5)}>
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 5: NUMBER OF SEATS */}
      {step === 5 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={Users} 
            title="Combien de places proposez-vous ?" 
            description="Indiquez uniquement les places réellement disponibles pour les passagers." 
          />

          <div className="flex flex-col items-center justify-center py-10 mt-4">
            <div className="flex items-center justify-center gap-8">
              <button
                type="button"
                onClick={() => seatsTotal > 1 && setSeatsTotal(seatsTotal - 1)}
                className="w-[60px] h-[60px] rounded-[16px] bg-[#F7FAF9] border border-[#E4EBE8] flex items-center justify-center text-3xl font-black text-[#667085] hover:border-demandoo-500 hover:text-demandoo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={seatsTotal <= 1}
              >
                −
              </button>
              
              <div className="text-center w-32">
                <span className="text-[64px] leading-none font-black text-[#101828] block">{seatsTotal}</span>
                <span className="text-[13px] font-bold text-[#667085] mt-2 block">places disponibles</span>
              </div>
              
              <button
                type="button"
                onClick={() => seatsTotal < 4 && setSeatsTotal(seatsTotal + 1)}
                className="w-[60px] h-[60px] rounded-[16px] bg-[#F7FAF9] border border-[#E4EBE8] flex items-center justify-center text-3xl font-black text-[#667085] hover:border-demandoo-500 hover:text-demandoo-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={seatsTotal >= 4}
              >
                +
              </button>
            </div>
          </div>

          <PrimaryButton onClick={() => setStep(6)}>
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 6: PRICE PER SEAT */}
      {step === 6 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={DollarSign} 
            title="Quel est le prix par passager ?" 
            description="Indiquez le montant demandé pour une place. Le paiement se fera directement entre vous et les passagers." 
          />

          <div className="space-y-6 mt-8">
            <div className="relative flex flex-col items-center">
              <label htmlFor="publish-field-2" className="text-[13px] font-bold text-[#667085] uppercase tracking-wider mb-4">PRIX PAR PASSAGER</label>
              <div className="relative w-full max-w-[400px]">
                <input id="publish-field-2"
                  type="number"
                  min={500}
                  step={500}
                  value={pricePerSeat}
                  onChange={(e) => { setPricePerSeat(parseInt(e.target.value, 10)); if(errorMsg) setErrorMsg(''); }}
                  className="w-full text-center py-6 rounded-[20px] bg-[#F7FAF9] border-2 border-[#DCE5E2] text-4xl font-black text-[#101828] focus:bg-[#FFFFFF] focus:border-demandoo-500 focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] transition-all outline-none"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-black text-[#667085]">FCFA</span>
              </div>
              
              {/* Total indicator */}
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[#EFF9F6] rounded-full border border-demandoo-100">
                <span className="text-[13px] font-bold text-demandoo-800">Soit un total de :</span>
                <span className="text-[14px] font-black text-demandoo-700">{(pricePerSeat * seatsTotal).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            
            <div className="p-4 bg-[#F7FAF9] rounded-[16px] flex items-start gap-3">
              <div className="text-xl">💡</div>
              <p className="text-[13px] text-[#667085] font-medium leading-relaxed">
                Prix conseillé pour le trajet <strong>{departureCity || 'Départ'} ➔ {arrivalCity || 'Arrivée'}</strong> : <strong className="font-bold text-[#101828]">{getSuggestedPrice(departureCity, arrivalCity).min.toLocaleString('fr-FR')} - {getSuggestedPrice(departureCity, arrivalCity).max.toLocaleString('fr-FR')} FCFA</strong>. Demandoo ne prend aucune commission sur ce montant.
              </p>
            </div>
          </div>

          <PrimaryButton 
            onClick={() => {
              if (!pricePerSeat || pricePerSeat < 500) { setErrorMsg("Le prix par place doit être d'au moins 500 FCFA."); return; }
              setErrorMsg(''); setStep(7);
            }}
          >
            Continuer <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 7: RULES & AMENITIES */}
      {step === 7 && (
        <div className="space-y-6 animate-fade-in relative z-10">
          <StepHeader 
            icon={CheckCircle} 
            title="Informations du trajet" 
            description="Quelques options supplémentaires pour vos passagers." 
          />

          <div className="space-y-6 mt-8">
            <FormField label="Bagages acceptés">
              <select
                value={rulesLuggage}
                onChange={(e) => setRulesLuggage(e.target.value)}
                className="w-full h-[60px] px-5 rounded-[14px] bg-[#FFFFFF] border border-[#DCE5E2] text-base font-bold text-[#101828] focus:border-demandoo-500 transition-all outline-none appearance-none"
              >
                <option value="Sacs de taille moyenne autorisés">Moyen (Sacs de voyage)</option>
                <option value="Grands bagages autorisés">Grand (Valises en soute)</option>
                <option value="Petits bagages uniquement">Petit (Sacs à dos uniquement)</option>
              </select>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`cursor-pointer flex items-center p-5 rounded-[16px] border-2 transition-all gap-4 ${rulesSmoking ? 'border-demandoo-500 bg-[#EFF9F6]' : 'border-[#E4EBE8] bg-[#FFFFFF] hover:border-[#DCE5E2]'}`}>
                <input type="checkbox" checked={rulesSmoking} onChange={(e) => setRulesSmoking(e.target.checked)} className="sr-only" />
                <span className="text-3xl">🚬</span>
                <div>
                  <span className={`block font-black text-sm ${rulesSmoking ? 'text-demandoo-800' : 'text-[#101828]'}`}>Fumeur autorisé</span>
                  <span className={`text-[12px] font-medium ${rulesSmoking ? 'text-demandoo-700' : 'text-[#667085]'}`}>Pendant le trajet</span>
                </div>
              </label>

              <label className={`cursor-pointer flex items-center p-5 rounded-[16px] border-2 transition-all gap-4 ${rulesPets ? 'border-demandoo-500 bg-[#EFF9F6]' : 'border-[#E4EBE8] bg-[#FFFFFF] hover:border-[#DCE5E2]'}`}>
                <input type="checkbox" checked={rulesPets} onChange={(e) => setRulesPets(e.target.checked)} className="sr-only" />
                <span className="text-3xl">🐾</span>
                <div>
                  <span className={`block font-black text-sm ${rulesPets ? 'text-demandoo-800' : 'text-[#101828]'}`}>Animaux acceptés</span>
                  <span className={`text-[12px] font-medium ${rulesPets ? 'text-demandoo-700' : 'text-[#667085]'}`}>Avec accord préalable</span>
                </div>
              </label>
            </div>
          </div>

          <PrimaryButton onClick={() => setStep(8)}>
            Vérifier le récapitulatif <ArrowRight className="w-5 h-5" />
          </PrimaryButton>
        </div>
      )}

      {/* STEP 8: RECAP & CONFIRM PUBLISH */}
      {step === 8 && (
        <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fade-in relative z-10">
          <div className="space-y-2 text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
              Vérifiez votre trajet
            </h2>
            <p className="text-[#667085] font-medium text-sm">
              Assurez-vous que toutes les informations sont correctes.
            </p>
          </div>

          <div className="bg-[#FFFFFF] rounded-[20px] border border-[#E4EBE8] overflow-hidden">
            {/* Itinerary Banner */}
            <div className="bg-[#F7FAF9] p-6 text-center border-b border-[#E4EBE8]">
              <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl font-black text-[#101828]">
                <span>{departureCity}</span>
                <ArrowRight className="w-6 h-6 text-[#DCE5E2] shrink-0" />
                <span>{arrivalCity}</span>
              </div>
              <div className="mt-2 text-sm font-bold text-[#667085] uppercase tracking-wider">
                {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {time}
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between py-3 border-b border-[#F0F2F1]">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Point de rencontre</span>
                <div className="text-right">
                  <span className="font-bold text-[#101828] text-[14px]">{departureAddress}</span>
                  <button type="button" onClick={() => setStep(3)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#F0F2F1]">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Places</span>
                <div className="text-right">
                  <span className="font-bold text-[#101828] text-[14px]">{seatsTotal} places</span>
                  <button type="button" onClick={() => setStep(5)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#F0F2F1]">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Prix</span>
                <div className="text-right">
                  <span className="font-black text-[#101828] text-[16px]">{pricePerSeat.toLocaleString('fr-FR')} FCFA <span className="text-[12px] font-medium text-[#667085]">/ passager</span></span>
                  <button type="button" onClick={() => setStep(6)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>

               <div className="flex items-center justify-between py-3">
                <span className="text-[#667085] font-bold text-[13px] uppercase">Véhicule</span>
                <div className="text-right">
                  <span className="font-bold text-[#101828] text-[14px]">{vehicleMake} {vehicleModel}</span>
                  <button type="button" onClick={() => setStep(4)} className="block ml-auto mt-1 text-[12px] font-bold text-demandoo-600 hover:underline">Modifier</button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <PrimaryButton 
              type="submit"
              disabled={isPublishing || isSuccess}
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>Trajet publié ! Redirection...</span>
                </>
              ) : isPublishing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publication en cours...</span>
                </>
              ) : (
                <span>Publier le trajet</span>
              )}
            </PrimaryButton>
            <p className="text-center text-[12px] font-medium text-[#667085] mt-4">
              En publiant ce trajet, il deviendra visible par les passagers sur Demandoo.
            </p>
          </div>
        </form>
      )}
    </TripCreationLayout>
  );
};
