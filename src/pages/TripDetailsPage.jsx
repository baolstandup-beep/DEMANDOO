import React from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { VerifiedDriverBadge, PhoneVerifiedBadge, IdentityVerifiedBadge, VehicleVerifiedBadge } from '../components/common/Badge';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  ShieldCheck, 
  Star, 
  Phone, 
  MessageCircle,
  Info, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Users,
  ShieldAlert,
  Navigation, 
  CreditCard 
} from 'lucide-react';
import { MapView } from '../components/common/MapView';
import { PassengerPaymentModal } from '../components/passenger/PassengerPaymentModal';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById, bookings, loading } = useTrips();
  const { user } = useAuth();

  const trip = getTripById(id);
  const existingBooking = bookings.find(b => b.trip_id === trip?.id && b.passenger_id === user?.id);
  const isAccepted = existingBooking && ['paid', 'confirmed', 'completed', 'accepted'].includes(existingBooking.status);

  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [passengers, setPassengers] = React.useState(1);
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');

  React.useEffect(() => {
    if (paymentStatus === 'success' && trip) {
      // In a real app, this should be validated on the backend.
      // Here we just update the booking status if it exists, or create one.
      alert("Paiement réussi ! Votre réservation est confirmée.");
    } else if (paymentStatus === 'cancel') {
      alert("Le paiement a été annulé.");
    }
  }, [paymentStatus, trip]);

  if (loading && !trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-demandoo-500" />
        <h2 className="text-xl font-bold text-slate-900">Chargement du trajet...</h2>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Trajet introuvable</h2>
        <p className="text-xs text-slate-500">Ce trajet n'existe pas ou a été retiré par le conducteur.</p>
        <Link to="/trajets" className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-demandoo-500">
          Retour aux trajets
        </Link>
      </div>
    );
  }

  // Mask plate number for privacy (e.g. DK-8492-BC -> DK-***-BC)
  const formatMaskedPlate = (plate) => {
    if (!plate) return "DK-***-SN";
    const parts = plate.split('-');
    if (parts.length >= 3) {
      return `${parts[0]}-***-${parts[2]}`;
    }
    return `${plate.substring(0, 2)}-***-${plate.substring(plate.length - 2)}`;
  };

  const generateWhatsAppLink = () => {
    const phone = trip.driver?.phone || '+221770000000'; // Default if missing
    // Format the phone number (remove spaces, ensure country code)
    let formattedPhone = phone.replace(/[^0-9+]/g, '');
    if (formattedPhone.startsWith('00')) formattedPhone = '+' + formattedPhone.substring(2);
    if (!formattedPhone.startsWith('+')) formattedPhone = '+221' + formattedPhone;
    
    const message = `Bonjour, je suis intéressé par votre trajet ${trip.departure_city} - ${trip.arrival_city} prévu le ${new Date(trip.departure_datetime).toLocaleDateString('fr-FR')}. Reste-t-il de la place ?`;
    return `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
      
      {/* BACK NAVIGATION */}
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-1.5 min-h-[40px] px-2 -ml-2 text-xs sm:text-sm font-extrabold text-slate-600 hover:text-demandoo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux résultats
      </button>

      {/* HEADER TITLE CARD */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block text-[10px] sm:text-[11px] font-extrabold text-demandoo-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
              Trajet Programmé
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-demandoo-dark mt-2 break-words">
              {trip.departure_city} → {trip.arrival_city}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              Départ prévu le {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-left sm:text-right bg-demandoo-50/60 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <span className="text-[11px] sm:text-xs text-slate-500 sm:text-slate-400 font-extrabold uppercase tracking-wider block">Prix par passager</span>
            <span className="text-2xl sm:text-3xl font-black text-demandoo-600">
              {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        {/* ITINERARY DETAILED TIMELINE */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              <MapPin className="w-4 h-4 text-demandoo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Lieu de rendez-vous (Départ)</span>
              <h4 className="text-sm sm:text-base font-black text-demandoo-dark">{trip.departure_city}</h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 break-words">{trip.departure_address}</p>
            </div>
          </div>

          <div className="ml-4 pl-6 sm:pl-7 border-l-2 border-dashed border-demandoo-400/50 py-1 text-xs text-slate-500 flex items-center gap-2 font-bold">
            <Clock className="w-3.5 h-3.5 text-demandoo-600 shrink-0" />
            Durée estimée : {trip.estimated_duration}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              <MapPin className="w-4 h-4 text-rose-600" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Point d'arrivée</span>
              <h4 className="text-sm sm:text-base font-black text-demandoo-dark">{trip.arrival_city}</h4>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 break-words">{trip.arrival_address}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DRIVER INFO & BADGES (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-black text-demandoo-dark border-b border-slate-100 pb-3">
              Le conducteur
            </h3>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <img 
                src={trip.driver?.avatar_url} 
                alt={trip.driver?.full_name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-demandoo-500 shrink-0 shadow-sm"
              />
              <div className="space-y-1.5 flex-1 w-full min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base sm:text-lg font-black text-demandoo-dark">{trip.driver?.full_name}</h4>
                  <VerifiedDriverBadge />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 font-bold">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {trip.driver?.rating} ({trip.driver?.total_trips} trajets)
                  </span>
                  <span>•</span>
                  <span>Permis & CNI Vérifiés</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {trip.driver?.driver_status === 'VERIFIED' && (
                    <>
                      <IdentityVerifiedBadge />
                      <PhoneVerifiedBadge />
                      <VehicleVerifiedBadge />
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* VEHICLE DETAILS CARD */}
            <div className="bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 overflow-hidden text-xs">
              {trip.driver?.vehicle?.image_url && (
                <div className="w-full h-44 sm:h-52 bg-slate-200 relative">
                  <img 
                    src={trip.driver?.vehicle?.image_url} 
                    alt={`${trip.driver?.vehicle?.make} ${trip.driver?.vehicle?.model}`} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-700 tracking-wider shadow-sm">
                    IMMAT : {formatMaskedPlate(trip.driver?.vehicle?.plate_number)}
                  </div>
                </div>
              )}
              
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 text-demandoo-600 shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-demandoo-dark text-sm">
                      {trip.driver?.vehicle?.make} {trip.driver?.vehicle?.model} ({trip.driver?.vehicle?.color})
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium">Véhicule climatisé et entretenu</p>
                  </div>
                </div>
                
                {!trip.driver?.vehicle?.image_url && (
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-200 text-slate-700 tracking-wider">
                    IMMAT : {formatMaskedPlate(trip.driver?.vehicle?.plate_number)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* SUIVI GPS EN DIRECT */}
          {trip.driver?.is_driver_active && trip.driver?.latitude && trip.driver?.longitude && (
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-demandoo-dark flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  Position du chauffeur
                </h3>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse border border-emerald-100">
                  En Direct
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Le chauffeur est actuellement en ligne. Sa position GPS se met à jour toutes les 15 secondes.
              </p>
              <MapView latitude={trip.driver.latitude} longitude={trip.driver.longitude} label={trip.driver.full_name} height="250px" />
            </div>
          )}

          {/* TRIP AMENITIES & RULES */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-black text-demandoo-dark border-b border-slate-100 pb-3">
              Conditions de voyage
            </h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-bold text-slate-700">
              <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Bagages autorisés en coffre
              </li>
              <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Climatisation à bord
              </li>
              <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Véhicule non-fumeur
              </li>
              <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Paiement en ligne sécurisé (Wave / OM)
              </li>
            </ul>
          </div>

        </div>

        {/* CONTACT SIDEBAR ACTION CARD (1 col) */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xl lg:sticky lg:top-24 space-y-5">
            <div className="border-b border-slate-100 pb-3 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Disponibilité</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-demandoo-dark flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-demandoo-600" />
                  {trip.seats_available} place(s) restante(s)
                </span>
                <span className="text-xl sm:text-2xl font-black text-demandoo-600">
                  {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    setShowPaymentModal(true);
                  }
                }}
                disabled={trip.seats_available < 1 || isAccepted}
                className="w-full min-h-[48px] py-3.5 sm:py-4 px-4 rounded-2xl text-sm sm:text-base font-black text-white bg-demandoo-500 hover:bg-demandoo-600 shadow-lg shadow-demandoo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-5 h-5 shrink-0" />
                <span>{isAccepted ? 'Déjà réservé' : 'Réserver et Payer'}</span>
              </button>
              
              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] py-3.5 sm:py-4 px-4 rounded-2xl text-sm sm:text-base font-black text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>Contacter le chauffeur</span>
              </a>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1 font-medium">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-demandoo-600 shrink-0" />
                Paiement 100% sécurisé
              </div>
              <p>Votre paiement est conservé en toute sécurité jusqu'à la fin du trajet via Wave ou Orange Money.</p>
            </div>
          </div>
        </div>

      </div>

      <PassengerPaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        trip={trip} 
        passengers={passengers} 
      />
    </div>
  );
};
