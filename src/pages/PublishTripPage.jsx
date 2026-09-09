import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrips } from '../context/TripContext';
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
  Navigation
} from 'lucide-react';

export const PublishTripPage = () => {
  const { user } = useAuth();
  const { publishTrip } = useTrips();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 8;

  // Form State across 8 Steps
  const [departureCity, setDepartureCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [departureAddress, setDepartureAddress] = useState('');
  const [arrivalAddress, setArrivalAddress] = useState('');
  const [vehicleMake, setVehicleMake] = useState('Peugeot');
  const [vehicleModel, setVehicleModel] = useState('508');
  const [vehicleColor, setVehicleColor] = useState('Gris');
  const [vehiclePlate, setVehiclePlate] = useState('DK-8492-BC');
  const [seatsTotal, setSeatsTotal] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(3500);
  const [rulesLuggage, setRulesLuggage] = useState('Sacs de taille moyenne autorisés');
  const [rulesPets, setRulesPets] = useState(false);
  const [rulesSmoking, setRulesSmoking] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState('Annulation gratuite jusqu\'à 12h avant le départ');

  const [errorMsg, setErrorMsg] = useState('');

  // Check driver authorization before allowing public publication
  const isAllowedToPublish = user?.driver_status === 'VERIFIED' || user?.role === 'admin';

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'passenger') {
      navigate('/');
    } else if (user && !isAllowedToPublish) {
      navigate('/verification-chauffeur');
    }
  }, [user, isAllowedToPublish, navigate]);

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      setErrorMsg("Veuillez sélectionner une date de départ.");
      setStep(2);
      return;
    }

    try {
      const departureDatetime = new Date(`${date}T${time}`).toISOString();
      const newTrip = publishTrip({
        departure_city: departureCity || 'Touba',
        departure_address: departureAddress || 'Gare Routière',
        arrival_city: arrivalCity || 'Dakar',
        arrival_address: arrivalAddress || 'Gare',
        departure_datetime: departureDatetime,
        seats_total: seatsTotal,
        price_per_seat: pricePerSeat,
        rules_luggage: rulesLuggage,
        rules_pets: rulesPets,
        rules_smoking: rulesSmoking,
        cancellation_policy: cancellationPolicy,
        vehicle: {
          make: vehicleMake,
          model: vehicleModel,
          color: vehicleColor,
          plate_number: vehiclePlate,
          seats_count: seatsTotal
        }
      }, user);

      navigate(`/trajet/${newTrip.id}`);
    } catch (err) {
      setErrorMsg("Erreur lors de la publication du trajet.");
    }
  };

  const progressPercentage = ((step - 1) / totalSteps) * 100;

  return (
    <div className="min-h-[85vh] bg-slate-50/50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* HEADER & PROGRESS BAR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/espace-chauffeur')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to="/espace-chauffeur" className="text-sm font-extrabold text-slate-400 hover:text-slate-700 transition-colors">
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

        {/* KYC AUTHORIZATION CHECK WARNING */}
        {!isAllowedToPublish && (
          <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-sm space-y-3 shadow-sm">
            <div className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Vérification KYC requise
            </div>
            <p className="font-medium text-amber-800/80 leading-relaxed">
              Pour garantir la sécurité de notre communauté, vous devez valider vos documents d'identité (CNI, Permis) avant que votre trajet ne soit visible publiquement.
            </p>
            <Link to="/verification-chauffeur" className="inline-block px-5 py-2.5 rounded-xl text-xs font-black bg-amber-600 text-white hover:bg-amber-700 shadow-sm transition-all">
              Vérifier mon profil maintenant
            </Link>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-bold shadow-sm">{errorMsg}</div>
        )}

        {/* MAIN CARD CONTAINER */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          
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
                      onChange={(e) => setDepartureCity(e.target.value)}
                      placeholder="Ex: Touba"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="relative z-10">
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Ville d'arrivée</label>
                  <div className="relative group">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-500 z-10" />
                    <input
                      type="text"
                      list="cities-list-pub"
                      value={arrivalCity}
                      onChange={(e) => setArrivalCity(e.target.value)}
                      placeholder="Ex: Dakar"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <datalist id="cities-list-pub">
                  {INITIAL_CITIES.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
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
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">Heure prévue</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(3)}
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
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">
                    Lieu exact à <span className="text-demandoo-600">{departureCity}</span>
                  </label>
                  <input
                    type="text"
                    value={departureAddress}
                    onChange={(e) => setDepartureAddress(e.target.value)}
                    placeholder="Ex: Gare Routière, croisement X..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2 uppercase tracking-wider ml-1">
                    Lieu exact à <span className="text-demandoo-600">{arrivalCity}</span>
                  </label>
                  <input
                    type="text"
                    value={arrivalAddress}
                    onChange={(e) => setArrivalAddress(e.target.value)}
                    placeholder="Ex: Arrêt Bus Y, Centre-ville..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-base font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-demandoo-500/10 focus:border-demandoo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(4)}
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
                    Prix conseillé pour ce trajet : <strong className="font-black text-demandoo-600">3 500 - 5 000 FCFA</strong>. Cela vous aide à remplir votre voiture plus rapidement.
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

                <div className="grid grid-cols-2 gap-4">
                  <label className={`cursor-pointer flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${rulesSmoking ? 'border-demandoo-500 bg-demandoo-50 text-demandoo-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={rulesSmoking} onChange={(e) => setRulesSmoking(e.target.checked)} className="sr-only" />
                    <span className="text-2xl mb-2">🚬</span>
                    <span className="text-xs font-bold text-center">Fumeur autorisé</span>
                  </label>

                  <label className={`cursor-pointer flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${rulesPets ? 'border-demandoo-500 bg-demandoo-50 text-demandoo-700' : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={rulesPets} onChange={(e) => setRulesPets(e.target.checked)} className="sr-only" />
                    <span className="text-2xl mb-2">🐾</span>
                    <span className="text-xs font-bold text-center">Animaux acceptés</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(8)}
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Vérifier le récapitulatif <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 8: RECAP & CONFIRM PUBLISH */}
          {step === 8 && (
            <form onSubmit={handleFinalSubmit} className="space-y-8 animate-fade-in relative z-10">
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Prêt à publier !
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  Vérifiez une dernière fois vos informations.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 space-y-4 shadow-inner">
                <div className="flex flex-col items-center justify-center text-center space-y-1 pb-4 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{date} à {time}</span>
                  <div className="text-xl font-black text-slate-900 flex items-center gap-3">
                    {departureCity} <ArrowRight className="w-5 h-5 text-slate-300" /> {arrivalCity}
                  </div>
                  <span className="inline-block mt-2 px-3 py-1 bg-demandoo-100 text-demandoo-700 rounded-full font-black text-sm">
                    {pricePerSeat.toLocaleString('fr-FR')} FCFA <span className="font-medium text-xs">/ place</span>
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                  <div>
                    <span className="block text-slate-400 font-bold uppercase mb-1">Véhicule</span>
                    <span className="font-bold text-slate-800">{vehicleMake} {vehicleModel}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase mb-1">Places offertes</span>
                    <span className="font-bold text-slate-800">{seatsTotal} passagers max</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-400 font-bold uppercase mb-1">Point de départ</span>
                    <span className="font-bold text-slate-800">{departureAddress}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-8 py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-700 shadow-lg shadow-demandoo-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Publier le trajet maintenant
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
