import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  Phone, 
  AlertCircle, 
  Loader2,
  Lock,
  Ticket,
  Download,
  Share2
} from 'lucide-react';

export const BookingPage = () => {
  const { trajetId } = useParams();
  const navigate = useNavigate();
  const { getTripById, createBooking, processPayment } = useTrips();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const trip = getTripById(trajetId);

  // Form & Workflow Steps
  const [step, setStep] = useState(1); // 1: Seat & Pickup, 2: Payment Provider, 3: Processing, 4: Confirmation Ticket
  const [seatsCount, setSeatsCount] = useState(1);
  const [pickupPoint, setPickupPoint] = useState(trip?.departure_address || '');
  const [provider, setProvider] = useState('wave'); // 'wave', 'orange_money', 'ligdicash'
  const [phone, setPhone] = useState(user?.phone || '+221 77 000 00 00');
  
  const [bookingObj, setBookingObj] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!trip) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Trajet introuvable</h2>
        <Link to="/trajets" className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-demandoo-500">
          Retour aux trajets
        </Link>
      </div>
    );
  }

  const totalPrice = trip.price_per_seat * seatsCount;

  // STEP 1 -> STEP 2: CREATE BOOKING & HOLD SEATS
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const newBk = createBooking({
        tripId: trip.id,
        passengerUser: user,
        seatsCount: seatsCount,
        pickupPoint: pickupPoint
      });
      setBookingObj(newBk);
      setStep(2);
    } catch (err) {
      setErrorMessage(err.message || "Erreur lors de la réservation.");
    }
  };

  // STEP 2 -> STEP 3/4: PROCESS WAVE / OM / LIGDICASH PAYMENT (BACKEND CONFIRMATION)
  const handleExecutePayment = async (e) => {
    e.preventDefault();
    if (!bookingObj) return;

    setIsProcessing(true);
    setErrorMessage('');
    setStep(3); // Show secure backend processing loader

    try {
      const result = await processPayment({
        bookingId: bookingObj.id,
        provider: provider,
        user: user,
        amount: totalPrice,
        providerPhone: phone
      });

      setPaymentResult(result);
      setIsProcessing(false);
      setStep(4); // Confirmed ticket screen

      // Trigger Celebration Confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      addNotification({
        title: "Réservation confirmée !",
        message: `Votre billet pour ${trip.departure_city} → ${trip.arrival_city} est validé.`,
        type: "success",
        link: "/mes-reservations"
      });

    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err.message || "Erreur lors du traitement du paiement.");
      setStep(2);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* BACK LINK */}
      {step < 4 && (
        <button 
          onClick={() => step === 1 ? navigate(`/trajet/${trip.id}`) : setStep(1)} 
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-demandoo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? 'Retour au trajet' : 'Changer d\'étape'}
        </button>
      )}

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: SEATS & PICKUP POINT */}
      {step === 1 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-extrabold text-demandoo-600 uppercase tracking-widest block">Étape 1 sur 2</span>
            <h1 className="text-xl font-black text-demandoo-dark">Détails de la réservation</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Sélectionnez le nombre de places et validez votre point de rencontre</p>
          </div>

          {/* TRIP SUMMARY RECAP */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-black text-demandoo-dark text-sm block">{trip.departure_city} → {trip.arrival_city}</span>
              <span className="text-slate-500 font-medium">Conducteur : {trip.driver?.full_name}</span>
            </div>
            <div className="text-right">
              <span className="font-black text-demandoo-600 text-base">{trip.price_per_seat.toLocaleString('fr-FR')} FCFA</span>
              <span className="text-[10px] text-slate-400 font-bold block">par place</span>
            </div>
          </div>

          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Nombre de places réservées</label>
              <select
                value={seatsCount}
                onChange={(e) => setSeatsCount(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 font-bold text-sm bg-white focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 focus:outline-none"
              >
                {Array.from({ length: trip.seats_available }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num} place{num > 1 ? 's' : ''} ({num * trip.price_per_seat} FCFA)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Point de rendez-vous souhaité</label>
              <input
                type="text"
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
                placeholder="Ex: Gare des Beaux Maraîchers"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 focus:outline-none"
                required
              />
            </div>

            {/* TOTAL PRICE CALCULATION */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-900">
              <span className="text-sm font-extrabold">Montant Total à payer :</span>
              <span className="text-xl font-black text-demandoo-600">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-md shadow-demandoo-500/25 active:scale-95 transition-all"
            >
              Continuer vers le paiement sécurisé
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: CHOOSE PAYMENT METHOD (WAVE, OM, LIGDICASH) */}
      {step === 2 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-extrabold text-demandoo-600 uppercase tracking-widest block">Étape 2 sur 2</span>
            <h1 className="text-xl font-black text-demandoo-dark">Paiement Sécurisé au Sénégal</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Sélectionnez votre moyen de paiement et confirmez la transaction</p>
          </div>

          <form onSubmit={handleExecutePayment} className="space-y-6">
            
            {/* PAYMENT PROVIDER SELECTOR */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-700 block">Choisissez votre mode de paiement :</label>
              
              <div className="grid grid-cols-3 gap-3">
                
                {/* WAVE */}
                <button
                  type="button"
                  onClick={() => setProvider('wave')}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    provider === 'wave'
                      ? 'border-demandoo-500 bg-emerald-50/70 ring-2 ring-demandoo-500/20 text-demandoo-dark font-black shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-black text-xs shadow-sm">W</span>
                  <span className="text-xs font-extrabold">Wave Senegal</span>
                </button>

                {/* ORANGE MONEY */}
                <button
                  type="button"
                  onClick={() => setProvider('orange_money')}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    provider === 'orange_money'
                      ? 'border-demandoo-500 bg-emerald-50/70 ring-2 ring-demandoo-500/20 text-demandoo-dark font-black shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-sm">OM</span>
                  <span className="text-xs font-extrabold">Orange Money</span>
                </button>

                {/* LIGDICASH */}
                <button
                  type="button"
                  onClick={() => setProvider('ligdicash')}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                    provider === 'ligdicash'
                      ? 'border-demandoo-500 bg-emerald-50/70 ring-2 ring-demandoo-500/20 text-demandoo-dark font-black shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-sm">LC</span>
                  <span className="text-xs font-extrabold">LigdiCash</span>
                </button>

              </div>
            </div>

            {/* PHONE INPUT FOR PAYMENT */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">
                Numéro de téléphone pour le débit ({provider.toUpperCase()})
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-demandoo-500/20 focus:border-demandoo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* BACKEND VERIFICATION GUARANTEE BANNER */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Lock className="w-4 h-4 text-demandoo-600" />
                Vérification backend obligatoire & anti-fraude
              </div>
              <p className="text-[11px] leading-relaxed font-medium">
                Le paiement sera validé via la passerelle officielle {provider.toUpperCase()}. La réservation ne sera confirmée qu'après accusé de réception du serveur sécurisé.
              </p>
            </div>

            {/* PAYMENT SUM */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-extrabold uppercase block">Total à débiter</span>
                <span className="text-2xl font-black text-demandoo-600">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-lg shadow-demandoo-500/25 active:scale-95 transition-all"
              >
                Payer maintenant ({totalPrice.toLocaleString('fr-FR')} FCFA)
              </button>
            </div>

          </form>
        </div>
      )}

      {/* STEP 3: BACKEND PROCESSING STATE */}
      {step === 3 && (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto shadow-elevated">
          <Loader2 className="w-12 h-12 text-demandoo-500 animate-spin mx-auto" />
          <h3 className="text-lg font-black text-demandoo-dark">Traitement sécurisé du paiement en cours...</h3>
          <p className="text-xs text-slate-500 font-medium">
            Vérification de la transaction avec l'API {provider.toUpperCase()} et confirmation du serveur... Ne fermez pas cette page.
          </p>
        </div>
      )}

      {/* STEP 4: CONFIRMED TICKET */}
      {step === 4 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-elevated space-y-6 animate-fade-in">
          
          <div className="text-center space-y-2 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-demandoo-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-demandoo-dark">Paiement & Réservation Confirmés !</h1>
            <p className="text-xs text-slate-500 font-medium">
              Votre billet électronique de covoiturage Demandoo a été généré avec succès.
            </p>
          </div>

          {/* PASSENGER E-TICKET RECAP */}
          <div className="bg-gradient-to-br from-slate-900 via-demandoo-dark to-slate-900 text-white rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-demandoo-400" />
                <span className="font-black text-sm tracking-wide">BILLET DEMANDOO</span>
              </div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-sm">CONFIRMÉ</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-extrabold block uppercase">Passager</span>
                <span className="font-extrabold text-white text-sm">{user?.full_name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-extrabold block uppercase">Référence Paiement</span>
                <span className="font-extrabold text-demandoo-400 font-mono">{paymentResult?.payment?.provider_reference}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-extrabold block uppercase">Trajet</span>
                <span className="font-extrabold text-white">{trip.departure_city} → {trip.arrival_city}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-extrabold block uppercase">Places & Prix</span>
                <span className="font-extrabold text-white">{seatsCount} place(s) • {totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 text-[10px] font-extrabold block uppercase">Conducteur</span>
                <span className="font-bold text-slate-200">{trip.driver?.full_name} ({trip.driver?.phone})</span>
              </div>
              
              {/* MOCK QR CODE FOR TICKET */}
              <div className="w-12 h-12 bg-white p-1 rounded-lg flex items-center justify-center shadow-md">
                <div className="w-full h-full border-2 border-slate-900 border-dashed rounded flex items-center justify-center font-mono text-[8px] font-black text-slate-900">
                  QR-DM
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/mes-reservations"
              className="flex-1 py-3.5 rounded-2xl text-xs font-black text-white bg-demandoo-500 hover:bg-demandoo-600 shadow-md text-center"
            >
              Voir mes réservations
            </Link>
            <Link
              to="/"
              className="flex-1 py-3.5 rounded-2xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 text-center"
            >
              Retour à l'accueil
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};
