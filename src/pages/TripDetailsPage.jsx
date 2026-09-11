import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Info, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Users,
  ShieldAlert
} from 'lucide-react';

export const TripDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById, bookings } = useTrips();
  const { user } = useAuth();

  const trip = getTripById(id);
  const existingBooking = bookings.find(b => b.trip_id === trip?.id && b.passenger_id === user?.id);
  const isAccepted = existingBooking && ['accepted', 'completed'].includes(existingBooking.status);

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

  const handleBookClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/reservation/${trip.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* BACK NAVIGATION */}
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-demandoo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux résultats
      </button>

      {/* HEADER TITLE CARD */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-extrabold text-demandoo-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 shadow-sm">
              Trajet Programmé
            </span>
            <h1 className="text-2xl font-black text-demandoo-dark mt-2">
              {trip.departure_city} → {trip.arrival_city}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Départ prévu le {new Date(trip.departure_datetime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider block">Prix par passager</span>
            <span className="text-2xl font-black text-demandoo-600">
              {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>

        {/* ITINERARY DETAILED TIMELINE */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              <MapPin className="w-4 h-4 text-demandoo-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lieu de rendez-vous (Départ)</span>
              <h4 className="text-sm font-black text-demandoo-dark">{trip.departure_city}</h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{trip.departure_address}</p>
            </div>
          </div>

          <div className="ml-4 pl-7 border-l-2 border-dashed border-demandoo-400/50 py-1 text-xs text-slate-500 flex items-center gap-2 font-bold">
            <Clock className="w-3.5 h-3.5 text-demandoo-600" />
            Durée estimée : {trip.estimated_duration}
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
              <MapPin className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Point d'arrivée</span>
              <h4 className="text-sm font-black text-demandoo-dark">{trip.arrival_city}</h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{trip.arrival_address}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* DRIVER INFO & BADGES (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-black text-demandoo-dark border-b border-slate-100 pb-3">
              Le conducteur
            </h3>

            <div className="flex items-start gap-4">
              <img 
                src={trip.driver?.avatar_url} 
                alt={trip.driver?.full_name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-demandoo-500 shrink-0 shadow-sm"
              />
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-base font-black text-demandoo-dark">{trip.driver?.full_name}</h4>
                  <VerifiedDriverBadge />
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 font-bold">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {trip.driver?.rating} ({trip.driver?.total_trips} trajets)
                  </span>
                  <span>•</span>
                  <span>Permis & CNI Vérifiés</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <IdentityVerifiedBadge />
                  <PhoneVerifiedBadge />
                  <VehicleVerifiedBadge />
                </div>
              </div>
            </div>

            {/* VEHICLE DETAILS CARD */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden text-xs">
              {trip.driver?.vehicle?.image_url && (
                <div className="w-full h-40 bg-slate-200 relative">
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
              
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 text-demandoo-600" />
                  <div>
                    <h5 className="font-extrabold text-demandoo-dark">
                      {trip.driver?.vehicle?.make} {trip.driver?.vehicle?.model} ({trip.driver?.vehicle?.color})
                    </h5>
                    <p className="text-[11px] text-slate-500 font-medium">Véhicule climatisé et entretenu</p>
                  </div>
                </div>
                
                {!trip.driver?.vehicle?.image_url && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-200 text-slate-700 tracking-wider">
                    IMMAT : {formatMaskedPlate(trip.driver?.vehicle?.plate_number)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* TRIP AMENITIES & RULES */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
            <h3 className="text-base font-black text-demandoo-dark border-b border-slate-100 pb-3">
              Conditions de voyage
            </h3>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Bagages autorisés en coffre
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Climatisation à bord
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Véhicule non-fumeur
              </li>
              <li className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Paiement direct au chauffeur
              </li>
            </ul>
          </div>

        </div>

        {/* BOOKING SIDEBAR ACTION CARD (1 col) */}
        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xl sticky top-20 space-y-5">
            <div className="border-b border-slate-100 pb-3 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Disponibilité</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-demandoo-dark flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-demandoo-600" />
                  {trip.seats_available} place(s) restante(s)
                </span>
                <span className="text-xl font-black text-demandoo-600">
                  {trip.price_per_seat.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            {isAccepted ? (
              <div className="space-y-3">
                <a
                  href={`https://wa.me/${trip.driver?.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(`Bonjour, je vous contacte depuis Demandoo concernant votre trajet ${trip.departure_city} → ${trip.arrival_city} prévu le ${new Date(trip.departure_datetime).toLocaleDateString('fr-FR')}. Je suis ${user?.full_name}. Je souhaite confirmer le point de rendez-vous et les modalités du trajet.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.086 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Contacter sur WhatsApp
                </a>
                <a
                  href={`tel:${trip.driver?.phone}`}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Appeler le chauffeur
                </a>
                <p className="text-[10px] text-slate-500 font-medium text-center">
                  Les échanges et paiements réalisés en dehors de Demandoo sont sous la responsabilité du chauffeur et du passager.
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleBookClick}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-demandoo-500 to-demandoo-600 hover:from-demandoo-600 hover:to-demandoo-700 shadow-lg shadow-demandoo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Demander une place
                </button>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1 font-medium mt-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-demandoo-600" />
                    Mise en relation
                  </div>
                  <p>Pas de paiement requis sur l'application. Vous réglerez directement avec le chauffeur.</p>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
