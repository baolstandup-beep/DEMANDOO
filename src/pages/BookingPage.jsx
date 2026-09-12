import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  ArrowLeft, 
  Phone, 
  AlertCircle, 
  Loader2,
  Lock,
  Ticket,
  MessageCircle,
  Info,
  Car,
  User,
  Plus,
  Minus,
  Smartphone,
  CreditCard,
  Zap
} from 'lucide-react';
import { createWaveCheckout, createBictorysCharge } from '../services/afrotoolsService';

export const BookingPage = () => {
  const { trajetId } = useParams();
  const navigate = useNavigate();
  const { getTripById, createBooking } = useTrips();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const trip = getTripById(trajetId);

  // Form & Workflow Steps
  // 1: Trajet, 2: Informations, 3: Places, 4: Confirmation, 5: Contact
  const [step, setStep] = useState(1);
  const [seatsCount, setSeatsCount] = useState(1);
  const [passengerInfo, setPassengerInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  
  const [bookingObj, setBookingObj] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wave'); // 'wave' | 'orange' | 'cash'

  useEffect(() => {
    if (user && user.role !== 'admin') {
      const parts = (user.full_name || '').split(' ');
      setPassengerInfo({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        phone: user.phone || '',
        address: user.address || '' // assuming user has address
      });
    }
  }, [user]);

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

  const estimatedTotal = trip.price_per_seat * seatsCount;

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 2) {
      if (!passengerInfo.firstName || !passengerInfo.lastName || !passengerInfo.phone || !passengerInfo.address) {
        setErrorMessage("Veuillez remplir tous les champs obligatoires.");
        return;
      }
      const cleanPhone = passengerInfo.phone.replace(/[^+\d]/g, '');
      if (cleanPhone.length < 9) {
        setErrorMessage("Veuillez saisir un numéro de téléphone valide (ex: 77 000 00 00).");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(`/trajet/${trip.id}`);
    }
  };

  const handleConfirmRequest = async () => {
    setErrorMessage('');
    
    if (!user || user.role === 'admin') {
      setErrorMessage("Veuillez vous connecter en tant que passager pour réserver.");
      return;
    }

    setIsProcessing(true);

    try {
      let paymentResult = null;
      if (paymentMethod === 'wave') {
        paymentResult = await createWaveCheckout({
          amount: estimatedTotal,
          clientReference: `demandoo_trip_${trip.id}_${Date.now()}`,
          clientPhone: passengerInfo.phone
        });
      } else if (paymentMethod === 'bictorys') {
        paymentResult = await createBictorysCharge({
          amount: estimatedTotal,
          clientReference: `demandoo_bictorys_${trip.id}_${Date.now()}`,
          customerName: `${passengerInfo.firstName} ${passengerInfo.lastName}`,
          customerPhone: passengerInfo.phone,
          customerEmail: user.email
        });
      }

      const newBk = await createBooking({
        tripId: trip.id,
        passengerUser: user,
        passengerInfo: passengerInfo,
        seatsCount: seatsCount
      });
      
      setBookingObj(newBk);
      setIsProcessing(false);
      setStep(5); // Contact Chauffeur

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const notifTitle = paymentMethod === 'wave' 
        ? "Paiement Wave Validé !" 
        : paymentMethod === 'bictorys'
        ? "Paiement Bictorys / Orange Money Validé !"
        : "Demande envoyée !";

      const notifMsg = paymentMethod === 'cash'
        ? `Votre demande pour ${trip.departure_city} a été transmise au conducteur.`
        : `Votre paiement de ${estimatedTotal.toLocaleString('fr-FR')} FCFA a été confirmé via ${paymentMethod === 'wave' ? 'Wave' : 'Bictorys (Orange Money / CB)'}.`;

      addNotification({
        title: notifTitle,
        message: notifMsg,
        type: "success",
        link: "/mes-reservations"
      });

    } catch (err) {
      setIsProcessing(false);
      setErrorMessage(err.message || "Erreur lors de la réservation.");
    }
  };

  const whatsappMessage = `Bonjour ${trip.driver?.full_name?.split(' ')[0] || 'chauffeur'},\n\nJe vous contacte depuis Demandoo concernant votre trajet :\n${trip.departure_city} → ${trip.arrival_city}\n${new Date(trip.departure_datetime).toLocaleDateString('fr-FR')} à ${new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}\n\nJe souhaite réserver ${seatsCount} place${seatsCount > 1 ? 's' : ''}.\n\nNom : ${passengerInfo.firstName} ${passengerInfo.lastName}\nTéléphone : ${passengerInfo.phone}\n\nMontant estimé : ${estimatedTotal.toLocaleString('fr-FR')} FCFA.\n\nMerci de me confirmer la disponibilité et les modalités du trajet.`;

  const renderStepIndicator = () => {
    const steps = [
      { num: 1, label: 'Trajet' },
      { num: 2, label: 'Infos' },
      { num: 3, label: 'Places' },
      { num: 4, label: 'Confirmation' },
      { num: 5, label: 'Contact' },
    ];
    
    return (
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-demandoo-500 rounded-full z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map(s => (
          <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= s.num ? 'bg-demandoo-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-[10px] font-bold hidden sm:block ${step >= s.num ? 'text-demandoo-700' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* BACK LINK */}
      {step < 5 && (
        <button 
          onClick={handlePrevStep} 
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-demandoo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? 'Retour au trajet' : 'Étape précédente'}
        </button>
      )}

      {renderStepIndicator()}

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: TRAJET */}
      {step === 1 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-demandoo-dark">Résumé du trajet</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Vérifiez les détails du trajet avant de continuer.</p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className="w-4 h-4 rounded-full border-4 border-demandoo-500"></div>
                <div className="w-0.5 h-10 bg-slate-200"></div>
                <div className="w-4 h-4 rounded-full bg-demandoo-500"></div>
              </div>
              <div className="space-y-6 flex-1">
                <div>
                  <h4 className="text-base font-black text-demandoo-dark">{trip.departure_city}</h4>
                  <p className="text-xs text-slate-500">{trip.departure_address}</p>
                </div>
                <div>
                  <h4 className="text-base font-black text-demandoo-dark">{trip.arrival_city}</h4>
                  <p className="text-xs text-slate-500">{trip.arrival_address}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date & Heure</span>
                <p className="text-sm font-black text-slate-700">
                  {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
                  à {new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prix / place</span>
                <p className="text-lg font-black text-demandoo-600">{trip.price_per_seat.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Véhicule</span>
                <p className="text-sm font-black text-slate-700 flex items-center gap-1">
                  <Car className="w-4 h-4 text-slate-400" />
                  {trip.driver?.vehicle?.make} {trip.driver?.vehicle?.model}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Disponibilité</span>
                <p className="text-sm font-black text-emerald-600">{trip.seats_available} places disponibles</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-md transition-all flex items-center justify-center gap-2"
          >
            Continuer
          </button>
        </div>
      )}

      {/* STEP 2: INFORMATIONS PASSAGER */}
      {step === 2 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-demandoo-dark">Vos informations</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Le chauffeur a besoin de vos coordonnées pour organiser le départ.</p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Prénom *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={passengerInfo.firstName}
                    onChange={(e) => setPassengerInfo({...passengerInfo, firstName: e.target.value})}
                    placeholder="Ex: Cheikh"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-slate-200 text-sm font-bold text-slate-900 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Nom *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={passengerInfo.lastName}
                    onChange={(e) => setPassengerInfo({...passengerInfo, lastName: e.target.value})}
                    placeholder="Ex: Diop"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-slate-200 text-sm font-bold text-slate-900 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Téléphone *</label>
              <div className="relative flex">
                <input
                  type="tel"
                  value={passengerInfo.phone}
                  onChange={(e) => setPassengerInfo({...passengerInfo, phone: e.target.value})}
                  placeholder="+221 77 000 00 00"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/5 border border-slate-200 text-sm font-bold text-slate-900 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Adresse / Quartier *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={passengerInfo.address}
                  onChange={(e) => setPassengerInfo({...passengerInfo, address: e.target.value})}
                  placeholder="Ex: Touba Darou Salam"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-slate-200 text-sm font-bold text-slate-900 focus:border-demandoo-500 focus:ring-2 focus:ring-demandoo-500/20 transition-all outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-md transition-all flex items-center justify-center gap-2"
          >
            Continuer
          </button>
        </div>
      )}

      {/* STEP 3: NOMBRE DE PLACES */}
      {step === 3 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-demandoo-dark">Nombre de places</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Sélectionnez le nombre de places que vous souhaitez réserver.</p>
          </div>

          <div className="flex flex-col items-center py-6 space-y-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Combien de places ?</span>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setSeatsCount(Math.max(1, seatsCount - 1))}
                className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                disabled={seatsCount <= 1}
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-4xl font-black text-demandoo-dark w-12 text-center">{seatsCount}</span>
              <button 
                onClick={() => setSeatsCount(Math.min(trip.seats_available, seatsCount + 1))}
                className="w-12 h-12 rounded-full border-2 border-demandoo-500 bg-demandoo-50 flex items-center justify-center text-demandoo-600 hover:bg-demandoo-100 transition-colors disabled:opacity-50 disabled:border-slate-200 disabled:bg-transparent disabled:text-slate-400"
                disabled={seatsCount >= trip.seats_available}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {seatsCount >= trip.seats_available && (
              <span className="text-[10px] text-amber-500 font-bold">Maximum de places disponibles atteint.</span>
            )}
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Prix par place :</span>
              <span>{trip.price_per_seat.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Nombre de places :</span>
              <span>{seatsCount}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-black text-slate-900">Montant estimatif :</span>
              <span className="text-xl font-black text-demandoo-600">{estimatedTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Le règlement du trajet s'effectue directement avec le chauffeur.</strong> Ce montant est uniquement informatif.
            </p>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-4 rounded-2xl text-sm font-black text-white bg-demandoo-600 hover:bg-demandoo-500 shadow-md transition-all flex items-center justify-center gap-2"
          >
            Continuer
          </button>
        </div>
      )}

      {/* STEP 4: CONFIRMATION */}
      {step === 4 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-xl font-black text-demandoo-dark">Confirmation</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Veuillez vérifier les informations avant d'envoyer la demande.</p>
          </div>

          <div className="space-y-6">
            
            <div className="space-y-2">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Trajet</h4>
              <p className="text-sm font-black text-slate-900">{trip.departure_city} → {trip.arrival_city}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Date</h4>
              <p className="text-sm font-black text-slate-900">
                {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à {new Date(trip.departure_datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Passager</h4>
              <div className="text-sm font-black text-slate-900">
                <p>{passengerInfo.firstName} {passengerInfo.lastName}</p>
                <p className="text-slate-500">{passengerInfo.phone}</p>
                <p className="text-slate-500">{passengerInfo.address}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Réservation</h4>
              <p className="text-sm font-black text-slate-900">{seatsCount} place(s)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Prix</h4>
                <p className="text-xs font-bold text-slate-600">{trip.price_per_seat.toLocaleString('fr-FR')} FCFA / place</p>
              </div>
              <div className="text-right">
                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Total Estimé</h4>
                <p className="text-lg font-black text-demandoo-600">{estimatedTotal.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>

            {/* SÉLECTION DU MODE DE PAIEMENT */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-demandoo-500" /> Mode de règlement
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wave')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'wave'
                      ? 'border-[#1DC3E8] bg-sky-50/50 shadow-sm ring-2 ring-[#1DC3E8]/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[#1DC3E8] text-white flex items-center justify-center font-black text-sm shadow-sm">
                      🐧
                    </div>
                    {paymentMethod === 'wave' && (
                      <CheckCircle2 className="w-5 h-5 text-[#1DC3E8]" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">Wave</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Instantané, 0% frais</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bictorys')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'bictorys'
                      ? 'border-orange-500 bg-orange-50/40 shadow-sm ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                      🟧
                    </div>
                    {paymentMethod === 'bictorys' && (
                      <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">Bictorys</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Orange Money / CB</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'cash'
                      ? 'border-demandoo-500 bg-emerald-50/40 shadow-sm ring-2 ring-demandoo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                      💵
                    </div>
                    {paymentMethod === 'cash' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900">Espèces</h5>
                    <p className="text-[11px] text-slate-500 font-medium">Direct au chauffeur</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Garantie de voyage Demandoo : vérification d'identité et contact direct dès acceptation.</span>
            </div>

          </div>

          <button
            onClick={handleConfirmRequest}
            disabled={isProcessing}
            className="w-full py-4 rounded-2xl text-sm font-black text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-md shadow-demandoo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : paymentMethod === 'wave' ? (
              <span>Payer avec Wave ({estimatedTotal.toLocaleString('fr-FR')} FCFA)</span>
            ) : paymentMethod === 'bictorys' ? (
              <span>Payer via Bictorys / Orange Money ({estimatedTotal.toLocaleString('fr-FR')} FCFA)</span>
            ) : (
              "Confirmer ma demande"
            )}
          </button>
        </div>
      )}

      {/* STEP 5: CONTACT CHAUFFEUR */}
      {step === 5 && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-elevated space-y-6 animate-fade-in">
          
          <div className="text-center space-y-2 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-demandoo-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-black text-demandoo-dark">Demande envoyée</h1>
            <p className="text-xs text-slate-500 font-medium">
              Votre demande a bien été transmise au chauffeur.
            </p>
          </div>

          {/* DRIVER CARD */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
            <img 
              src={trip.driver?.avatar_url} 
              alt={trip.driver?.full_name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-demandoo-500 shrink-0"
            />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">{trip.driver?.full_name}</h4>
              <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                ⭐ {trip.driver?.rating} ({trip.driver?.total_trips} trajets)
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">{trip.driver?.phone}</p>
              
              <div className="flex flex-col gap-1 mt-2">
                {trip.driver?.is_identity_verified && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Identité vérifiée
                  </span>
                )}
                {trip.driver?.is_phone_verified && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Téléphone vérifié
                  </span>
                )}
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Permis vérifié
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center space-y-2">
            <ShieldCheck className="w-6 h-6 text-slate-400 mx-auto" />
            <h4 className="text-sm font-black text-slate-900">En attente de confirmation</h4>
            <p className="text-xs text-slate-500 font-medium">
              Pour des raisons de sécurité, les coordonnées du chauffeur vous seront communiquées dès qu'il aura accepté votre demande.
            </p>
          </div>

          <div className="pt-4 flex justify-center border-t border-slate-100">
            <Link
              to="/mes-reservations"
              className="text-xs font-bold text-demandoo-600 hover:text-demandoo-700"
            >
              Voir mes réservations
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};
